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
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {BASE_URL} from '../../utils/constant';
import axios from 'axios';
import {getDataFromStore} from '../../store';
import * as Burnt from 'burnt';
import {
  Canvas,
  SkiaVideo,
  Image as SkiaImageComponent,
  Skia,
  useImage,
  useCanvasRef,
  BlurMask,
  Group,
  Video as SkiaVideoComponent,
  useVideo,
  ImageShader,
  ColorMatrix,
  Fill,
} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import {captureRef} from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/Feather';
import {useSharedValue, runOnJS} from 'react-native-reanimated';
import { IMAGE_FILTERS } from '../../utils/constant';


const {width: screenWidth} = Dimensions.get('window');

const CreatePost = ({route, navigation}) => {
  const {media} = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resolvedVideoPath, setResolvedVideoPath] = useState(null);
  
  // For video filters
  const [activeVideoFilter, setActiveVideoFilter] = useState('normal');
  
  // For image filters
  const [activeImageFilter, setActiveImageFilter] = useState('normal');
  
  const videoRef = useRef(null);
  const [imagePath, setImagePath] = useState(null);
  const [filteredImagePath, setFilteredImagePath] = useState(null);
  const [processedVideoPath, setProcessedVideoPath] = useState(null);
  const [imageReady, setImageReady] = useState(false);
  const canvasRef = useCanvasRef();
  const canvasViewRef = useRef(null);
  
  // Video state management
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const isVideo = media?.type?.includes('video');

  // Only use Reanimated for video content
  const paused = isVideo ? useSharedValue(true) : null;
  
  const videoConfig = useMemo(() => {
    if (!isVideo || !paused) return null;
    return {
      paused,
      resizeMode: 'contain',
      volume: 0,
    };
  }, [paused, isVideo]);

  const video = isVideo ? useVideo(media?.uri || null, videoConfig) : null;

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

  // Handle video loading state
  useEffect(() => {
    if (isVideo && video) {
      setVideoLoading(false);
      setVideoError(false);
    }
  }, [video, isVideo]);

  // Handle resolving the image path, especially for content:// URIs
useEffect(() => {
  const resolveMediaPath = async () => {
    if (!media?.uri) return;

    try {
      if (media.uri.startsWith('content://')) {
        // Handle both images and videos with content:// URIs
        const fileExtension = isVideo ? 'mp4' : 'jpg';
        const filename = `temp-${isVideo ? 'video' : 'image'}-${Date.now()}.${fileExtension}`;
        const destPath = `${RNFS.CachesDirectoryPath}/${filename}`;

        console.log('Copying from content URI:', media.uri);
        console.log('Copying to:', destPath);

        await RNFS.copyFile(media.uri, destPath);

        // Verify the file was copied successfully
        const fileExists = await RNFS.exists(destPath);
        if (!fileExists) {
          throw new Error('Failed to copy file from content URI');
        }

        const fileStats = await RNFS.stat(destPath);
        console.log('File copied successfully:', {
          path: destPath,
          size: fileStats.size,
          sizeInMB: (fileStats.size / (1024 * 1024)).toFixed(2)
        });

        const finalPath = Platform.OS === 'android' ? `file://${destPath}` : destPath;

        console.log('Setting resolved media path to:', finalPath);
        
        if (isVideo) {
          // For videos, we'll store the resolved path in a new state
          setResolvedVideoPath(finalPath);
        } else {
          setImagePath(finalPath);
        }
      } else {
        // Direct file path - handle normally
        const finalPath = media.uri.startsWith('file://') ? media.uri : `file://${media.uri}`;
        
        console.log('Setting direct media path to:', finalPath);
        
        if (isVideo) {
          setResolvedVideoPath(finalPath);
        } else {
          setImagePath(finalPath);
        }
      }
    } catch (err) {
      console.error('Failed to resolve media path:', err);
      Alert.alert('Media Error', 'Failed to load media file. Please try selecting again.');
    }
  };

  resolveMediaPath();
}, [media, isVideo]);

