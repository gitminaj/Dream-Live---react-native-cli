import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import { BASE_URL } from '../../utils/constant';
import axios from 'axios';
import { getDataFromStore } from '../../store';

const CreatePost = ({ route, navigation }) => {
  const { media } = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
            // Add authorization header if needed
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      console.log('response',response)

      if (response.data && response.data.success) {
        // Navigate back to home or the posts feed with the new post data
        Alert.alert('Post created successfully!','Post created successfully!')
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            disabled={!caption.trim() || isSubmitting}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mediaPreviewContainer}>
          {isVideo ? (
            <Video
              source={{ uri: media.uri }}
              style={[styles.mediaPreview, { width: screenWidth }]}
              controls={true}
              resizeMode="contain"
              repeat={true}
              paused={true}
            />
          ) : (
            <Image
              source={{ uri: media.uri }}
              style={[styles.mediaPreview, { width: screenWidth }]}
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption..."
            placeholderTextColor="#888"
            multiline
            value={caption}
            onChangeText={setCaption}
          />
        </View>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Posting...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  postButton: {
    paddingHorizontal: 10,
  },
  postButtonText: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mediaPreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  mediaPreview: {
    height: 300,
    aspectRatio: 1,
  },
  captionContainer: {
    padding: 15,
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1E293B',
  },
});

export default CreatePost;