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
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (!hasPermission) {
      const status = await PermissionsAndroid.request(permission);
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
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
        setError('Permission denied');
        return;
      }

      const result = await CameraRoll.getPhotos({
        first: 20,
        assetType: 'All', // Include both photos and videos
        include: ['playableDuration', 'filename', 'fileSize', 'location', 'imageSize', 'orientation'],
        groupTypes: 'All',
      });
      
      setPhotos(result.edges);
      
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
      setError(err.message);
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
    const isVideo = item.node.type && item.node.type.startsWith('video');
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
    backgroundColor: '#000',
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