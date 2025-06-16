import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Linking
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');
const itemSize = (width - 40) / 3;

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

// Enhanced permission check that returns detailed status
const checkPermissionStatus = async () => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const photoPermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      const videoPermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO;
      
      const photoStatus = await PermissionsAndroid.check(photoPermission);
      const videoStatus = await PermissionsAndroid.check(videoPermission);
      
      return {
        granted: photoStatus && videoStatus,
        denied: !photoStatus || !videoStatus,
        neverAskAgain: false // We'll handle this in the request flow
      };
    } else {
      const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const status = await PermissionsAndroid.check(permission);
      
      return {
        granted: status,
        denied: !status,
        neverAskAgain: false
      };
    }
  }
  return { granted: true, denied: false, neverAskAgain: false };
};

const CustomGallery = ({ navigation }) => {
  const [pageInfo, setPageInfo] = useState({ has_next_page: true, end_cursor: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  const loadPhotos = async (loadMore = false) => {
    if (loadingMore || (loadMore && !pageInfo.has_next_page)) return;

    if (loadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const granted = await requestPermission();
      if (!granted) {
        setError('Permission denied - need access to both photos and videos');
        setPermissionStatus('denied');
        return;
      }

      setPermissionStatus('granted');
      setError('');

      const result = await CameraRoll.getPhotos({
        first: 15,
        after: loadMore ? pageInfo.end_cursor : undefined,
        assetType: 'All',
        include: ['playableDuration', 'filename', 'fileSize', 'location', 'imageSize', 'orientation'],
      });

      if (loadMore) {
        setPhotos(prev => [...prev, ...result.edges]);
      } else {
        setPhotos(result.edges);
      }

      setPageInfo(result.page_info);
    } catch (err) {
      console.error('Error loading photos', err);
      setError(`Error: ${err.message}`);
    } finally {
      if (loadMore) setLoadingMore(false);
      else setLoading(false);
    }
  };

  // Method 1: Simple retry button
  const handleRetryPermission = async () => {
    setLoading(true);
    setError('');
    await loadPhotos();
  };

  // Method 2: Alert with options
  const showPermissionAlert = () => {
    Alert.alert(
      "Permission Required",
      "This app needs access to your photos and videos to display your gallery. Please grant permission to continue.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Retry",
          onPress: handleRetryPermission
        },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings()
        }
      ]
    );
  };

  // Method 3: Check if permission was permanently denied
  const handlePermissionDenied = async () => {
    const status = await checkPermissionStatus();
    
    if (status.neverAskAgain) {
      Alert.alert(
        "Permission Required",
        "Photo access has been permanently denied. Please enable it in your device settings to use this feature.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings()
          }
        ]
      );
    } else {
      showPermissionAlert();
    }
  };

  const selectImage = (item) => {
    setSelectedImage(item.node.image.uri);
    if (navigation && navigation.navigate) {
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
    } else {
      console.log('Selected media:', {
        uri: item.node.image.uri,
        type: item.node.type,
        isVideo: item.node.type && item.node.type.startsWith('video')
      });
    }
  };

  const handleClose = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      console.log('Close gallery picker');
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

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
          <Text style={[styles.tabText, selectedTab === 'Recent' && styles.activeTabText]}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Permission denied UI component
  const renderPermissionDenied = () => (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionTitle}>Permission Required</Text>
      <Text style={styles.permissionText}>
        This app needs access to your photos and videos to display your gallery.
      </Text>
      
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={handleRetryPermission}
      >
        <Text style={styles.retryButtonText}>Grant Permission</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => Linking.openSettings()}
      >
        <Text style={styles.settingsButtonText}>Open Settings</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhotoItem = ({ item, index }) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      
      {/* Show permission denied UI if permission is denied */}
      {permissionStatus === 'denied' ? (
        renderPermissionDenied()
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetryPermission}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4ACFB" />
        </View>
      ) : (
        <>
          {renderSectionHeader('Recent')}
          <FlatList
            data={photos}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            renderItem={renderPhotoItem}
            contentContainerStyle={styles.photoGrid}
            onEndReachedThreshold={0.5}
            onEndReached={() => loadPhotos(true)}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color="#D4ACFB" style={{ margin: 10 }} />
              ) : null
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  // Permission denied styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#D4ACFB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D4ACFB',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  settingsButtonText: {
    color: '#D4ACFB',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
    fontSize: 16,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomGallery;