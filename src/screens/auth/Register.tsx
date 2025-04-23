import { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
const { height } = Dimensions.get("window");
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../utils/constant';
import { registerSchema } from "../../utils/schema/register";


// icons
import IconName from "react-native-vector-icons/AntDesign";
import IconEmail from "react-native-vector-icons/Fontisto";
import IconPhone from "react-native-vector-icons/Feather";
import IconGender from "react-native-vector-icons/MaterialCommunityIcons";
import IconDob from "react-native-vector-icons/FontAwesome6";

import { InputWithIcon } from "../../components/InputWithIcon";



export default function Register() {
  const [error, setError] = useState('');
    const navigation = useNavigation();


  const [form, setForm] = useState({
    name: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    profile: '',
  });
  
  const handleChange = (fieldName, value) => {
    setForm({ ...form, [fieldName]: value });
  };

  const handleSubmit = async () =>{

    const result = registerSchema.safeParse(form);

    console.log('result',result)
    console.log('form daata', form);

    if(result.success){
        try {
          const response = await axios.post(`${BASE_URL}/auth/register`, form);
          console.log('response', response);
          navigation.navigate('Login');
        } catch (err) {
          console.log('error: ', err)
          setError(err.response?.data?.message || 'Registration failed');
        }
    }else{
      const errorMessages = result.error.errors.map(err => err.message);
    setError(errorMessages.join(', '));
    console.log('Validation errors:', errorMessages);
    }
  }



  return (
    <>
      <View style={styles.container}>
        <View style={styles.elementContainer}>
          <Text style={styles.text}>Register</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* <View style={styles.inputContainer}>
            <Icon name="idcard" size={20} color="#8C8C8C" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#8C8C8C"
              // value={value}
              onChangeText={onChangeText}
              // secureTextEntry={secureTextEntry}
              underlineColorAndroid="transparent"
            />
          </View> */}

          <InputWithIcon
            placeholder="Name"
            value={form.name}
            onChangeText={(name) => handleChange('name', name) }
            icon={
              <IconName
                name="idcard"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
          />
          <InputWithIcon
            placeholder="Email"
            value={form.email}
            onChangeText={(email) => handleChange('email', email)}
            icon={
              <IconEmail
                name="email"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
            keyboardType="email-address"
          />
          <InputWithIcon
            placeholder="Phone"
            value={form.phone}
            onChangeText={(phone) => handleChange('phone', phone)}
            icon={
              <IconPhone
                name="phone"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
            keyboardType="phone-pad"
          />
          <InputWithIcon
            placeholder="Gender"
            value={form.gender}
            onChangeText={(gender) => handleChange('gender', gender)}
            icon={
              <IconGender
                name="face-recognition"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
          />
          <InputWithIcon
            placeholder="DOB"
            value={form.dateOfBirth}
            onChangeText={(dob) => handleChange('dateOfBirth', dob)}
            icon={
              <IconDob
                name="cake-candles"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
          />
          <InputWithIcon
            placeholder="Profile Picture"
               value={form.profile}
               onChangeText={(profile) => handleChange('profile', profile)}
            icon={
              <IconName
                name="idcard"
                size={20}
                color="#8C8C8C"
                style={styles.icon}
              />
            }
          />
          <TouchableOpacity onPress = {handleSubmit} style={styles.btn}>
            <Text style={styles.btnText}>Sign up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress = {() => navigation.navigate('Login')} style={styles.loginText}>
            <Text style={{ color: "#94A3B8" }} >Login?</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: '#FF6B6B',
    // marginTop: 10,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: "center",
  },
  elementContainer: {
    width: "80%",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: 700,
    fontSize: 32,
    marginBottom: 20,
  },
  btn: {
    justifyContent: "center",
    alignItems: "center",
    width: 282,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#D4ACFB",
    marginTop: 40,
  },
  btnText: {
    color: "white",
    fontWeight: 700,
    fontSize: 16,
  },
  loginText: {
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    marginTop: 15
  },
});
