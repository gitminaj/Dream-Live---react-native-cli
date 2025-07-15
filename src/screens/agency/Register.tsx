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
} from 'react-native';
const {height} = Dimensions.get('window');
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {BASE_URL} from '../../utils/constant';
import {registerSchema} from '../../utils/schema/register';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';

// icons
import IconName from 'react-native-vector-icons/AntDesign';
import IconEmail from 'react-native-vector-icons/Fontisto';
import IconPhone from 'react-native-vector-icons/Feather';
import IconGender from 'react-native-vector-icons/MaterialCommunityIcons';
import IconDob from 'react-native-vector-icons/FontAwesome6';
import IconPassword from 'react-native-vector-icons/Feather';
import IconEye from 'react-native-vector-icons/Feather';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {InputWithIcon} from '../../components/InputWithIcon';

export default function AgencyRegister({navigation}) {
  const colorScheme = useColorScheme();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    gender: false,
    dateOfBirth: false,
    phone: false,
    password: false,
  });
  const [profileImage, setProfileImage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    agencyName: '',
    appID: '',
    email: '',
    number: '',
    gender: '',
    idProofName: '',
    agencyIdProofFile: '',
    agencyLogo: '',
    accountNumber: '',
    IFSC: '',
  });

  // Separate state for file data that won't be part of the initial form submission
  const [fileData, setFileData] = useState(null);

  const handleChange = (fieldName, value) => {
    setForm({...form, [fieldName]: value});

    // Clear the field error when user types
    if (fieldErrors[fieldName]) {
      setFieldErrors({...fieldErrors, [fieldName]: false});
    }
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({
      name: false,
      agencyName: false,
      appID: false,
      email: false,
      number: false,
      gender: false,
      idProofName: false,
      agencyIdProofFile: false,
      agencyLogo: false,
      accountNumber: false,
      IFSC: false,
    });

    const result = registerSchema.safeParse(form);

    if (result.success) {
      try {
        // First send OTP without image data
        const response = await axios.post(`${BASE_URL}/agency/register`, {
          email: form.email,
        });
        console.log('inside try');
        console.log('response', response);

        // Pass both form data and file data to the verification screen
        // navigation.navigate('VerifyEmail', {
        //   formData: form,
        //   fileData: fileData,
        // });
      } catch (err) {
        console.log('error: ', err.response?.data);
        setError(err.response?.data?.message || 'Registration failed');
      }
    } else {
      // Handle validation errors
      const errors = {};
      let passwordError = '';

      result.error.errors.forEach(err => {
        const path = err.path[0]; // Get the field name

        if (path === 'password') {
          // For password errors, set the top error message
          passwordError = err.message;
          errors.password = true;
        } else if (path) {
          // For other fields, just mark them as having errors
          errors[path] = true;
        }
      });

      // Update the field errors
      setFieldErrors({...fieldErrors, ...errors});

      // Only show password errors at the top
      if (passwordError) {
        setError(passwordError);
      }

      console.log('Validation errors:', result.error.errors);
    }
  };

  // Image picker function with improved file handling
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    ImagePicker.launchImageLibrary(options)
      .then(response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          // Store image for display
          setProfileImage({uri: asset.uri});

          // Store complete file information for later form submission
          setFileData({
            uri: asset.uri,
            type: asset.type || 'image/jpeg', // Fallback type if not provided
            name: asset.fileName || 'photo.jpg', // Fallback name if not provided
          });
        }
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

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
    } else {
      // On iOS, permissions are requested by the image picker automatically
      return true;
    }
  };

  const launchCamera = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      console.log('Camera permission denied');
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options)
      .then(response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];

          // Store image for display
          setProfileImage({uri: asset.uri});

          // Store complete file information for later form submission
          setFileData({
            uri: asset.uri,
            type: asset.type || 'image/jpeg', // Fallback type if not provided
            name: asset.fileName || 'photo.jpg', // Fallback name if not provided
          });
        }
      })
      .catch(error => {
        console.log('Camera Error: ', error);
      });
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.elementContainer}>
          <Text style={styles.text}>Agency</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* FIXED INPUT FIELDS - Using direct code instead of the custom component */}
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
              placeholder="Agency Name"
              value={form.agencyName}
              onChangeText={agencyName =>
                handleChange('agencyName', agencyName)
              }
              placeholderTextColor="#8C8C8C"
              style={styles.input}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              fieldErrors.name && styles.inputError,
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
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              fieldErrors.phone && styles.inputError,
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
              genderInputStyles.container,
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
              style={genderInputStyles.picker}
              dropdownIconColor="#8C8C8C">
              <Picker.Item
                label="Gender"
                value=""
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
              <Picker.Item
                label="Male"
                value="Male"
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
              <Picker.Item
                label="Female"
                value="Female"
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
              <Picker.Item
                label="Other"
                value="Other"
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
            </Picker>
          </View>

          {/* <View
            style={[
              styles.inputContainer,
              fieldErrors.phone && styles.inputError,
            ]}>
            <Feather
              name="user-check"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="National Id Proof"
              value={form.phone}
              onChangeText={phone => handleChange('phone', phone)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View> */}

          <View
            style={[
              styles.inputContainer,
              fieldErrors.phone && styles.inputError,
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
              onChangeText={accountNumber => handleChange('accountNumber', accountNumber)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              fieldErrors.phone && styles.inputError,
            ]}>
            <FontAwesome
              name="bank"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Bank Account IFSC"
              value={form.IFSC}
              onChangeText={IFSC => handleChange('IFSC', IFSC)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View
            style={[
              genderInputStyles.container,
              fieldErrors.gender && styles.inputError,
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
              style={genderInputStyles.picker}
              dropdownIconColor="#8C8C8C">
              <Picker.Item
                label="Id Proof"
                value=""
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
              <Picker.Item
                label="Government Id"
                value="Government Id"
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
              <Picker.Item
                label="Aadhar"
                value="Aadhar"
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
              <Picker.Item
                label="Voter Id"
                value="Voter Id"
                color={colorScheme === 'dark' ? '#aaa' : '#555'}
              />
            </Picker>
          </View>
          
           <View
            style={[
              styles.inputContainer,
              fieldErrors.phone && styles.inputError,
            ]}>
            <FontAwesome
              name="bank"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <TextInput
              placeholder="Bank Account IFSC"
              value={form.IFSC}
              onChangeText={IFSC => handleChange('IFSC', IFSC)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          


         

          <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
            <Text style={styles.btnText}>Submit</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateHost')}
          style={styles.loginText}>
          <Text style={{color: '#94A3B8'}}>CreateHost</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('HostStreaming')}
          style={styles.loginText}>
          <Text style={{color: '#94A3B8'}}>Host streaming</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const genderInputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#1E2533',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  placeholder: {
    color: '#8C8C8C',
    flex: 1,
  },
  inputText: {
    color: 'white',
    flex: 1,
  },
  picker: {
    flex: 1,
    color: '8C8C8C',
    backgroundColor: 'transparent',
    margin: -8, // To align properly within the container,
  },
});

const pickerStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    height: '100%',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneText: {
    color: '#D4ACFB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    color: 'white',
    backgroundColor: '#1E293B',
  },
});

const profileStyles = StyleSheet.create({
  profileContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E2533',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 15,
  },
  imageButtons: {
    flex: 1,
  },
  button: {
    backgroundColor: '#1E2533',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#D4ACFB',
    fontWeight: 'bold',
  },
});

const styles = StyleSheet.create({
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementContainer: {
    width: '80%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 700,
    fontSize: 32,
    marginBottom: 10,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 282,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#D4ACFB',
    // marginTop: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 16,
  },
  loginText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 16,
    marginTop: 15,
  },
  icon: {
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#1E2533',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    color: 'white',
    height: 50,
  },
});
