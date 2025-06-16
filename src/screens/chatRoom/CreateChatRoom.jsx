// CreateRoomScreen.js
import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {BASE_URL} from '../../utils/constant';
import {getDataFromStore} from '../../store';

import * as Burnt from 'burnt';
import { UserContext } from '../../utils/context/user-context';

const CreateRoomScreen = ({navigation}) => {
  const { user } = useContext(UserContext);
  const userId = user._id;
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState('7');
  const [form, setForm] = useState({
    name: '',
    description: '',
    maxParticipants: '',
  });
  const [fileData, setFileData] = useState('');

  const participantOptions = ['7', '8', '10', '15', '25'];

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.error) {
        console.log('User cancelled or error');
      } else if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
        const asset = response.assets[0];

        setFileData({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'photo.jpg',
        });
      }
    });
  };

  const selectParticipants = value => {
    setSelectedParticipants(value);
    setShowDropdown(false);
  };

  const handleChange = (fieldName, value) => {
    setForm({...form, [fieldName]: value});
  };

  const handleSubmit = async () => {
    const token = await getDataFromStore('token');
    console.log('form', form);
    const payload = {
      ...form,
      picture: fileData,
      maxParticipants: selectedParticipants,
    };
    console.log('payload', payload);
    const formDataTosubmit = new FormData();

    Object.keys(payload).forEach(key => {
      formDataTosubmit.append(key, payload[key]);
    });

    try {
      console.log('final form', formDataTosubmit);
      const response = await axios.post(
        `${BASE_URL}/chat/rooms`,
        formDataTosubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      console.log('res', response);
      if (response.data.success) {
        Burnt.toast({
          title: 'Room created Successfully!',
          preset: 'done',
        });
        const chatRoomId = response?.data?.chatRoom?._id;
        navigation.replace('ChatRoom',{ chatRoomId , chatRoom: response?.data?.chatRoom, userId  });
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Room</Text>
        </View>

        {/* Scrollable Form */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Room Picture */}
            <Text style={styles.label}>Room Picture</Text>
            <TouchableOpacity style={styles.imageSelector} onPress={selectImage}>
              {selectedImage ? (
                <Image
                  source={{uri: selectedImage.uri}}
                  style={styles.selectedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="camera" size={32} color="#ccc" />
                  <Text style={styles.imagePlaceholderText}>Select Picture</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Room Name</Text>
            <TextInput
              placeholder="Please Enter Name..."
              placeholderTextColor="#ccc"
              style={styles.input}
              onChangeText={name => handleChange('name', name)}
            />

            <Text style={styles.label}>Room Description</Text>
            <TextInput
              placeholder="Please enter description"
              placeholderTextColor="#ccc"
              style={[styles.input, {height: 80}]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              onChangeText={des => handleChange('description', des)}
            />

            <Text style={styles.label}>Room Participants Limit</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowDropdown(!showDropdown)}>
                <Text style={styles.selectorText}>
                  {selectedParticipants} participants
                </Text>
                <Icon
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdown}>
                  {participantOptions.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        selectedParticipants === option &&
                          styles.selectedDropdownItem,
                      ]}
                      onPress={() => selectParticipants(option)}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedParticipants === option &&
                            styles.selectedDropdownItemText,
                        ]}>
                        {option} participants
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Create Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
            <Text style={styles.nextButtonText}>Create Room</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 24,
    width: '100%',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    paddingRight: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  form: {
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
  imageSelector: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 8,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  selector: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    color: '#fff',
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedDropdownItem: {
    backgroundColor: '#D4ACFB',
  },
  selectedDropdownItemText: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  nextButton: {
    backgroundColor: '#D4ACFB',
    padding: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateRoomScreen;