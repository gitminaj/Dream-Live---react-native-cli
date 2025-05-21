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
  Dimensions
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

const CustomGallery = ({ navigation }) => {
  const [pageInfo, setPageInfo] = useState({ has_next_page: true, end_cursor: null });
const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

const loadPhotos = async (loadMore = false) => {
  if (loadingMore || (loadMore && !pageInfo.has_next_page)) return;

  if (loadMore) setLoadingMore(true);
  else setLoading(true);

  try {
    const granted = await requestPermission();
    if (!granted) {
      setError('Permission denied - need access to both photos and videos');
      return;
    }

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


  const selectImage = (item) => {
    setSelectedImage(item.node.image.uri);
    // Navigate to create post screen with the selected image
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
{/*         
        <TouchableOpacity 
          onPress={() => setSelectedTab('Albums')} 
          style={[styles.tab, selectedTab === 'Albums' && styles.activeTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'Albums' && styles.activeTabText]}>Albums</Text>
        </TouchableOpacity> */}
        
        {/* <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuDots}>⋯</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

const renderPhotoItem = ({ item, index }) => {
  // Improved video detection: check both type field and playableDuration
  const isVideo = (item.node.type && item.node.type.startsWith('video')) || 
                 (item.node.image.playableDuration && item.node.image.playableDuration > 0);
  
  const duration = item.node.image.playableDuration || 0;
  
  // console.log(`Item ${index}: ${item.node.image.uri} - isVideo:`, isVideo, 
  //   `type:${item.node.type}, duration:${duration}`);
  
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {loading ? (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color="#D4ACFB" />
  </View>
) : selectedTab === 'Recent' ? (
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
) : (
  <FlatList
    data={albums}
    keyExtractor={(item, index) => index.toString()}
    renderItem={renderAlbumItem}
    contentContainerStyle={styles.albumList}
  />
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
  },
  loaderContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

});

export default CustomGallery;