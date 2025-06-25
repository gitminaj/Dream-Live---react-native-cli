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

const EditProfile = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const [firstName, setFirstName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? new Date(user.dateOfBirth) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGender, setSelectedGender] = useState(user?.gender || '');
  const [isPrivateAccount, setIsPrivateAccount] = useState(user?.isPrivate || false);
  const [profileImage, setProfileImage] = useState(user?.profile || '');
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
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Gallery Permission',
            message: 'App needs access to your gallery to select photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleAvatarPress = async () => {
    const hasPermission = await requestGalleryPermission();
    
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to select image');
      } else if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri);
      }
    });
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
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
            <Text style={styles.label}>First Name*</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#666"
              editable={!isLoading}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={showDatepicker}
              disabled={isLoading}
            >
              <Text style={[styles.inputText, { color: '#fff' }]}>
                {formatDate(dateOfBirth)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={dateOfBirth}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => !isLoading && setSelectedGender('Male')}
                disabled={isLoading}
              >
                <View style={styles.radioButton}>
                  {selectedGender === 'Male' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => !isLoading && setSelectedGender('Female')}
                disabled={isLoading}
              >
                <View style={styles.radioButton}>
                  {selectedGender === 'Female' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => !isLoading && setSelectedGender('Other')}
                disabled={isLoading}
              >
                <View style={styles.radioButton}>
                  {selectedGender === 'Other' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.genderText}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Private Account */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => !isLoading && setIsPrivateAccount(!isPrivateAccount)}
              disabled={isLoading}
            >
              <View style={styles.checkbox}>
                {isPrivateAccount && <Icon name="checkmark" size={16} color="#c77dff" />}
              </View>
              <Text style={styles.checkboxLabel}>Private Account</Text>
            </TouchableOpacity>
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
    color: '#ffffff',
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
});

export default EditProfile;