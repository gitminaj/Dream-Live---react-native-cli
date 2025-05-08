import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, Image, TouchableOpacity, ActionSheetIOS, Platform, Alert } from "react-native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useState } from 'react';

import Feather from 'react-native-vector-icons/Feather';

export default function HomeFooter() {
  const navigation = useNavigation();
  
  const handlePostPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery', 'Record Video'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          } else if (buttonIndex === 3) {
            recordVideo();
          }
        }
      );
    } else {
      // For Android, show a custom dialog or directly access gallery
      Alert.alert(
        'Create a Post',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickImage },
          { text: 'Record Video', onPress: recordVideo },
        ]
      );
    }
  };

  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        // Navigate to create post screen with the image
        navigation.navigate('CreatePost', { 
          media: {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName
          } 
        });
      }
    });
  };

  const pickImage = () => {
    const options = {
      mediaType: 'mixed', // Can choose both photo and video
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        // Navigate to create post screen with the image
        navigation.navigate('CreatePost', { 
          media: {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName
          } 
        });
      }
    });
  };

  const recordVideo = () => {
    const options = {
      mediaType: 'video',
      quality: 1,
      videoQuality: 'high',
      durationLimit: 60, // limit to 1 minute
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled video recording');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        // Navigate to create post screen with the video
        navigation.navigate('CreatePost', { 
          media: {
            uri: response.assets[0].uri,
            type: response.assets[0].type,
            name: response.assets[0].fileName
          } 
        });
      }
    });
  };

  return (
    <>
      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} >
          <Image
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
            source={require("../assets/home.png")}
          />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>
        
        <View>
          <Image
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
            source={require("../assets/dice.png")}
          />
          <Text style={styles.footerText}>Games</Text>
         </View>
        
        <TouchableOpacity onPress={handlePostPress}>
          {/* <Image
            resizeMode="contain"
            style={{ width: 25, height: 25}}
            source={require("../assets/daimond.png")}
          /> */}
          <Feather name='plus-circle' style={{  color: 'white' }} size={30} />
          <Text style={styles.footerText}>Post</Text>
        </TouchableOpacity>
        
        <View>
          <Image
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
            source={require("../assets/mic.png")}
          />
          <Text style={styles.footerText}>Audio</Text>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('MessageList')}>
          <Image
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
            source={require("../assets/message.png")}
          />
          <Text style={styles.footerText}>Message</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footerText:{
    fontSize: 8,
    color: 'white',
    alignSelf: 'center',
  },
  footerContainer: {
    backgroundColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 10
  },
  middleNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    alignItems: 'center'
  },
});