import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Video from 'react-native-video';
import { BASE_URL } from '../../utils/constant';
import axios from 'axios';
import { getDataFromStore } from '../../store';
// import { toast } from 'sonner-native';

const CreatePost = ({ route, navigation }) => {
  const { media } = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const videoRef = useRef(null);
  const isVideo = media.type && media.type.includes('video');
  const screenWidth = Dimensions.get('window').width;

  const handleSubmitPost = async () => {
    if (isSubmitting) return;
    if (!caption.trim()) {
      Alert.alert('Missing Caption', 'Please add a caption to your post');
      return;
    }

    setIsSubmitting(true);
    
    // Create a form data object
    const formData = new FormData();
    formData.append('body', caption);
    
    // Append the media file
    const fileExtension = media.uri.split('.').pop();
    const mimeType = isVideo 
      ? `video/${fileExtension}` 
      : `image/${fileExtension}`;
    
    formData.append('postUrl', {
      uri: Platform.OS === 'ios' ? media.uri.replace('file://', '') : media.uri,
      type: media.type || mimeType,
      name: `post-media-${Date.now()}.${fileExtension}`,
    });

    try {
      const token = getDataFromStore('token')
      const response = await axios.post(
        `${BASE_URL}/post/create-post`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        // Alert.alert('Success', 'Post created successfully!')
      //  toast('Hello, World!')
        navigation.navigate('Home', { newPost: response.data.post });
      } else {
        throw new Error(response.data?.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      Alert.alert(
        'Post Failed',
        error.response?.data?.message || error.message || 'Failed to submit post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main container with fixed position */}
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            onPress={handleSubmitPost}
            style={[styles.postButton, (!caption.trim() || isSubmitting) && styles.disabledButton]}
            disabled={!caption.trim() || isSubmitting}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Media Container - This stays fixed */}
        <View style={styles.mediaPreviewContainer}>
          {isVideo ? (
            <TouchableOpacity 
              onPress={togglePlayPause} 
              style={styles.videoContainer}
              activeOpacity={1}
            >
              <Video
                ref={videoRef}
                source={{ uri: media.uri }}
                style={styles.mediaPreviewVideo}
                resizeMode="contain"
                repeat={true}
                paused={isPaused}
              />
              {isPaused && (
                <View style={styles.playPauseButton}>
                  <View style={styles.playIcon}>
                    <View style={styles.playTriangle} />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Image
              source={{ uri: media.uri }}
              style={styles.mediaPreviewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>

      {/* Caption Input with KeyboardAvoidingView - This moves up with keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.captionContainerWrapper}>
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor="white"
            multiline
            value={caption}
            onChangeText={setCaption}
          />
        </View>
      </KeyboardAvoidingView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Posting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0,
    backgroundColor: '#0F172A',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  backButton: {
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  postButton: {
    paddingHorizontal: 10,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mediaPreviewContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'flex-start',
    marginBottom: 100
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreviewImage: {
    width: '100%',
    height: '100%',
  },
  mediaPreviewVideo: {
    width: '100%',
    height: '100%',
  },
  captionContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  captionContainer: {
    // padding: 15,
    backgroundColor: '#0F172A',
  },
  captionInput: {
    // borderRadius: 10,
    fontSize: 16,
    padding: 12,
    backgroundColor: '#D4ACFB',
    color: '#FFFFFF',

  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
  },
  playPauseButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 0,
    borderBottomWidth: 15,
    borderTopWidth: 15,
    borderLeftColor: 'white',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: 7,
  },
});

export default CreatePost;