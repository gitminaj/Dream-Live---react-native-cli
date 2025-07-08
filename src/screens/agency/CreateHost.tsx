import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { UserContext } from '../../utils/context/user-context';
import { BACKEND_URL } from '../../utils/constant';

const CreateHost = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const [firstName, setFirstName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState(user?.gender || '');
  const [isPrivateAccount, setIsPrivateAccount] = useState(user?.isPrivate || false);
  const [profileImage, setProfileImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('usr edit profile', user);

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleDone = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', firstName.trim());
      formData.append('dateOfBirth', dateOfBirth.toISOString().split('T')[0]); // Format: YYYY-MM-DD
      formData.append('gender', selectedGender);
      formData.append('isPrivate', isPrivateAccount);
      
      // If a new image was selected, append it
      if (profileImage && profileImage !== user?.profile) {
        formData.append('profileImage', {
          uri: profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      console.log('formdata edit profle',formData )
      
      // Replace with your actual API endpoint
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/auth/profile/${user?._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      console.log('formdata edit profle resp',response )


      if (response.data.success) {
        // Update user context with new data
        // setUser({
        //   ...user,
        //   name: firstName,
        //   dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        //   gender: selectedGender,
        //   isPrivate: isPrivateAccount,
        //   profile: response.data.profileImageUrl || profileImage,
        // });

        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation?.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

 const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // For Android 13+, try the new permission first
      if (Platform.Version >= 33) {
        const newPermission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        
        // Check if new permission exists (some RN versions might not have it)
        if (newPermission) {
          const hasNewPermission = await PermissionsAndroid.check(newPermission);
          console.log('READ_MEDIA_IMAGES permission status:', hasNewPermission);
          
          if (hasNewPermission) {
            return true;
          }
          
          const granted = await PermissionsAndroid.request(newPermission, {
            title: 'Photo Access Permission',
            message: 'App needs access to your photos to select profile pictures',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          });
          
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
      
      // Fallback to old permission or for Android < 13
      const oldPermission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const hasOldPermission = await PermissionsAndroid.check(oldPermission);
      console.log('READ_EXTERNAL_STORAGE permission status:', hasOldPermission);
      
      if (hasOldPermission) {
        return true;
      }
      
      const granted = await PermissionsAndroid.request(oldPermission, {
        title: 'Storage Permission',
        message: 'App needs access to your storage to select photos',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      
      return granted === PermissionsAndroid.RESULTS.GRANTED;
      
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }
  return true;
};

  const handleAvatarPress = async () => {
  try {
    const hasPermission = await requestGalleryPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant photo library permission in Settings to select profile pictures',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Settings', 
            onPress: () => {
              // Open app settings
              if (Platform.OS === 'android') {
                require('react-native').Linking.openSettings();
              }
            }
          }
        ]
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      console.log('Image picker response:', response);
      
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error Message: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        console.log('Selected image URI:', imageUri);
        setProfileImage(imageUri);
      }
    });
  } catch (error) {
    console.error('Image picker error:', error);
    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
  }
};

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Host Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            //   <Image source={profileImage} style={profileStyles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={{color: '#8C8C8C', alignSelf: 'center'}}>
                  Center
                </Text>
                <Text style={{color: '#8C8C8C', alignSelf: 'center'}}>
                  Logo
                </Text>
              </View>
            )}
              <View style={styles.editIconContainer}>
                <Icon name="pencil" size={16} color="#1a1a2e" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Host Center Name</Text>
            <TextInput
              style={styles.input}
            //   value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#666"
              editable={!isLoading}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            //   value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#666"
              multiline
              editable={!isLoading}
            />
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Add New Host</Text>
            <TextInput
              style={styles.input}
            //   value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#666"
              editable={!isLoading}
            />
          </View>


        </View>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.doneButton, isLoading && styles.doneButtonDisabled]} 
          onPress={handleDone}
          disabled={isLoading}
        >
          <Text style={styles.doneButtonText}>
            {isLoading ? 'Updating...' : 'Done'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#cccccc',
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a1a2e',
  },
  formContainer: {
    marginBottom: 100,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a3b5c',
  },
  inputText: {
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4ACFB',
  },
  genderText: {
    fontSize: 16,
    color: '#ffffff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#1a1a2e',
  },
  doneButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    backgroundColor: '#666',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  profilePlaceholder:{
    width: 100,
    height: 100,
    borderRadius: 40,
    backgroundColor: '#1E2533',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
    // marginRight: 15,
  }
});

export default CreateHost;