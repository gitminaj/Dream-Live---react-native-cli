import React, { useState } from 'react';
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
  Dimensions
} from 'react-native';
import Video from 'react-native-video';

// You'll need to set up a storage solution like Firebase Storage or AWS S3
// This is a placeholder for your actual post submission logic
const submitPost = async (caption, media) => {
  // Example implementation with Firebase:
  // 1. Upload media to storage
  // 2. Save post data to Firestore
  // 3. Return success/failure
  
  // Simulate network request
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        postId: 'post_' + Date.now(),
        timestamp: new Date().toISOString(),
        caption,
        mediaUrl: media.uri,
        mediaType: media.type
      });
    }, 1500);
  });
};

const CreatePost = ({ route, navigation }) => {
  const { media } = route.params;
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVideo = media.type && media.type.includes('video');
  const screenWidth = Dimensions.get('window').width;
  
  const handleSubmitPost = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const result = await submitPost(caption, media);
      
      if (result.success) {
        // Add the post to your local state/context if needed
        // For example, you might have a PostsContext that stores all posts
        
        // Navigate back to home or the posts feed
        navigation.navigate('Home', { newPost: result });
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to submit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
              paused={false}
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