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

import {InputWithIcon} from '../../components/InputWithIcon';

export default function Register() {
  const [error, setError] = useState(''); 
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    email: false,
    gender: false,
    dateOfBirth: false,
    phone: false,
    password: false,
  });
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    phone: '',
    password: '',
  });

  // Separate state for file data that won't be part of the initial form submission
  const [fileData, setFileData] = useState(null);

  const handleChange = (fieldName, value) => {
    setForm({...form, [fieldName]: value});
    
    // Clear the field error when user types
    if (fieldErrors[fieldName]) {
      setFieldErrors({...fieldErrors, [fieldName]: false});
    }
    
    // Clear password error when user changes password
    if (fieldName === 'password' && error) {
      setError('');
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setError('');
    setFieldErrors({
      name: false,
      email: false,
      gender: false,
      dateOfBirth: false,
      phone: false,
      password: false,
    });

    const result = registerSchema.safeParse(form);

    if (result.success) {
      console.log('inside try');
      try {
        console.log('inside try');
        // First send OTP without image data
        const response = await axios.post(`${BASE_URL}/auth/sendotp`, {
          email: form.email,
        });
        console.log('inside try');
        console.log('response', response);

        // Pass both form data and file data to the verification screen
        navigation.navigate('VerifyEmail', {
          formData: form,
          fileData: fileData,
        });
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

  // Date picker handlers
  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');

    // Format date to display
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    handleChange('dateOfBirth', formattedDate);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <Text style={styles.text}>Register</Text>

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
              placeholder="Phone"
              value={form.phone}
              onChangeText={phone => handleChange('phone', phone)}
              placeholderTextColor="#8C8C8C"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender Dropdown */}
          <View style={[
            genderInputStyles.container,
            fieldErrors.gender && styles.inputError
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
              <Picker.Item label="Gender" value="" color="#8C8C8C" />
              <Picker.Item label="Male" value="Male" color="white" />
              <Picker.Item label="Female" value="Female" color="white" />
              <Picker.Item label="Other" value="Other" color="white" />
            </Picker>
          </View>

          {/* DOB Date Picker */}
          <TouchableOpacity onPress={showDatepicker}>
            <View style={[
              genderInputStyles.container,
              fieldErrors.dateOfBirth && styles.inputError
            ]}>
              <IconDob
                name="cake-candles"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
              <Text
                style={
                  form.dateOfBirth
                    ? genderInputStyles.inputText
                    : genderInputStyles.placeholder
                }>
                {form.dateOfBirth || 'DOB'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Password Input with show/hide feature */}
          <View style={[
            genderInputStyles.container,
            fieldErrors.password && styles.inputError
          ]}>
            <IconPassword
              name="lock"
              size={20}
              color="#8C8C8C"
              style={styles.icon}
            />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <TextInput
                placeholder="Enter your Password"
                value={form.password}
                onChangeText={pass => handleChange('password', pass)}
                secureTextEntry={!showPassword}
                placeholderTextColor="#8C8C8C"
                style={passwordStyles.input}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={passwordStyles.eyeButton}>
                <IconEye
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#8C8C8C"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Picture - Just image and buttons */}
          <View style={profileStyles.profileContainer}>
            {/* Image Preview */}
            {profileImage ? (
              <Image source={profileImage} style={profileStyles.profileImage} />
            ) : (
              <View style={profileStyles.profilePlaceholder}>
                <Text style={{color: '#8C8C8C', alignSelf: 'center'}}>
                  Profile
                </Text>
                <Text style={{color: '#8C8C8C', alignSelf: 'center'}}>
                  Picture
                </Text>
              </View>
            )}

            {/* Gallery and Camera buttons */}
            <View style={profileStyles.imageButtons}>
              <TouchableOpacity
                style={profileStyles.button}
                onPress={selectImage}>
                <Text style={profileStyles.buttonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={profileStyles.button}
                onPress={launchCamera}>
                <Text style={profileStyles.buttonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Show date picker when needed */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()} // Limits selection to today's date
            />
          )}

          <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
            <Text style={styles.btnText}>Sign up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginText}>
          <Text style={{color: '#94A3B8'}}>Login?</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const passwordStyles = StyleSheet.create({
  inputContainer: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 0,
    margin: 0,
    flex: 1,
    height: 50,
  },
  input: {
    color: 'white',
    height: 50,
  },
  eyeButton: {
    padding: 10,
    justifyContent: 'flex-end',
  },
});

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
    color: 'white',
    backgroundColor: 'transparent',
    margin: -8, // To align properly within the container
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