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
import {IMAGE_FILTERS} from '../../utils/constant';

const {width: screenWidth} = Dimensions.get('window');

const CreatePost = ({route, navigation}) => {
  const {media} = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [resolvedVideoPath, setResolvedVideoPath] = useState(null);

  const [activeVideoFilter, setActiveVideoFilter] = useState('normal');

  const [activeImageFilter, setActiveImageFilter] = useState('normal');

  const [imagePath, setImagePath] = useState(null);
  const [filteredImagePath, setFilteredImagePath] = useState(null);
  const [imageReady, setImageReady] = useState(false);
  const canvasRef = useCanvasRef();
  const canvasViewRef = useRef(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const isVideo = media?.type?.includes('video');
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
  const skiaImage = useImage(imagePath);

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

  useEffect(() => {
    const resolveMediaPath = async () => {
      if (!media?.uri) return;

      try {
        if (media.uri.startsWith('content://')) {
          // Handle both images and videos with content:// URIs
          const fileExtension = isVideo ? 'mp4' : 'jpg';
          const filename = `temp-${
            isVideo ? 'video' : 'image'
          }-${Date.now()}.${fileExtension}`;
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
            sizeInMB: (fileStats.size / (1024 * 1024)).toFixed(2),
          });

          const finalPath =
            Platform.OS === 'android' ? `file://${destPath}` : destPath;

          console.log('Setting resolved media path to:', finalPath);

          if (isVideo) {
            setResolvedVideoPath(finalPath);
          } else {
            setImagePath(finalPath);
          }
        } else {
          const finalPath = media.uri.startsWith('file://')
            ? media.uri
            : `file://${media.uri}`;

          console.log('Setting direct media path to:', finalPath);

          if (isVideo) {
            setResolvedVideoPath(finalPath);
          } else {
            setImagePath(finalPath);
          }
        }
      } catch (err) {
        console.error('Failed to resolve media path:', err);
        Alert.alert(
          'Media Error',
          'Failed to load media file. Please try selecting again.',
        );
      }
    };

    resolveMediaPath();
  }, [media, isVideo]);

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

  const getCurrentImageFilterMatrix = () => {
    const filter = IMAGE_FILTERS.find(f => f.id === activeImageFilter);
    return filter?.matrix || null;
  };

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
      let finalMediaPath = isVideo ? resolvedVideoPath : imagePath;

      if (!finalMediaPath) {
        finalMediaPath = media.uri;
        console.warn('Using original URI as fallback:', finalMediaPath);
      }

      let mimeType = media.type || (isVideo ? 'video/mp4' : 'image/jpeg');
      let filename =
        media.filename || `media-${Date.now()}${isVideo ? '.mp4' : '.jpg'}`;

      console.log('Starting upload with path:', finalMediaPath);

      if (isVideo && activeVideoFilter !== 'normal') {
        console.log('Preparing video for server-side filter processing...');

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
          throw new Error(
            'Media file does not exist at resolved path: ' + cleanPath,
          );
        }

        const fileStats = await RNFS.stat(cleanPath);
        console.log('File to upload:', {
          originalUri: media.uri,
          resolvedPath: fileUri,
          size: fileStats.size,
          sizeInMB: (fileStats.size / (1024 * 1024)).toFixed(2),
        });

        // Check file size limits
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for image
        if (fileStats.size > maxSize) {
          throw new Error(
            `File too large. Max size: ${isVideo ? '100MB' : '10MB'}`,
          );
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
        formData.append(
          'filterMatrix',
          JSON.stringify(getCurrentVideoFilterMatrix()),
        );
        console.log('Sending video filter info:', {
          filter: activeVideoFilter,
          matrix: getCurrentVideoFilterMatrix(),
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
        platform: Platform.OS,
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
          onUploadProgress: progressEvent => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            console.log(`Upload Progress: ${progress.toFixed(2)}%`);

            // Show processing message after upload completes
            if (progress === 100 && isVideo && activeVideoFilter !== 'normal') {
              console.log(
                'Upload complete, server is processing video filters...',
              );
            }
          },
        },
      );

      if (response.data.success) {
        Burnt.toast({
          title:
            isVideo && activeVideoFilter !== 'normal'
              ? 'Post created! Video is being processed...'
              : 'Post Created Successfully!',
          preset: 'done',
        });
        navigation.navigate('Home', {newPost: response.data.post});
      } else {
        throw new Error(response.data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post submission error:', err);

      let errorMessage = 'Something went wrong. Please try again.';
      if (err.code === 'ENOENT') errorMessage = 'Media file not found.';
      else if (err.message?.includes('Network'))
        errorMessage = 'No internet connection.';
      else if (err.message?.includes('timeout'))
        errorMessage = 'Upload timed out. Try a smaller file.';
      else if (err.response) {
        const status = err.response.status;
        if (status === 413) errorMessage = 'File too large.';
        else if (status === 401) errorMessage = 'Please log in again.';
        else if (status === 422) errorMessage = 'Video filter failed.';
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
          <View style={[styles.playPauseButton, {opacity: 0.8}]}>
            <Icon name="play" size={28} color="white" />
          </View>
        )}

        <View style={styles.videoControls}>
          <View
            style={[
              styles.playbackIndicator,
              {backgroundColor: isVideoPlaying ? '#4CAF50' : '#ff9800'},
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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
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
              size={18}
              color={!showFilters ? '#D4ACFB' : '#999'}
            />
            <Text style={[styles.toolbarButtonText, !showFilters && styles.activeToolbarText]}>Caption</Text>
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
              size={18}
              color={showFilters ? '#D4ACFB' : '#999'}
            />
            <Text style={[styles.toolbarButtonText, showFilters && styles.activeToolbarText]}>Edit</Text>
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
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                value={caption}
                onChangeText={setCaption}
              />
              <View style={styles.inspirationContainer}>
                <Text style={styles.inspirationText}>
                  Every post holds a story waiting to be told.
                </Text>
                <Text style={styles.inspirationText}>
                  Let others feel the moment too.
                </Text>
              </View>
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
                <Icon name="rotate-ccw" size={14} color="#D4ACFB" />
                <Text style={styles.resetText}>Reset</Text>
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
                    (isVideo ? activeVideoFilter : activeImageFilter) ===
                      item.id && styles.activeFilterBox,
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
                      (isVideo ? activeVideoFilter : activeImageFilter) ===
                        item.id && styles.activeFilterIcon,
                    ]}>
                    <Icon
                      name={item.icon}
                      size={16}
                      color={
                        (isVideo ? activeVideoFilter : activeImageFilter) ===
                        item.id
                          ? '#ffffff'
                          : '#D4ACFB'
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.filterOptionText,
                      (isVideo ? activeVideoFilter : activeImageFilter) ===
                        item.id && styles.activeFilterText,
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
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#D4ACFB" />
            <Text style={styles.loadingText}>
              {isVideo ? 'Uploading Video...' : 'Posting...'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212,172,251,0.15)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  postButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#D4ACFB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  postButtonText: {
    color: '#1a1a1a',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  mediaPreviewContainer: {
    width: screenWidth,
    height: 480,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212,172,251,0.15)',
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4ACFB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  videoControls: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  playbackIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  playbackText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#D4ACFB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  retryText: {
    color: '#1a1a1a',
    fontWeight: '600',
    fontSize: 14,
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
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(212,172,251,0.15)',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 182,
    left: 0,
    right: 0,
    // zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  activeToolbarButton: {
    backgroundColor: 'rgba(212,172,251,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,172,251,0.25)',
  },
  toolbarButtonText: {
    color: '#999',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  activeToolbarText: {
    color: '#D4ACFB',
    fontWeight: '600',
  },
  filterControlsContainer: {
    backgroundColor: '#252525',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(212,172,251,0.15)',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(212,172,251,0.15)',
  },
  filterHeaderText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,172,251,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(212,172,251,0.2)',
  },
  resetText: {
    color: '#D4ACFB',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  filtersScrollView: {
    marginBottom: 10,
  },
  filtersContent: {
    paddingHorizontal: 5,
  },
  filterOptionBox: {
    width: 70,
    height: 85,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(212,172,251,0.15)',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 3,
  },
  activeFilterBox: {
    backgroundColor: '#D4ACFB',
    borderWidth: 0,
    shadowColor: '#D4ACFB',
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 6,
    // elevation: 6,
    transform: [{scale: 1.02}],
  },
  filterIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,172,251,0.1)',
  },
  activeFilterIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterOptionText: {
    color: '#D4ACFB',
    fontWeight: '500',
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  captionContainer: {
    backgroundColor: '#252525',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(212,172,251,0.15)',
  },
  captionInput: {
    fontSize: 15,
    color: 'white',
    height: 80,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    borderColor: 'rgba(212,172,251,0.15)',
    fontWeight: '400',
    lineHeight: 22,
  },
  inspirationContainer: {
    alignItems: 'center',
    paddingTop: 5,
  },
  inspirationText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 37, 37, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(212,172,251,0.15)',
    zIndex: 12,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default CreatePost;
