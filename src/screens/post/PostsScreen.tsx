import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import {BACKEND_URL, BASE_URL} from '../../utils/constant';
import {getDataFromStore} from '../../store';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { useFormateDate } from '../../utils/useFormateDate'

import * as Burnt from "burnt";

import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const PostsScreen = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideos, setPlayingVideos] = useState({});
  
  // Function to fetch post
  const token = getDataFromStore('token');
  const fetchPosts = async () => {
    try {
      setError(null);
      const response = await axios.get(`${BASE_URL}/post/get-usersPosts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const postsData = response?.data?.data || [];
      
      // Initialize playingVideos state with all videos paused
      const initialPlayState = {};
      postsData.forEach(post => {
        if (isVideoFile(`${BACKEND_URL}/${post?.postUrl?.replace(/\\/g, '/')}`)) {
          initialPlayState[post._id] = false; // all videos start paused
        }
      });
      
      setPlayingVideos(initialPlayState);
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Unable to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Handle post selection
  const handlePostPress = post => {
    console.log('Post selected:', post.id);
    // Uncomment and modify for navigation
    // navigation.navigate('PostDetails', { post });
  };

  const handleDelete = id => {
    Alert.alert(
      'Are you sure?',
      'You want to delete the post?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${BASE_URL}/post/delete/${id}`,
              );

              console.log('Post deleted', response);
              if (response?.data?.success) {
                Burnt.toast({
                  title: 'Post Deleted Successfully!',
                  preset: 'done'
                })
                fetchPosts();
              }
            } catch (err) {
              console.error('Error deleting post:', err);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const isVideoFile = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv', '.3gp'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };
  
  // Toggle video playback
  const toggleVideoPlayback = (postId) => {
    setPlayingVideos(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Render each post item
  const renderPostItem = ({item}) => {
    const isVideo = isVideoFile(`${BACKEND_URL}/${item?.postUrl?.replace(/\\/g, '/')}`);
    const isPlaying = playingVideos[item._id] || false;
    
    return (
      <View style={styles.postContainer}>
        <TouchableOpacity 
          onPress={() => isVideo ? toggleVideoPlayback(item._id) : handlePostPress(item)}
          activeOpacity={0.9}
        >
          {isVideo ? (
            <View style={styles.videoContainer}>
              <Video
                source={{uri: `${BACKEND_URL}/${item?.postUrl?.replace(/\\/g, '/')}`}}
                style={styles.postVideo}
                resizeMode="cover"
                paused={!isPlaying}
                controls={false}
                repeat={true}
              />
              {/* Play/Pause overlay button */}
              {!isPlaying && (
                <View style={styles.playButtonOverlay}>
                  <Ionicons name="play" size={50} color="white" style={styles.playIcon} />
                </View>
              )}
              {/* Small play/pause indicator in corner */}
              {/* <TouchableOpacity 
                style={styles.videoControlButton}
                onPress={() => toggleVideoPlayback(item._id)}
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity> */}
            </View>
          ) : (
            <Image
              source={{uri: `${BACKEND_URL}/${item?.postUrl?.replace(/\\/g, '/')}`}}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>

        <View style={styles.postActions}>
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.actionIcon}>
              <Text style={styles.actionIconText}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💬</Text>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.moreButton} onPress={() => navigation.navigate('UpdatePost', { post: item })}>
              <AntDesign name="edit" size={15} style={{color: 'white'}} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => handleDelete(item._id)}>
              <AntDesign name="delete" size={15} style={{color: 'white'}} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.postDetails}>
          <Text style={styles.likesText}>{item.likes || 0} likes</Text>
          <Text style={styles.postDescription}>
            <Text style={styles.username}>{item.username || 'You'} </Text>
            {item.body}
          </Text>
          {item.comments && item.comments > 0 && (
            <Text style={styles.commentsText}>
              View all {item.comments} comments
            </Text>
          )}
          <Text style={styles.timePosted}>{useFormateDate(item.createdAt) || 'Just now'}</Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={['#0D1125', '#1E2745']}
        style={styles.gradientContainer}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#5E81F4" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Error state
  if (error && !refreshing && posts.length === 0) {
    return (
      <LinearGradient
        colors={['#0D1125', '#1E2745']}
        style={styles.gradientContainer}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item?._id?.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#5E81F4']}
            tintColor={'#5E81F4'}
          />
        }
        ListHeaderComponent={<Text style={styles.headerText}>My Posts</Text>}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts available</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 16,
    textAlign: 'center',
  },
  postContainer: {
    backgroundColor: '#0F172A',
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  location: {
    color: '#8A96B8',
    fontSize: 12,
  },
  moreButton: {
    padding: 5,
  },
  moreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionIcons: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginRight: 15,
  },
  actionIconText: {
    fontSize: 20,
  },
  postDetails: {
    paddingHorizontal: 15,
  },
  likesText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postDescription: {
    color: '#C0C7D8',
  },
  commentsText: {
    color: '#8A96B8',
    marginTop: 5,
  },
  timePosted: {
    color: '#8A96B8',
    fontSize: 12,
    marginTop: 5,
  },
  loadingText: {
    marginTop: 10,
    color: '#8A96B8',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#5E81F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8A96B8',
    marginTop: 20,
  },
  videoContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    position: 'relative',
  },
  postVideo: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playIcon: {
    opacity: 0.9,
  },
  videoControlButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostsScreen;