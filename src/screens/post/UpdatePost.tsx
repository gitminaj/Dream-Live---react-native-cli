import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import {BACKEND_URL, BASE_URL} from '../../utils/constant';
import {getDataFromStore} from '../../store';
import axios from 'axios';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const {width, height} = Dimensions.get('window');

const UpdatePostScreen = ({route, navigation}) => {
  // Get the complete post data from route params
  const {post} = route.params || {};
  
  const [submitting, setSubmitting] = useState(false);
  const [caption, setCaption] = useState(post?.body || '');
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const token = getDataFromStore('token');

  // Handle update post
  const handleUpdatePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your post.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.put(
        `${BASE_URL}/post/update/${post._id}`,
        {
          body: caption,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response?.data?.success) {
        Alert.alert('Success', 'Post updated successfully!');
        navigation.goBack(); 
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to update post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isVideoFile = url => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv', '.3gp'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const toggleVideoPlayback = () => {
    setIsVideoPlaying(prev => !prev);
  };

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if post data exists
  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post data is missing</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isVideo = post?.postUrl && isVideoFile(`${BACKEND_URL}/${post?.postUrl?.replace(/\\/g, '/')}`);
  const mediaUrl = post?.postUrl ? `${BACKEND_URL}/${post?.postUrl?.replace(/\\/g, '/')}` : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <TouchableOpacity 
          onPress={handleUpdatePost}
          disabled={submitting}
          style={styles.postButton}>
          <Text style={[styles.postButtonText, submitting && styles.disabledText]}>
            {submitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Post Preview */}
        <View style={styles.previewContainer}>
          {isVideo ? (
            <TouchableOpacity activeOpacity={0.9} onPress={toggleVideoPlayback} style={styles.videoWrapper}>
              <Video
                source={{uri: mediaUrl}}
                style={styles.mediaPreview}
                resizeMode="cover"
                paused={!isVideoPlaying}
                repeat={true}
              />
              {!isVideoPlaying && (
                <View style={styles.playOverlay}>
                  <Ionicons name="play" size={50} color="white" />
                </View>
              )}
              <View style={styles.videoControls}>
                <TouchableOpacity 
                  style={styles.videoControlButton}
                  onPress={toggleVideoPlayback}>
                  <Ionicons 
                    name={isVideoPlaying ? "pause" : "play"} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : (
            <Image
              source={{uri: mediaUrl}}
              style={styles.mediaPreview}
              resizeMode="cover"
            />
          )}
        </View>
        
        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor="#8A96B8"
            multiline
            style={styles.captionInput}
            autoFocus={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#5E81F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  cancelButton: {
    color: '#000000',
    fontSize: 16,
  },
  headerTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  postButtonText: {
    color: '#0095F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    width: width,
    height: width,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  videoControls: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  videoControlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  captionInput: {
    fontSize: 16,
    color: '#000000',
    padding: 0,
    minHeight: 80,
  },
});

export default UpdatePostScreen;