const processVideoWithFilters = async (inputPath, filterMatrix) => {
  try {
    console.log('Starting video processing...');
    
    // Clean the input path
    const cleanInputPath = inputPath.replace('file://', '');
    
    // Ensure input file exists
    const inputExists = await RNFS.exists(cleanInputPath);
    if (!inputExists) {
      throw new Error('Input video file does not exist at: ' + cleanInputPath);
    }
    
    const outputPath = `${RNFS.CachesDirectoryPath}/filtered_video_${Date.now()}.mp4`;
    
    // Your actual video processing code here
    // For now, just copy the original file (implement actual filtering as needed)
    await RNFS.copyFile(cleanInputPath, outputPath);
    
    // Verify the processed file was created and has content
    const exists = await RNFS.exists(outputPath);
    if (!exists) {
      throw new Error('Processed video file was not created');
    }
    
    const fileStats = await RNFS.stat(outputPath);
    if (fileStats.size === 0) {
      throw new Error('Processed video file is empty');
    }
    
    console.log('Video processing completed:', {
      outputPath: `file://${outputPath}`,
      size: fileStats.size,
      sizeInMB: (fileStats.size / (1024 * 1024)).toFixed(2)
    });
    
    return `file://${outputPath}`;
  } catch (error) {
    console.error('Video processing failed:', error);
    return null;
  }
};

  // Function to capture the filtered image using react-native-view-shot
  const captureFilteredImage = async () => {
    if (!canvasViewRef.current || !skiaImage) {
      console.error('Canvas view ref or image not ready');
      return null;
    }

    try {
      const uri = await captureRef(canvasViewRef, {
        format: 'png',
        quality: 1,
        result: 'file',
        transparent: false,
      });

      console.log('Filtered image captured at:', uri);
      return uri;
    } catch (error) {
      console.error('Error capturing filtered image:', error);
      return null;
    }
  };

  // Get current image filter matrix
  const getCurrentImageFilterMatrix = () => {
    const filter = IMAGE_FILTERS.find(f => f.id === activeImageFilter);
    return filter?.matrix || null;
  };

  // Updated paint object for image filters
  const paint = useMemo(() => {
    const p = Skia.Paint();
    const matrix = getCurrentImageFilterMatrix();
    
    if (matrix) {
      const colorFilter = Skia.ColorFilter.MakeMatrix(matrix);
      p.setColorFilter(colorFilter);
    }
    
    return p;
  }, [activeImageFilter]);

  // Get current video filter matrix
  const getCurrentVideoFilterMatrix = () => {
    const filter = IMAGE_FILTERS.find(f => f.id === activeVideoFilter);
    return filter?.matrix || null;
  };

