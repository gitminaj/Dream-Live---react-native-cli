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
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Recent');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

const loadPhotos = async () => {
  try {
    const granted = await requestPermission();
    if (!granted) {
      setError('Permission denied - need access to both photos and videos');
      return;
    }

    console.log('Fetching media with assetType: All');
    
    // First, try to get all media
    const result = await CameraRoll.getPhotos({
      first: 20,
      assetType: 'All', 
      include: ['playableDuration', 'filename', 'fileSize', 'location', 'imageSize', 'orientation'],
    });

    console.log('Media result:', JSON.stringify(result.edges.length));
    
    // Check if we're getting any videos in the returned results
    const hasVideos = result.edges.some(edge => 
      edge.node.type && edge.node.type.startsWith('video')
    );
    
    console.log('Has videos in result:', hasVideos);
    
    // Log a sample of the first 3 items to see their types
    if (result.edges.length > 0) {
      console.log('Sample media types:');
      result.edges.slice(0, 3).forEach((edge, i) => {
        console.log(`Item ${i}: type=${edge.node.type}, uri=${edge.node.image.uri}`);
      });
    }
    
    // If we didn't get any videos, try fetching videos separately
    if (!hasVideos) {
      console.log('No videos found in All query, trying Videos specifically');
      try {
        const videoResult = await CameraRoll.getPhotos({
          first: 10,
          assetType: 'Videos',
          include: ['playableDuration', 'filename', 'fileSize', 'location', 'imageSize', 'orientation'],
        });
        
        console.log('Video-specific query result count:', videoResult.edges.length);
        
        // If we do get videos in the specific query, there might be an issue with 'All'
        if (videoResult.edges.length > 0) {
          // Combine the results
          setPhotos([...result.edges, ...videoResult.edges]);
          console.log('Combined photos and videos');
        } else {
          setPhotos(result.edges);
          console.log('No videos found even with Videos assetType');
        }
      } catch (videoErr) {
        console.error('Error fetching videos:', videoErr);
        setPhotos(result.edges); // Just use photos if video fetch fails
      }
    } else {
      setPhotos(result.edges);
    }
    
    // Rest of your code for albums remains the same
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
  
  console.log(`Item ${index}: ${item.node.image.uri} - isVideo:`, isVideo, 
    `type:${item.node.type}, duration:${duration}`);
  
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
  }
});

export default CustomGallery;