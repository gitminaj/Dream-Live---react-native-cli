import React, { useEffect, useRef } from "react";
import { View, Text , TouchableOpacity, Image, StyleSheet, Dimensions, Animated } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
const { height } = Dimensions.get("window");
import { useNavigation } from '@react-navigation/native';
import GetStartedBtn from "../components/GetStartedBtn";

export default function OnBoarding() {
  const navigation = useNavigation();
  // Animation values for each circle
  const topCircleAnim = useRef(new Animated.Value(0)).current;
  const bottomLeftAnim = useRef(new Animated.Value(0)).current;
  const bottomRightAnim = useRef(new Animated.Value(0)).current;
  
  // Animation values for text
  const textAnim1 = useRef(new Animated.Value(0)).current;
  const textAnim2 = useRef(new Animated.Value(0)).current;
  const textAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations with slight delay between each circle
    Animated.stagger(200, [
      // Top circle animation - bounce in from top
      Animated.spring(topCircleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      // Bottom left circle animation - fade and scale in
      Animated.spring(bottomLeftAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      // Bottom right circle animation - slide in from right
      Animated.spring(bottomRightAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      
      // Text animations - fade in and slide up in sequence
      Animated.timing(textAnim1, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim2, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim3, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate animation styles for circles
  const topCircleStyle = {
    opacity: topCircleAnim,
    transform: [
      { translateY: topCircleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0]
      })},
      { rotate: '15deg' },
      { scale: topCircleAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 1.2, 1]
      })}
    ]
  };

  const bottomLeftStyle = {
    opacity: bottomLeftAnim,
    transform: [
      { translateX: bottomLeftAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-30, 0]
      })},
      { rotate: '-15deg' },
      { scale: bottomLeftAnim }
    ]
  };

  const bottomRightStyle = {
    opacity: bottomRightAnim,
    transform: [
      { translateX: bottomRightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0]
      })},
      { rotate: '15deg' },
      { scaleX: -1 }
    ]
  };
  
  // Text animation styles
  const textStyle1 = {
    opacity: textAnim1,
    transform: [
      { translateY: textAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
      })}
    ]
  };
  
  const textStyle2 = {
    opacity: textAnim2,
    transform: [
      { translateY: textAnim2.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
      })}
    ]
  };
  
  const textStyle3 = {
    opacity: textAnim3,
    transform: [
      { translateY: textAnim3.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
      })},
      { scale: textAnim3.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.9, 1.1, 1]
      })}
    ]
  };

  return (
    <>
      <LinearGradient
        colors={["#0F172A", "#D4ACFB"]}
        locations={[0, 1]}
        style={[styles.linearGradient, { height: height * 1 }]}
      >
        <View style={styles.outerContainer}>
          <View style={styles.container}>
            <Animated.View style={[styles.circleContainer, styles.topCircle, topCircleStyle]}>
              <Image
                source={require('../assets/speakerGirl.png')}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View style={[styles.circleContainer, styles.bottomLeftCircle, bottomLeftStyle]}>
              <Image
                source={require("../assets/secondImg.png")}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View style={[styles.circleContainer, styles.bottomRightCircle, bottomRightStyle]}>
              <Image
                source={require('../assets/boyHandle.png')}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
          </View>
          <Animated.Text style={[styles.txt, textStyle1]}>Explore the world collect power-ups</Animated.Text>
          <Animated.Text style={[styles.txt, textStyle2]}>become the ultimate</Animated.Text>
          <Animated.Text style={[styles.txt, textStyle3]}>Ready to play</Animated.Text>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('OnBoardingSlider') } >
            <GetStartedBtn style={styles.btn} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 85,
  },
  linearGradient: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 10
  },
  btnContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  outerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  txt:{
    color: 'white',
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
  container: {
    width: 270,
    height: 250,
    position: "relative",
    marginTop: 180,
  },
  circleContainer: {
    width: 120,
    height: 120,
    borderRadius: 50,
    overflow: "hidden",
    position: "absolute",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topCircle: {
    top: 0,
    left: 50,
    zIndex: 3,
  },
  bottomLeftCircle: {
    bottom: 10,
    left: 10,
    zIndex: 1,
  },
  bottomRightCircle: {
    top: 95,
    right: 10,
    zIndex: 2,
  },
});