const handleSubmitPost = async () => {
  if (isSubmitting) return;

  if (!caption.trim()) {
    Alert.alert('Missing Caption', 'Please add a caption to your post');
    return;
  }

  setIsSubmitting(true);

  try {
    // Use resolved paths instead of original media.uri
    let finalMediaPath = isVideo ? resolvedVideoPath : imagePath;
    
    // Fallback to original URI if resolution failed
    if (!finalMediaPath) {
      finalMediaPath = media.uri;
      console.warn('Using original URI as fallback:', finalMediaPath);
    }

    let mimeType = media.type || (isVideo ? 'video/mp4' : 'image/jpeg');
    let filename = media.filename || `media-${Date.now()}${isVideo ? '.mp4' : '.jpg'}`;

    console.log('Starting upload with path:', finalMediaPath);

    // Handle filtered content
    if (isVideo && activeVideoFilter !== 'normal') {
      console.log('Preparing video for server-side filter processing...');
      
      // No client-side processing - send filter info to server
      mimeType = 'video/mp4';
      filename = filename.replace(/\.[^/.]+$/, '') + '.mp4';
      
    } else if (!isVideo && activeImageFilter !== 'normal') {
      console.log('Capturing filtered image for upload...');
      
      const capturedPath = await captureFilteredImage();
      if (capturedPath) {
        finalMediaPath = capturedPath;
        setFilteredImagePath(capturedPath);
        console.log('Using filtered image:', finalMediaPath);
        
        mimeType = 'image/png';
        filename = `filtered-image-${Date.now()}.png`;
      } else {
        console.warn('Could not capture filtered image, using original');
      }
    }

    // Ensure proper file URI formatting
    let fileUri = finalMediaPath;
    if (!fileUri.startsWith('file://')) {
      fileUri = `file://${fileUri}`;
    }
    
    // Verify file exists before upload
    try {
      const cleanPath = fileUri.replace('file://', '');
      const fileExists = await RNFS.exists(cleanPath);
      if (!fileExists) {
        throw new Error('Media file does not exist at resolved path: ' + cleanPath);
      }
      
      const fileStats = await RNFS.stat(cleanPath);
      console.log('File to upload:', {
        originalUri: media.uri,
        resolvedPath: fileUri,
        size: fileStats.size,
        sizeInMB: (fileStats.size / (1024 * 1024)).toFixed(2)
      });
      
      // Check file size limits
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
      if (fileStats.size > maxSize) {
        throw new Error(`File too large. Max size: ${isVideo ? '100MB' : '10MB'}`);
      }
      
      if (fileStats.size === 0) {
        throw new Error('File is empty or corrupted');
      }
      
    } catch (fileError) {
      console.error('File verification failed:', fileError);
      throw new Error('Cannot access media file: ' + fileError.message);
    }

    const formData = new FormData();
    formData.append('body', caption);

    // Send filter information to server for processing
    if (isVideo && activeVideoFilter !== 'normal') {
      formData.append('videoFilter', activeVideoFilter);
      formData.append('filterMatrix', JSON.stringify(getCurrentVideoFilterMatrix()));
      console.log('Sending video filter info:', {
        filter: activeVideoFilter,
        matrix: getCurrentVideoFilterMatrix()
      });
    }
    
    if (!isVideo && activeImageFilter !== 'normal') {
      formData.append('imageFilter', activeImageFilter);
    }

    // Create proper FormData file object
    const fileObject = {
      uri: fileUri,
      type: mimeType,
      name: filename,
    };

    formData.append('postUrl', fileObject);

    console.log('Uploading media:', {
      uri: fileUri,
      type: mimeType,
      name: filename,
      isVideo,
      hasVideoFilter: isVideo && activeVideoFilter !== 'normal',
      hasImageFilter: !isVideo && activeImageFilter !== 'normal',
      platform: Platform.OS
    });

    const token = getDataFromStore('token');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Upload with proper configuration - increased timeout for server processing
    const response = await axios.post(
      `${BASE_URL}/post/create-post`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: isVideo ? 600000 : 60000, // 10 minutes for video (includes processing time), 1 minute for image
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          console.log(`Upload Progress: ${progress.toFixed(2)}%`);
          
          // Show processing message after upload completes
          if (progress === 100 && isVideo && activeVideoFilter !== 'normal') {
            console.log('Upload complete, server is processing video filters...');
          }
        },
      },
    );

    if (response.data.success) {
      Burnt.toast({
        title: isVideo && activeVideoFilter !== 'normal' 
          ? 'Post created! Video is being processed...' 
          : 'Post Created Successfully!', 
        preset: 'done'
      });
      navigation.navigate('Home', {newPost: response.data.post});
    } else {
      throw new Error(response.data.message || 'Failed to create post');
    }
  } catch (err) {
    console.error('Post submission error:', err);
    
    // Enhanced error handling
    let errorMessage = 'An unexpected error occurred';
    
    if (err.code === 'ENOENT') {
      errorMessage = 'The media file could not be found. Please try selecting the media again.';
    } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
      errorMessage = 'Network connection failed. Please check your internet connection and try again.';
    } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      errorMessage = isVideo && activeVideoFilter !== 'normal' 
        ? 'Processing timeout. Video filters take time to apply. Please try again or use a shorter video.'
        : 'Upload timeout. The file might be too large or your connection is slow. Try with a smaller file.';
    } else if (err.response) {
      const status = err.response.status;
      if (status === 413) {
        errorMessage = 'File too large. Please choose a smaller file.';
      } else if (status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (status === 400) {
        errorMessage = err.response.data?.message || 'Invalid file format or corrupted file.';
      } else if (status === 422) {
        errorMessage = 'Video processing failed. Please try a different filter or video.';
      } else if (status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.response.data?.message || `Server error (${status})`;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    Alert.alert('Upload Failed', errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};


  const resetFilters = () => {
    if (isVideo) {
      setActiveVideoFilter('normal');
    } else {
      setActiveImageFilter('normal');
    }
  };

  // Improved video play/pause handling with proper null checks
  const toggleVideoPlayback = () => {
    if (!isVideo || !paused) {
      console.warn('Video controls called on non-video content');
      return;
    }
    
    try {
      const newPlayState = !isVideoPlaying;
      paused.value = !newPlayState;
      
      runOnJS(setIsVideoPlaying)(newPlayState);
      
      console.log('Video play state changed to:', newPlayState);
    } catch (error) {
      console.error('Error toggling video playback:', error);
      setVideoError(true);
    }
  };

  // Render video content with improved error handling
  const renderVideoContent = () => {
    if (videoError) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Video failed to load</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setVideoError(false);
              setVideoLoading(true);
            }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (videoLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4ACFB" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      );
    }

    return (
      <Pressable onPress={toggleVideoPlayback} style={styles.videoContainer}>
        <Canvas ref={canvasRef} style={styles.skiaCanvas}>
          <Fill>
            {video?.currentFrame && (
              <ImageShader
                image={video.currentFrame}
                x={0}
                y={0}
                width={screenWidth}
                height={screenWidth}
                fit="contain"
              />
            )}
            {getCurrentVideoFilterMatrix() && (
              <ColorMatrix matrix={getCurrentVideoFilterMatrix()} />
            )}
          </Fill>
        </Canvas>

        {!isVideoPlaying && (
          <View style={[
            styles.playPauseButton,
            { opacity: 0.7 }
          ]}>
            <Icon
              name="play"
              size={24}
              color="white"
            />
          </View>
        )}

        <View style={styles.videoControls}>
          <View style={[
            styles.playbackIndicator,
            { backgroundColor: isVideoPlaying ? '#4CAF50' : '#ff9800' }
          ]}>
            <Text style={styles.playbackText}>
              {isVideoPlaying ? 'Playing' : 'Paused'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
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
          <View
            ref={canvasViewRef}
            style={styles.skiaWrapper}
            collapsable={false}>
            {isVideo ? (
              renderVideoContent()
            ) : (
              <>
                {skiaImage ? (
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
                    </Group>
                  </Canvas>
                ) : (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#D4ACFB" />
                    <Text style={styles.loadingText}>Loading image...</Text>
                  </View>
                )}
              </>
            )}
          </View>
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
            </View>
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.filterControlsContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterHeaderText}>
                {isVideo ? 'Video Filters' : 'Image Filters'}
              </Text>
              <TouchableOpacity
                onPress={resetFilters}
                style={styles.resetButton}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={IMAGE_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScrollView}
              contentContainerStyle={styles.filtersContent}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.filterOptionBox,
                    (isVideo ? activeVideoFilter : activeImageFilter) === item.id && styles.activeFilterBox,
                  ]}
                  onPress={() => {
                    if (isVideo) {
                      setActiveVideoFilter(item.id);
                    } else {
                      setActiveImageFilter(item.id);
                    }
                  }}>
                  <View
                    style={[
                      styles.filterIcon,
                      (isVideo ? activeVideoFilter : activeImageFilter) === item.id && styles.activeFilterIcon,
                    ]}>
                    <Icon
                      name={item.icon}
                      size={24}
                      color={
                        (isVideo ? activeVideoFilter : activeImageFilter) === item.id ? '#353030' : '#D4ACFB'
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.filterOptionText,
                      (isVideo ? activeVideoFilter : activeImageFilter) === item.id && styles.activeFilterText,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4ACFB" />
          <Text style={styles.loadingText}>
            {isVideo ? 'Uploading Video...' : 'Posting...'}
          </Text>
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
    height: 500,
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
    position: 'relative',
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
    backgroundColor: 'rgba(53, 48, 48, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4ACFB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  videoControls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  playbackIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  playbackText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  retryText: {
    color: '#353030',
    fontWeight: 'bold',
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
    bottom: 182,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  toolbarButton: {
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
  filtersScrollView: {
    marginBottom: 15,
  },
  filtersContent: {
    paddingHorizontal: 5,
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
  captionContainer: {
    backgroundColor: '#252525',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,172,251,0.2)',
  },
  captionInput: {
    fontSize: 14,
    color: 'white',
    height: 93,
    marginBottom: 20,
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