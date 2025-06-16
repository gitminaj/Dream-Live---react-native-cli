import {useRoute, useNavigation} from '@react-navigation/native';
import React, {useContext, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {BASE_URL} from '../../utils/constant';
import axios from 'axios';
import {storeDataInStore} from '../../store';
import {UserContext} from '../../utils/context/user-context';
import {socket} from '../../utils/socket';

import * as Burnt from 'burnt';

const {width} = Dimensions.get('window');
const scale = width / 375;
const normalize = size => Math.round(scale * size);

export default function EmailVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const route = useRoute();
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const {formData, fileData} = route.params;

  const {refreshAllUserData} = useContext(UserContext);

  //   const  userData  ={
  //     userName: "name",
  //   email: 'mail@gmail.com',
  //   password: 'password',
  //   gender: 'M',
  //   age: Number(5),
  //   location: 'mumbhai',
  //   otp: 74581
  // }

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const userEnteredOtp = otp.join('');

    console.log('Form data from route:', formData);
    console.log('File data from route:', fileData);
    console.log('OTP entered:', userEnteredOtp);

    const formDataToSubmit = new FormData();

    Object.keys(formData).forEach(key => {
      formDataToSubmit.append(key, formData[key]);
    });

    formDataToSubmit.append('otp', userEnteredOtp.trim());

    // Only add profile if user selected one
    if (fileData) {
      formDataToSubmit.append('profile', fileData);
    }

    try {
      console.log('Submitting FormData payload', formDataToSubmit);
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        formDataToSubmit,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        },
      );
      console.log('Registration response:', response);
      const {token, user} = response.data;

      await storeDataInStore('token', token);
      await storeDataInStore('user', user);
      refreshAllUserData();

      if (socket.disconnected) {
        socket.connect();
      }

      socket.emit('authenticate', {userId: user?._id});
        Burnt.toast({
                title: 'Registered Successfully!',
                preset: 'done',
              });
      navigation.replace('Home');
    } catch (err) {
      console.log('Registration error:', JSON.stringify(err, null, 2));
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Registration failed',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Verify Email</Text>
      {error && <Text style={{color: 'red'}}> {error} </Text>}

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={({nativeEvent}) =>
              handleBackspace(nativeEvent.key, index)
            }
          />
        ))}
      </View>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
        <Text style={styles.verifyText}>Verify</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f162b',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  title: {
    fontSize: normalize(24),
    color: 'white',
    marginBottom: normalize(60),
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: normalize(30),
    marginTop: normalize(50),
  },
  otpInput: {
    width: normalize(40),
    height: normalize(50),
    borderRadius: normalize(5),
    backgroundColor: '#1e293b',
    textAlign: 'center',
    color: 'white',
    fontSize: normalize(18),
    marginHorizontal: normalize(5),
  },
  verifyButton: {
    backgroundColor: '#FB923C',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(95),
    borderRadius: normalize(25),
  },
  verifyText: {
    color: 'white',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
});
