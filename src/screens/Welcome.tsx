import React, { useEffect, useRef, useState, useContext } from 'react';
import { View, Animated, StyleSheet, Image, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getDataFromStore, removeDataFromStore } from '../store';
import { socket } from '../utils/socket';

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const navigation = useNavigation();

  const [currentImage, setCurrentImage] = useState(require('../assets/firstImg.png'));
  const secondImage = require('../assets/secondImg.png');

  

  useEffect(() => {
    // Initial fade in with scale effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();

    // Sequence for transition to second image then navigate
    const timeout = setTimeout(() => {
      const handleNavigation = async () => {
        // await removeDataFromStore('token')
        const token = await getDataFromStore('token');
        console.log('token', token);
        if(token){
          navigation.replace('Home')
        }else{
  
          navigation.replace('Third');
        }
      }

      handleNavigation();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(()=>{
      const handle = async () => {
        // await removeDataFromStore('token')
        const token = await getDataFromStore('token');
        const user = await getDataFromStore('user');
        console.log('token', token);
        console.log('user welcome', user)
        if(token && user){

  console.log('user welcome', user);
  socket.emit('authenticate', {userId: user?._id});
        }
      }
      handle();
  },[]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#D4ACFB']}
        locations={[0, 0.5]}
        style={styles.linearGradient}
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}>
          <Image style={styles.img} source={currentImage} />
        </Animated.View>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
});
