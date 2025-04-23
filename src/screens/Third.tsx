import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GetStartedBtn from '../components/GetStartedBtn';

const { height } = Dimensions.get('window');

export default function Third() {
  const navigation = useNavigation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(100)).current;
  
  // Text animations
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(30)).current;
  const subtitleSlideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Text animations sequence
      Animated.stagger(250, [
        Animated.parallel([
          Animated.timing(titleFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(titleSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(subtitleFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.spring(buttonAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleGetStarted = () => {
    navigation.navigate('OnBoarding'); // Ensure "Fourth" is registered in your navigator
  };

  return (
    <LinearGradient 
      colors={['#0F172A', '#D4ACFB']} 
      locations={[0, 1]} 
      style={[styles.linearGradient, { height: height * 1 }]}
    >
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          width: '100%'
        }}
      >
        <LinearGradient 
          colors={['#0F172A', '#334F90']} 
          locations={[0, 1]}
          style={[styles.gradient, { height: height * 0.46 }]}
        >
          <Animated.Image 
            style={{
              width: 221,
              height: 273,
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }]
            }} 
            source={require('../assets/thirdImg.png')}
          />
        </LinearGradient>
      </Animated.View>

      <View style={styles.textContainer}>
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: titleFadeAnim,
              transform: [{ translateY: titleSlideAnim }]
            }
          ]}
        >
          EPIC GAMING AWAITS
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle,
            {
              opacity: subtitleFadeAnim,
              transform: [{ translateY: subtitleSlideAnim }]
            }
          ]}
        >
          Connect with friends, compete in challenges, and level up your gaming experience
        </Animated.Text>
      </View>

      <Animated.View 
        style={[
          styles.btnContainer,
          {
            transform: [{ translateY: buttonAnim }],
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity onPress={handleGetStarted} >
          <GetStartedBtn style={styles.btn}  />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%', 
    justifyContent: 'flex-end', 
    alignItems: 'center',
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 85,
  },
  linearGradient: {
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  textContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 40
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1.2,
    textShadowColor: '#D4ACFB',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16
  },
  btnContainer: {
    alignItems: 'center',
    marginBottom: 60
  },
});