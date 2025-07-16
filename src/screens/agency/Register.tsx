import {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  PermissionsAndroid,
  TextInput,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
const {height} = Dimensions.get('window');
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {BASE_URL} from '../../utils/constant';
import {Picker} from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';

import * as Burnt from 'burnt';

// Icons
import IconName from 'react-native-vector-icons/AntDesign';
import IconEmail from 'react-native-vector-icons/Fontisto';
import IconPhone from 'react-native-vector-icons/Feather';
import IconGender from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {agencyRegisterSchema} from '../../utils/schema/agencyRegister';

export default function AgencyRegister({navigation}) {
  const colorScheme = useColorScheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    agencyName: false,
    appID: false,
    email: false,
    number: false,
    gender: false,
    idProofName: false,
    accountNumber: false,
    IFSC: false,
  });

  const [form, setForm] = useState({
    name: '',
    agencyName: '',
    appID: '',
    email: '',
    number: '',
    gender: '',
    idProofName: '',
    accountNumber: '',
    IFSC: '',
  });

  // File states
  const [agencyLogo, setAgencyLogo] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);

  const handleChange = (fieldName, value) => {
    setForm({...form, [fieldName]: value});

    // Clear field error when user types
    if (fieldErrors[fieldName]) {
      setFieldErrors({...fieldErrors, [fieldName]: false});
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    // Reset field errors
    setFieldErrors({
      name: false,
      agencyName: false,
      appID: false,
      email: false,
      number: false,
      gender: false,
      idProofName: false,
      accountNumber: false,
      IFSC: false,
    });

    // Validate form data
    const result = agencyRegisterSchema.safeParse(form);
    
      console.log('result', result);

    if (!result.success) {
      const errors = {};
      let topError = '';

      result.error.errors.forEach(err => {
        const path = err.path[0];
        if (path) {
          errors[path] = true;
          if (!topError) topError = err.message;
        }
      });

      setFieldErrors({...fieldErrors, ...errors});
      setError(topError);
      setLoading(false);
      return;
    }

    // Check if required files are uploaded
    if (!agencyLogo) {
      setError('Please upload agency logo');
      setLoading(false);
      return;
    }

    if (!idProofFile) {
      setError('Please upload ID proof document');
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add form fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Add files
      formData.append('agencyLogo', {
        uri: agencyLogo.uri,
        type: agencyLogo.type,
        name: agencyLogo.name,
      });

      formData.append('agencyIdProofFile', {
        uri: idProofFile.uri,
        type: idProofFile.type,
        name: idProofFile.name,
      });

      const response = await axios.post(
        `${BASE_URL}/agency/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Registration successful:', response.data);

      Burnt.toast({
        title: 'Agency request created',
        preset: 'done',
      });
      navigation.goBack();
    } catch (err) {
      console.log('Registration error:', err.response?.data);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'This app needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Logo selection functions
  const selectLogoFromGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options)
      .then(response => {
        console.log('Gallery response:', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert(
            'Error',
            response.errorMessage || 'Failed to select image',
          );
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          console.log('Selected asset:', asset);
          setAgencyLogo({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'agency_logo.jpg',
          });
        }
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
        Alert.alert('Error', 'Failed to open image picker');
      });
  };

  const takeLogoPhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos',
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options)
      .then(response => {
        console.log('Camera response:', response);
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Error', response.errorMessage || 'Failed to take photo');
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          console.log('Captured asset:', asset);
          setAgencyLogo({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'agency_logo.jpg',
          });
        }
      })
      .catch(error => {
        console.log('Camera Error: ', error);
        Alert.alert('Error', 'Failed to open camera');
      });
  };

  // ID Proof upload functions - using ImagePicker for gallery selection
  const selectIdProofFromGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options)
      .then(response => {
        console.log('ID Proof Gallery response:', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert(
            'Error',
            response.errorMessage || 'Failed to select image',
          );
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          console.log('Selected ID proof asset:', asset);
          setIdProofFile({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'id_proof.jpg',
          });
        }
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
        Alert.alert('Error', 'Failed to open image picker');
      });
  };

  const takeIdProofPhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos',
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options)
      .then(response => {
        console.log('ID Proof Camera response:', response);
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Error', response.errorMessage || 'Failed to take photo');
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          console.log('Captured ID proof asset:', asset);
          setIdProofFile({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'id_proof.jpg',
          });
        }
      })
      .catch(error => {
        console.log('Camera Error: ', error);
        Alert.alert('Error', 'Failed to open camera');
      });
  };

  const showLogoOptions = () => {
    console.log('Logo options clicked');
    Alert.alert(
      'Select Agency Logo',
      'Choose how you want to upload your agency logo',
      [
        {
          text: 'Gallery',
          onPress: () => {
            console.log('Gallery selected');
            selectLogoFromGallery();
          },
        },
        {
          text: 'Camera',
          onPress: () => {
            console.log('Camera selected');
            takeLogoPhoto();
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const showIdProofOptions = () => {
    console.log('ID Proof options clicked');
    Alert.alert(
      'Upload ID Proof',
      'Choose how you want to upload your ID proof document',
      [
        {
          text: 'Gallery',
          onPress: () => {
            console.log('Gallery selected for ID proof');
            selectIdProofFromGallery();
          },
        },
        {
          text: 'Camera',
          onPress: () => {
            console.log('Camera selected for ID proof');
            takeIdProofPhoto();
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.elementContainer}>
          <Text style={styles.text}>Agency Registration</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Name Input */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.name && styles.inputError,
            ]}>
            <IconName
              name="idcard"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Name"
              value={form.name}
              onChangeText={name => handleChange('name', name)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
            />
          </View>

          {/* Agency Name Input */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.agencyName && styles.inputError,
            ]}>
            <MaterialIcons
              name="business"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Agency Name"
              value={form.agencyName}
              onChangeText={agencyName =>
                handleChange('agencyName', agencyName)
              }
              placeholderTextColor="#8C8C8C"
              style={styles.input}
            />
          </View>

          {/* App ID Input */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.appID && styles.inputError,
            ]}>
            <MaterialIcons
              name="laptop"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="App ID"
              value={form.appID}
              onChangeText={appID => handleChange('appID', appID)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
            />
          </View>

          {/* Email Input */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.email && styles.inputError,
            ]}>
            <IconEmail
              name="email"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Email"
              value={form.email}
              onChangeText={email => handleChange('email', email)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Contact Number Input */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.number && styles.inputError,
            ]}>
            <IconPhone
              name="phone"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Contact Number"
              value={form.number}
              onChangeText={number => handleChange('number', number)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender Dropdown */}
          <View
            style={[
              styles.pickerContainer,
              fieldErrors.gender && styles.inputError,
            ]}>
            <IconGender
              name="face-recognition"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <Picker
              selectedValue={form.gender}
              onValueChange={value => handleChange('gender', value)}
              style={styles.picker}
              dropdownIconColor="#8C8C8C">
              <Picker.Item label="Select Gender" value="" color="#8C8C8C" />
              <Picker.Item
                label="Male"
                value="Male"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
              <Picker.Item
                label="Female"
                value="Female"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
              <Picker.Item
                label="Other"
                value="Other"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
            </Picker>
          </View>

          {/* Bank Account Number */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.accountNumber && styles.inputError,
            ]}>
            <FontAwesome
              name="bank"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Bank Account Number"
              value={form.accountNumber}
              onChangeText={accountNumber =>
                handleChange('accountNumber', accountNumber)
              }
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          {/* IFSC Code */}
          <View
            style={[
              styles.inputContainer,
              fieldErrors.IFSC && styles.inputError,
            ]}>
            <FontAwesome
              name="bank"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Bank IFSC Code"
              value={form.IFSC}
              onChangeText={IFSC => handleChange('IFSC', IFSC)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              autoCapitalize="characters"
            />
          </View>

          {/* ID Proof Type Dropdown */}
          <View
            style={[
              styles.pickerContainer,
              fieldErrors.idProofName && styles.inputError,
            ]}>
            <Feather
              name="user-check"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <Picker
              selectedValue={form.idProofName}
              onValueChange={value => handleChange('idProofName', value)}
              style={styles.picker}
              dropdownIconColor="#8C8C8C">
              <Picker.Item
                label="Select ID Proof Type"
                value=""
                color="#8C8C8C"
              />
              <Picker.Item
                label="Government ID"
                value="Government Id"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
              <Picker.Item
                label="Aadhar Card"
                value="Aadhar"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
              <Picker.Item
                label="Voter ID"
                value="Voter Id"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
              <Picker.Item
                label="PAN Card"
                value="PAN Card"
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
            </Picker>
          </View>

          {/* ID Proof Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>ID Proof Document</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={showIdProofOptions}>
              <MaterialIcons name="upload-file" size={24} color="#D4ACFB" />
              <Text style={styles.uploadButtonText}>
                {idProofFile ? 'Document Selected' : 'Upload ID Proof'}
              </Text>
            </TouchableOpacity>
            {idProofFile && (
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{idProofFile.name}</Text>
                <TouchableOpacity onPress={() => setIdProofFile(null)}>
                  <MaterialIcons name="close" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Agency Logo Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Agency Logo</Text>
            <View style={styles.logoContainer}>
              {agencyLogo ? (
                <View style={styles.logoPreview}>
                  <Image
                    source={{uri: agencyLogo.uri}}
                    style={styles.logoImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => setAgencyLogo(null)}>
                    <MaterialIcons name="close" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.logoPlaceholder}>
                  <MaterialIcons name="business" size={40} color="#8C8C8C" />
                  <Text style={styles.placeholderText}>Agency Logo</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={showLogoOptions}>
                <MaterialIcons name="camera-alt" size={24} color="#D4ACFB" />
                <Text style={styles.uploadButtonText}>
                  {agencyLogo ? 'Change Logo' : 'Upload Logo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.btn, loading && styles.btnDisabled]}
            disabled={loading}>
            <Text style={styles.btnText}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateHost')}
          style={styles.navButton}>
          <Text style={styles.navButtonText}>Create Host</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('HostStreaming')}
          style={styles.navButton}>
          <Text style={styles.navButtonText}>Host Streaming</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  elementContainer: {
    width: '90%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#1E2533',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#1E2533',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    color: 'white',
    height: 50,
    fontSize: 16,
  },
  picker: {
    flex: 1,
    color: 'white',
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: 12,
  },
  uploadSection: {
    width: '100%',
    marginBottom: 20,
  },
  uploadLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2533',
    borderWidth: 1,
    borderColor: '#D4ACFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  uploadButtonText: {
    color: '#D4ACFB',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E2533',
    padding: 10,
    borderRadius: 8,
  },
  fileName: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPreview: {
    position: 'relative',
    marginBottom: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#1E2533',
    borderRadius: 10,
    padding: 2,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E2533',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#8C8C8C',
    fontSize: 12,
    marginTop: 5,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4ACFB',
    marginTop: 20,
    marginBottom: 20,
  },
  btnDisabled: {
    backgroundColor: '#8C8C8C',
  },
  btnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#1E2533',
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButtonText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
});
