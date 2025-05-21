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
  ScrollView,
  StatusBar,
  FlatList,
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
  BlurMask,
  Group,
} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import {captureRef} from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Feather';

const {width: screenWidth} = Dimensions.get('window');

// Predefined video filters
const VIDEO_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    icon: 'circle',
    style: {},
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: 'sun',
    style: {
      filter: 'brightness(1.1) sepia(0.3)',
      tint: 'rgba(255, 160, 0, 0.2)',
    },
  },
  {
    id: 'cool',
    name: 'Cool',
    icon: 'cloud-snow',
    style: {
      filter: 'brightness(1.1) saturate(1.1)',
      tint: 'rgba(0, 160, 255, 0.2)',
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: 'film',
    style: {
      filter: 'sepia(0.5) contrast(1.1)',
      tint: 'rgba(255, 220, 180, 0.3)',
    },
  },
  {
    id: 'monochrome',
    name: 'B&W',
    icon: 'eye',
    style: {
      filter: 'grayscale(1)',
    },
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    icon: 'sunset',
    style: {
      filter: 'contrast(1.5) brightness(0.9)',
    },
  },
];

const CreatePost = ({route, navigation}) => {
  const {media} = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [blur, setBlur] = useState(0);
  const [activeFilter, setActiveFilter] = useState('brightness');
  // For video filters
  const [activeVideoFilter, setActiveVideoFilter] = useState('normal');
  const videoRef = useRef(null);
  const [imagePath, setImagePath] = useState(null);
  const [filteredImagePath, setFilteredImagePath] = useState(null);
  const [imageReady, setImageReady] = useState(false);
  const canvasRef = useCanvasRef();
  const canvasViewRef = useRef(null);

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
        (brightness !== 1 || contrast !== 1 || saturation !== 1 || blur > 0)
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

      // Note: For video, we'll just upload the original video 
      // In a real app, you'd process the video with the filter applied server-side
      // or use a video processing library

      const formData = new FormData();
      formData.append('body', caption);

      // For video, we might want to store the filter ID to apply server-side
      if (isVideo && activeVideoFilter !== 'normal') {
        formData.append('videoFilter', activeVideoFilter);
      }

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
    if (isVideo) {
      setActiveVideoFilter('normal');
    } else {
      setBrightness(1);
      setContrast(1);
      setSaturation(1);
      setBlur(0);
    }
  };

  // Function to get video filter style for the current active filter
  const getVideoFilterStyle = () => {
    const filter = VIDEO_FILTERS.find(f => f.id === activeVideoFilter);
    return filter ? filter.style : {};
  };

  // Function to handle slider value change based on active filter
  const handleSliderChange = value => {
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
      case 'blur':
        setBlur(value);
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
      case 'blur':
        return blur;
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
      case 'blur':
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
      case 'blur':
        return `Blur: ${blur.toFixed(1)}`;
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
      case 'blur':
        return 20.0;
      default:
        return 2.0;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#353030" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="x" size={24} color="white" />
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
                filterEnabled
              />
              {/* Apply tint overlay if needed */}
              {getVideoFilterStyle().tint && (
                <View
                  style={[
                    styles.tintOverlay,
                    {backgroundColor: getVideoFilterStyle().tint},
                  ]}
                />
              )}
              {isPaused && (
                <View style={styles.playPauseButton}>
                  <Icon name="play" size={24} color="white" />
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
                    <Group>
                      <SkiaImageComponent
                        image={skiaImage}
                        x={0}
                        y={0}
                        width={screenWidth}
                        height={screenWidth}
                        fit="contain"
                        paint={paint}
                      />
                      {blur > 0 && <BlurMask blur={blur} style="normal" />}
                    </Group>
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

        <View style={styles.bottomToolbar}>
          <TouchableOpacity
            style={[
              styles.toolbarButton,
              !showFilters && styles.activeToolbarButton,
            ]}
            onPress={() => {
              setShowFilters(false);
            }}>
            <Icon
              name="type"
              size={20}
              color={!showFilters ? '#D4ACFB' : 'white'}
            />
            <Text style={styles.toolbarButtonText}>Caption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toolbarButton,
              showFilters && styles.activeToolbarButton,
            ]}
            onPress={() => {
              setShowFilters(true);
            }}>
            <Icon
              name="sliders"
              size={20}
              color={showFilters ? '#D4ACFB' : 'white'}
            />
            <Text style={styles.toolbarButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {!showFilters ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.keyboardAvoidingView}>
            <View style={styles.captionContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Write a caption..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                value={caption}
                onChangeText={setCaption}
              />
              <Text style={{textAlign: 'center', color: 'grey'}}>
                Every post holds a story waiting to be told.
              </Text>
              <Text style={{textAlign: 'center', color: 'grey'}}>
                Let others feel the moment too.
              </Text>
              <Text style={{textAlign: 'center', color: 'grey'}}>
                Share it.
              </Text>
            </View>
          </KeyboardAvoidingView>
        ) : (
          // Video and Image filter screens
          <View style={styles.filterControlsContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterHeaderText}>
                {isVideo ? 'Video Filters' : 'Image Editor'}
              </Text>
              <TouchableOpacity
                onPress={resetFilters}
                style={styles.resetButton}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
            </View>
            
            {isVideo ? (
              // Video filter options
              <FlatList
                data={VIDEO_FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.videoFiltersScrollView}
                contentContainerStyle={styles.videoFiltersContent}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.filterOptionBox,
                      activeVideoFilter === item.id && styles.activeFilterBox,
                    ]}
                    onPress={() => setActiveVideoFilter(item.id)}>
                    <View
                      style={[
                        styles.filterIcon,
                        activeVideoFilter === item.id && styles.activeFilterIcon,
                      ]}>
                      <Icon
                        name={item.icon}
                        size={24}
                        color={
                          activeVideoFilter === item.id ? '#353030' : '#D4ACFB'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeVideoFilter === item.id && styles.activeFilterText,
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              // Image filter controls
              <View style={{alignItems: 'center'}}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterOptionsScrollView}>
                  <TouchableOpacity
                    style={[
                      styles.filterOptionBox,
                      activeFilter === 'brightness' && styles.activeFilterBox,
                    ]}
                    onPress={() => setActiveFilter('brightness')}>
                    <View
                      style={[
                        styles.filterIcon,
                        activeFilter === 'brightness' &&
                          styles.activeFilterIcon,
                      ]}>
                      <Icon
                        name="sun"
                        size={24}
                        color={
                          activeFilter === 'brightness' ? '#353030' : '#D4ACFB'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeFilter === 'brightness' &&
                          styles.activeFilterText,
                      ]}>
                      Brightness
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOptionBox,
                      activeFilter === 'contrast' && styles.activeFilterBox,
                    ]}
                    onPress={() => setActiveFilter('contrast')}>
                    <View
                      style={[
                        styles.filterIcon,
                        activeFilter === 'contrast' && styles.activeFilterIcon,
                      ]}>
                      <Icon
                        name="circle"
                        size={24}
                        color={
                          activeFilter === 'contrast' ? '#353030' : '#D4ACFB'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeFilter === 'contrast' && styles.activeFilterText,
                      ]}>
                      Contrast
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterOptionBox,
                      activeFilter === 'saturation' && styles.activeFilterBox,
                    ]}
                    onPress={() => setActiveFilter('saturation')}>
                    <View
                      style={[
                        styles.filterIcon,
                        activeFilter === 'saturation' &&
                          styles.activeFilterIcon,
                      ]}>
                      <Icon
                        name="droplet"
                        size={24}
                        color={
                          activeFilter === 'saturation' ? '#353030' : '#D4ACFB'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeFilter === 'saturation' &&
                          styles.activeFilterText,
                      ]}>
                      Saturation
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {!isVideo && (
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
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#D4ACFB"
                />
              </View>
            )}
          </View>
        )}
      </View>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4ACFB" />
          <Text style={styles.loadingText}>Posting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#353030',
  },
  container: {
    flex: 1,
    backgroundColor: '#353030',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#353030',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,172,251,0.2)',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
  },
  postButtonText: {
    color: '#353030',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mediaPreviewContainer: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,172,251,0.2)',
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
  mediaPreviewVideo: {
    width: '100%',
    height: '100%',
  },
  playPauseButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(53, 48, 48, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4ACFB',
  },
  skiaCanvas: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#252525',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,172,251,0.2)',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 270, // Adjusted this value to remove the gap
    left: 0,
    right: 0,
    zIndex: 10,
  },
  toolbarButton: {
    // marginBottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeToolbarButton: {
    backgroundColor: 'rgba(212,172,251,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,172,251,0.3)',
  },
  toolbarButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  filterControlsContainer: {
    backgroundColor: '#252525',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,172,251,0.2)',
    padding: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,172,251,0.2)',
  },
  filterHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: 'rgba(212,172,251,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  resetText: {
    color: '#D4ACFB',
    fontWeight: 'bold',
    fontSize: 12,
  },
  filterOptionsScrollView: {
    // alignItems: 'center',
    // justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15,
    maxHeight: 100,
  },
  filterOptionBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(212,172,251,0.2)',
  },
  activeFilterBox: {
    backgroundColor: '#D4ACFB',
    borderWidth: 0,
  },
  filterIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(53, 48, 48, 0.3)',
  },
  activeFilterIcon: {
    backgroundColor: 'rgba(53, 48, 48, 0.2)',
  },
  filterOptionText: {
    color: '#D4ACFB',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  activeFilterText: {
    color: '#353030',
  },
  sliderContainer: {
    paddingHorizontal: 5,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 16,
    padding: 10,
  },
  sliderLabel: {
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  captionContainer: {
    backgroundColor: '#252525',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,172,251,0.2)',
  },
  captionInput: {
    fontSize: 14,
    color: 'white',
    height: 160,
    marginBottom: 20,
    // height: 'auto',
    backgroundColor: '#353030',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(53, 48, 48, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default CreatePost;
