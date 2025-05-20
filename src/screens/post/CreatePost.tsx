import React, {useState, useRef, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Video from 'react-native-video';
import {BASE_URL} from '../../utils/constant';
import axios from 'axios';
import {getDataFromStore} from '../../store';
import * as Burnt from 'burnt';
import {
  Canvas,
  Image as SkiaImageComponent,
  Skia,
  useImage,
  useCanvasRef,
} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import {captureRef} from 'react-native-view-shot';

const {width: screenWidth} = Dimensions.get('window');

const CreatePost = ({route, navigation}) => {
  const {media} = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [activeFilter, setActiveFilter] = useState('brightness');
  const videoRef = useRef(null);
  const [imagePath, setImagePath] = useState(null);
  const [filteredImagePath, setFilteredImagePath] = useState(null);
  const [imageReady, setImageReady] = useState(false);
  const canvasRef = useCanvasRef();
  const canvasViewRef = useRef(null); // React ref for the Canvas view wrapper
  
  const isVideo = media?.type?.includes('video');

  // Load the image with Skia only after we have a valid path
  const skiaImage = useImage(imagePath);

  // Track when the image is loaded successfully
  useEffect(() => {
    if (skiaImage) {
      console.log('Skia image loaded successfully');
      setImageReady(true);
    } else {
      console.log('Skia image is still null');
    }
  }, [skiaImage]);

  // Handle resolving the image path, especially for content:// URIs
  useEffect(() => {
    const resolveImagePath = async () => {
      if (!isVideo) {
        try {
          // For content:// URIs, we need to copy the file to a local path
          if (media?.uri?.startsWith('content://')) {
            const filename = `temp-image-${Date.now()}.jpg`;
            const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

            console.log('Copying from:', media.uri);
            console.log('Copying to:', destPath);

            await RNFS.copyFile(media.uri, destPath);

            // For Android, we need the file:// prefix for Skia
            const finalPath =
              Platform.OS === 'android' ? `file://${destPath}` : destPath;

            console.log('Setting image path to:', finalPath);
            setImagePath(finalPath);
          } else {
            // For file:// URIs, we can use them directly on iOS
            // For Android, we might need to strip the file:// prefix for certain operations
            const finalPath =
              Platform.OS === 'android' && media.uri.startsWith('file://')
                ? media.uri
                : media.uri;

            console.log('Setting direct image path to:', finalPath);
            setImagePath(finalPath);
          }
        } catch (err) {
          console.error('Failed to resolve image path:', err);
          Alert.alert('Image Error', 'Failed to load image. Please try again.');
        }
      }
    };

    if (media?.uri) {
      resolveImagePath();
    }
  }, [media, isVideo]);

  // Function to capture the filtered image using react-native-view-shot
  const captureFilteredImage = async () => {
    if (!canvasViewRef.current || !skiaImage) {
      console.error('Canvas view ref or skia image not ready');
      return null;
    }
    
    try {
      // Use react-native-view-shot to capture the Canvas view
      const uri = await captureRef(canvasViewRef, {
        format: 'png',
        quality: 1,
        result: 'file',
        transparent: true,
      });

      console.log('Filtered image captured at:', uri);
      return uri;
    } catch (error) {
      console.error('Error capturing filtered image:', error);
      return null;
    }
  };

  const createColorMatrix = (brightnessVal, contrastVal, saturationVal) => {
    // Step 1: Calculate saturation matrix values
    const lumR = 0.2126;
    const lumG = 0.7152;
    const lumB = 0.0722;
    const invSat = 1 - saturationVal;
    const r = lumR * invSat;
    const g = lumG * invSat;
    const b = lumB * invSat;

    // Step 2: Create brightness and contrast adjusted matrix
    // For brightness adjustment (scale values to make effect more pronounced)
    const brightnessAdjust = (brightnessVal - 1) * 0.003;

    return [
      contrastVal * (r + saturationVal),
      contrastVal * g,
      contrastVal * b,
      0,
      brightnessAdjust * 255, // Scale brightness effect
      contrastVal * r,
      contrastVal * (g + saturationVal),
      contrastVal * b,
      0,
      brightnessAdjust * 255, // Scale brightness effect
      contrastVal * r,
      contrastVal * g,
      contrastVal * (b + saturationVal),
      0,
      brightnessAdjust * 255, // Scale brightness effect
      0,
      0,
      0,
      1,
      0,
    ];
  };

  const paint = useMemo(() => {
    const p = Skia.Paint();
    const matrix = createColorMatrix(brightness, contrast, saturation);
    const colorFilter = Skia.ColorFilter.MakeMatrix(matrix);
    p.setColorFilter(colorFilter);
    return p;
  }, [brightness, contrast, saturation]);

  const handleSubmitPost = async () => {
    if (isSubmitting) return;

    if (!caption.trim()) {
      Alert.alert('Missing Caption', 'Please add a caption to your post');
      return;
    }

    setIsSubmitting(true);

    try {
      // If filters have been applied and we're working with an image, capture the filtered version
      let finalImagePath = media.uri;

      if (
        !isVideo &&
        (brightness !== 1 || contrast !== 1 || saturation !== 1)
      ) {
        console.log('Capturing filtered image for upload...');
        const capturedPath = await captureFilteredImage();
        if (capturedPath) {
          finalImagePath = capturedPath;
          setFilteredImagePath(capturedPath);
          console.log('Using filtered image:', finalImagePath);
        } else {
          console.warn('Could not capture filtered image, using original');
        }
      }

      const formData = new FormData();
      formData.append('body', caption);

      const ext = isVideo ? media.filename?.split('.').pop() || 'mp4' : 'png';
      const mimeType = isVideo ? `video/${ext}` : 'image/png';

      formData.append('postUrl', {
        uri:
          Platform.OS === 'ios'
            ? finalImagePath.replace('file://', '')
            : finalImagePath,
        type: mimeType,
        name: `post-media-${Date.now()}.${ext}`,
      });

      console.log('Uploading media from path:', finalImagePath);

      const token = getDataFromStore('token');
      const response = await axios.post(
        `${BASE_URL}/post/create-post`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        Burnt.toast({title: 'Post Created Successfully!', preset: 'done'});
        navigation.navigate('Home', {newPost: response.data.post});
      } else {
        throw new Error(response.data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post submission error:', err);
      Alert.alert('Post Failed', err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFilters = () => {
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
  };

  // Function to handle slider value change based on active filter
  const handleSliderChange = (value) => {
    switch (activeFilter) {
      case 'brightness':
        setBrightness(value);
        break;
      case 'contrast':
        setContrast(value);
        break;
      case 'saturation':
        setSaturation(value);
        break;
      default:
        break;
    }
  };

  // Function to get current slider value based on active filter
  const getCurrentSliderValue = () => {
    switch (activeFilter) {
      case 'brightness':
        return brightness;
      case 'contrast':
        return contrast;
      case 'saturation':
        return saturation;
      default:
        return 1;
    }
  };

  // Function to get min slider value based on active filter
  const getMinSliderValue = () => {
    switch (activeFilter) {
      case 'brightness':
        return 0;
      case 'contrast':
        return 0.2;
      case 'saturation':
        return 0;
      default:
        return 0;
    }
  };

  // Get active filter label for display
  const getActiveFilterLabel = () => {
    switch (activeFilter) {
      case 'brightness':
        return `Brightness: ${brightness.toFixed(1)}`;
      case 'contrast':
        return `Contrast: ${contrast.toFixed(1)}`;
      case 'saturation':
        return `Saturation: ${saturation.toFixed(1)}`;
      default:
        return '';
    }
  };

  // Function to get max slider value based on active filter
  const getMaxSliderValue = () => {
    switch (activeFilter) {
      case 'brightness':
        return 2.0;
      case 'contrast':
        return 2.0;
      case 'saturation':
        return 2.0;
      default:
        return 2.0;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            onPress={handleSubmitPost}
            style={[
              styles.postButton,
              (!caption.trim() || isSubmitting) && styles.disabledButton,
            ]}
            disabled={!caption.trim() || isSubmitting}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mediaPreviewContainer}>
          {isVideo ? (
            <TouchableOpacity
              onPress={() => setIsPaused(!isPaused)}
              style={styles.videoContainer}
              activeOpacity={1}>
              <Video
                ref={videoRef}
                source={{uri: media.uri}}
                style={styles.mediaPreviewVideo}
                resizeMode="contain"
                repeat
                paused={isPaused}
              />
              {isPaused && (
                <View style={styles.playPauseButton}>
                  <View style={styles.playTriangle} />
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <>
              {skiaImage ? (
                <View 
                  ref={canvasViewRef}
                  style={styles.skiaWrapper}
                  collapsable={false}>
                  <Canvas ref={canvasRef} style={styles.skiaCanvas}>
                    <SkiaImageComponent
                      image={skiaImage}
                      x={0}
                      y={0}
                      width={screenWidth}
                      height={screenWidth}
                      fit="contain"
                      paint={paint}
                    />
                  </Canvas>
                </View>
              ) : (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#D4ACFB" />
                  <Text style={styles.loadingText}>Loading image...</Text>
                </View>
              )}
            </>
          )}
        </View>

        {!isVideo && (
          <TouchableOpacity
            style={[
              styles.filterToggleButton,
              !skiaImage && styles.disabledButton,
            ]}
            onPress={() => setShowFilters(!showFilters)}
            disabled={!skiaImage}>
            <Text style={styles.filterButtonText}>
              {showFilters ? 'Done' : 'Filters'}
            </Text>
          </TouchableOpacity>
        )}

        {showFilters && !isVideo && (
          <View style={styles.filterControlsContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterHeaderText}>Image Filters</Text>
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Option Boxes */}
            <View style={styles.filterOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.filterOptionBox,
                  activeFilter === 'brightness' && styles.activeFilterBox,
                ]}
                onPress={() => setActiveFilter('brightness')}>
                <View style={styles.filterIcon}>
                  {/* Icon for brightness */}
                  <View style={styles.brightnessIcon} />
                </View>
                <Text style={styles.filterOptionText}>Brightness</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOptionBox,
                  activeFilter === 'contrast' && styles.activeFilterBox,
                ]}
                onPress={() => setActiveFilter('contrast')}>
                <View style={styles.filterIcon}>
                  {/* Icon for contrast */}
                  <View style={styles.contrastIcon}>
                    <View style={styles.contrastDark} />
                    <View style={styles.contrastLight} />
                  </View>
                </View>
                <Text style={styles.filterOptionText}>Contrast</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOptionBox,
                  activeFilter === 'saturation' && styles.activeFilterBox,
                ]}
                onPress={() => setActiveFilter('saturation')}>
                <View style={styles.filterIcon}>
                  {/* Icon for saturation */}
                  <View style={styles.saturationIcon}>
                    <View style={styles.saturationColor1} />
                    <View style={styles.saturationColor2} />
                    <View style={styles.saturationColor3} />
                  </View>
                </View>
                <Text style={styles.filterOptionText}>Saturation</Text>
              </TouchableOpacity>
            </View>

            {/* Single slider that adjusts the active filter */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>{getActiveFilterLabel()}</Text>
              <Slider
                style={styles.slider}
                minimumValue={getMinSliderValue()}
                maximumValue={getMaxSliderValue()}
                step={0.1}
                value={getCurrentSliderValue()}
                onValueChange={handleSliderChange}
                minimumTrackTintColor="#D4ACFB"
                maximumTrackTintColor="#FFFFFF"
                thumbTintColor="#D4ACFB"
              />
            </View>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.captionContainerWrapper}>
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor="#353030"
            multiline
            value={caption}
            onChangeText={setCaption}
          />
        </View>
      </KeyboardAvoidingView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Posting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#353030'},
  container: {flex: 1, backgroundColor: '#353030'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#353030',
    zIndex: 1,
  },
  headerTitle: {fontSize: 18, fontWeight: 'bold', color: 'white'},
  backButton: {paddingHorizontal: 10},
  backButtonText: {color: 'white', fontSize: 16},
  postButton: {paddingHorizontal: 10},
  postButtonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
  disabledButton: {opacity: 0.5},
  mediaPreviewContainer: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#353030',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skiaWrapper: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreviewVideo: {width: '100%', height: '100%'},
  playPauseButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: 'white',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  skiaCanvas: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: 'transparent',
  },
  filterToggleButton: {
    position: 'absolute',
    bottom: 300,
    left: 5,
    backgroundColor: '#D4ACFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 2,
  },
  filterButtonText: {color: '#353030', fontWeight: 'bold'},
  filterControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#353030',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#D4ACFB',
    zIndex: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterHeaderText: {color: 'white', fontWeight: 'bold', fontSize: 16},
  resetButton: {
    backgroundColor: 'rgba(212,172,251,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  resetText: {color: '#D4ACFB', fontWeight: 'bold', fontSize: 14},
  
  // Filter options row
  filterOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterOptionBox: {
    width: screenWidth / 3.5,
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterBox: {
    backgroundColor: '#D4ACFB',
    borderWidth: 2,
    borderColor: 'white',
  },
  filterIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterOptionText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Icons for filters
  brightnessIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFCC33',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  contrastIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  contrastDark: {
    width: 12,
    height: 24,
    backgroundColor: '#000',
  },
  contrastLight: {
    width: 12,
    height: 24,
    backgroundColor: '#FFF',
  },
  saturationIcon: {
    flexDirection: 'row',
    height: 24,
    width: 24,
  },
  saturationColor1: {
    flex: 1,
    backgroundColor: '#FF3B30',
  },
  saturationColor2: {
    flex: 1,
    backgroundColor: '#34C759',
  },
  saturationColor3: {
    flex: 1,
    backgroundColor: '#007AFF',
  },

  sliderContainer: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  sliderLabel: {
    color: 'white', 
    marginBottom: 5, 
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%', 
    height: 40,
  },
  captionContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  captionContainer: {backgroundColor: '#353030'},
  captionInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#D4ACFB',
    color: '#353030',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {marginTop: 10, fontSize: 16, color: 'white'},
});

export default CreatePost;