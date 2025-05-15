import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  StatusBar,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const itemSize = (width - 40) / 3;

// Screen heights for different states
const INITIAL_HEIGHT = height * 0.5; // Half screen
const FULL_HEIGHT = height;
const MIN_HEIGHT = height * 0.25; // Minimum height before closing

const requestPermission = async () => {
  if (Platform.OS === 'android') {
    // For Android 13+ (API 33+), we need separate permissions for photos and videos
    if (Platform.Version >= 33) {
      const photoPermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const videoPermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO;
      
      const hasPhotoPermission = await PermissionsAndroid.check(photoPermission);
      const hasVideoPermission = await PermissionsAndroid.check(videoPermission);
      
      if (!hasPhotoPermission || !hasVideoPermission) {
        const statuses = await PermissionsAndroid.requestMultiple([
          photoPermission,
          videoPermission
        ]);
        
        return (
          statuses[photoPermission] === PermissionsAndroid.RESULTS.GRANTED &&
          statuses[videoPermission] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      return true;
    } else {
      // For older Android versions
      const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);
      
      if (!hasPermission) {
        const status = await PermissionsAndroid.request(permission);
        return status === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }
  }
  return true;
};

const CustomGalleryBottomSheet = ({ navigation, visible, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Animation values
  const translateY = useSharedValue(height);
  const sheetHeight = useSharedValue(INITIAL_HEIGHT);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (visible) {
      // Open the sheet when visible becomes true
      translateY.value = withSpring(height - INITIAL_HEIGHT, {
        damping: 20,
        stiffness: 90
      });
    } else {
      // Close the sheet when visible becomes false
      translateY.value = withSpring(height);
    }
  }, [visible, translateY]);

  const loadPhotos = async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        setError('Permission denied - need access to both photos and videos');
        return;
      }
      
      const result = await CameraRoll.getPhotos({
        first: 20,
        assetType: 'All',
        include: ['playableDuration', 'filename', 'fileSize', 'location', 'imageSize', 'orientation'],
      });
      
      // Check if we're getting any videos in the returned results
      const hasVideos = result.edges.some(edge => 
        edge.node.type && edge.node.type.startsWith('video')
      );
      
      // If we didn't get any videos, try fetching videos separately
      if (!hasVideos) {
        try {
          const videoResult = await CameraRoll.getPhotos({
            first: 10,
            assetType: 'Videos',
            include: ['playableDuration', 'filename', 'fileSize', 'location', 'imageSize', 'orientation'],
          });
          
          // If we do get videos in the specific query, there might be an issue with 'All'
          if (videoResult.edges.length > 0) {
            // Combine the results
            setPhotos([...result.edges, ...videoResult.edges]);
          } else {
            setPhotos(result.edges);
          }
        } catch (videoErr) {
          console.error('Error fetching videos:', videoErr);
          setPhotos(result.edges); // Just use photos if video fetch fails
        }
      } else {
        setPhotos(result.edges);
      }
      
      // Group photos by album for the Albums tab
      const groupedByAlbum = {};
      result.edges.forEach(edge => {
        const album = edge.node.group_name || 'Ungrouped';
        if (!groupedByAlbum[album]) {
          groupedByAlbum[album] = [];
        }
        groupedByAlbum[album].push(edge);
      });
      
      const albumsList = Object.keys(groupedByAlbum).map(albumName => ({
        title: albumName,
        count: groupedByAlbum[albumName].length,
        thumbnail: groupedByAlbum[albumName][0]?.node.image.uri,
      }));
      
      setAlbums(albumsList);
      
    } catch (err) {
      console.error('Error loading photos', err);
      setError(`Error: ${err.message}`);
    }
  };

  const selectImage = (item) => {
    setSelectedImage(item.node.image.uri);
    // Navigate to create post screen with the selected image
    if (navigation && navigation.navigate) {
      onClose(); // Close the bottom sheet
      
      // Wait a bit for the animation to finish before navigating
      setTimeout(() => {
        navigation.navigate('CreatePost', { 
          media: {
            uri: item.node.image.uri,
            type: item.node.type,
            isVideo: item.node.type && item.node.type.startsWith('video'),
            duration: item.node.image.playableDuration || 0,
            filename: item.node.image.filename,
            fileSize: item.node.image.fileSize,
            width: item.node.image.width,
            height: item.node.image.height
          }
        });
      }, 300);
    }
  };

  const handleClose = useCallback(() => {
    // Animate closing the sheet
    translateY.value = withSpring(height, {
      damping: 20,
      stiffness: 90
    }, () => {
      runOnJS(onClose)();
    });
  }, [translateY, onClose]);

  // Handle switching between half-height and full-height
  const snapToPosition = useCallback((position) => {
    'worklet';
    if (position === 'full') {
      sheetHeight.value = withSpring(FULL_HEIGHT, { damping: 20, stiffness: 90 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else if (position === 'half') {
      sheetHeight.value = withSpring(INITIAL_HEIGHT, { damping: 20, stiffness: 90 });
      translateY.value = withSpring(height - INITIAL_HEIGHT, { damping: 20, stiffness: 90 });
    }
  }, [sheetHeight, translateY]);

  // Setup the pan gesture for the bottom sheet
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newTranslateY = Math.max(0, translateY.value + event.changeY);
      translateY.value = newTranslateY;
      
      // Calculate current height based on translation
      sheetHeight.value = Math.max(MIN_HEIGHT, FULL_HEIGHT - newTranslateY);
    })
    .onEnd((event) => {
      isDragging.value = false;
      
      // Determine where to snap based on velocity and position
      if (event.velocityY > 500) {
        // Fast downward swipe - close if we're below INITIAL_HEIGHT
        if (sheetHeight.value < INITIAL_HEIGHT) {
          runOnJS(handleClose)();
        } else {
          snapToPosition('half');
        }
      } else if (event.velocityY < -500) {
        // Fast upward swipe - go to full screen
        snapToPosition('full');
      } else {
        // Based on position
        if (sheetHeight.value < MIN_HEIGHT) {
          // Close the sheet if dragged below minimum height
          runOnJS(handleClose)();
        } else if (sheetHeight.value < INITIAL_HEIGHT * 0.7) {
          // Snap to half height
          snapToPosition('half');
        } else if (sheetHeight.value > INITIAL_HEIGHT * 1.3) {
          // Snap to full height
          snapToPosition('full');
        } else {
          // Stay at half height
          snapToPosition('half');
        }
      }
    })
    .minDistance(10)  // Require minimum movement to activate
    .activeOffsetY([-10, 10])  // Active area for vertical dragging
    .enabled(true);

  // The handle bar at the top of the sheet for dragging
  const renderDragHandle = () => (
    <View style={styles.dragHandleContainer}>
      <View style={styles.dragHandle} />
    </View>
  );

  useEffect(() => {
    if (visible) {
      loadPhotos();
    }
  }, [visible]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => setSelectedTab('Recent')} 
          style={[styles.tab, selectedTab === 'Recent' && styles.activeTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'Recent' && styles.activeTabText]}>Recent</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setSelectedTab('Albums')} 
          style={[styles.tab, selectedTab === 'Albums' && styles.activeTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'Albums' && styles.activeTabText]}>Albums</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuDots}>⋯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPhotoItem = ({ item, index }) => {
    // Improved video detection: check both type field and playableDuration
    const isVideo = (item.node.type && item.node.type.startsWith('video')) || 
                   (item.node.image.playableDuration && item.node.image.playableDuration > 0);
    
    const duration = item.node.image.playableDuration || 0;
    
    return (
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => selectImage(item)}
      >
        <Image
          source={{ uri: item.node.image.uri }}
          style={styles.image}
        />
        {isVideo && (
          <View style={styles.videoDurationContainer}>
            <Text style={styles.videoDuration}>
              {formatDuration(duration)}
            </Text>
          </View>
        )}
        <View style={styles.checkboxContainer}>
          <View style={[
            styles.checkbox,
            selectedImage === item.node.image.uri && styles.checkboxSelected
          ]}>
            {selectedImage === item.node.image.uri && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity style={styles.albumContainer}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.albumThumbnail} />
      ) : (
        <View style={[styles.albumThumbnail, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.albumCount}>{item.count}</Text>
    </TouchableOpacity>
  );

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Create the animated style for the bottom sheet
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      height: sheetHeight.value,
    };
  });

  return (
    <View style={styles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.sheetContainer, animatedStyle]}>
        <GestureDetector gesture={panGesture}>
          <View>
            {renderDragHandle()}
            {renderHeader()}
          </View>
        </GestureDetector>
        
        <SafeAreaView style={styles.contentContainer}>
          <StatusBar barStyle="dark-content" />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          {selectedTab === 'Recent' ? (
            <>
              {renderSectionHeader('Recent')}
              <FlatList
                data={photos}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                renderItem={renderPhotoItem}
                contentContainerStyle={styles.photoGrid}
              />
            </>
          ) : (
            <FlatList
              data={albums}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderAlbumItem}
              contentContainerStyle={styles.albumList}
            />
          )}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#353030',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#888',
    borderRadius: 5,
  },
  contentContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#353030',
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  closeText: {
    fontSize: 24,
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#D4ACFB',
  },
  tabText: {
    color: '#ccc',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  menuDots: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
  photoGrid: {
    padding: 5,
  },
  imageContainer: {
    margin: 5,
    width: itemSize,
    height: itemSize,
    borderRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#8ced8c',
    borderColor: '#8ced8c',
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoDurationContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  videoDuration: {
    color: '#fff',
    fontSize: 10,
  },
  sectionHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  albumList: {
    padding: 10,
  },
  albumContainer: {
    marginBottom: 15,
  },
  albumThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  albumTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
  },
  albumCount: {
    color: '#ccc',
    fontSize: 14,
  }
});

export default CustomGalleryBottomSheet;