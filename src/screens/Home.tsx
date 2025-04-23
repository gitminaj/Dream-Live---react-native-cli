import { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Fontisto";
import HomeFooter from "../components/HomeFooter";
import SingleFeed from "../components/home/SingleFeed";
import CharacterArrangement from "../components/home/CharacterArrangement";
import GamePieces from "../components/home/GamePieces";

import { InputWithIcon } from "../components/InputWithIcon";

export default function Home() {
  // Animation values
  const blueBoxAnim = useRef(new Animated.Value(-200)).current;
  const redBoxAnim = useRef(new Animated.Value(200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(-50)).current; // For header slide-in from top

  // Start animations when component mounts
  useEffect(() => {
    // Slide in animations
    Animated.parallel([
      // Header animation - slide from top
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(blueBoxAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(redBoxAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation loop
    startPulseAnimation();
  }, []);

  // Pulse animation function
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <>
      <View style={styles.container}>
        {/* Wrap header in Animated.View for slide-in from top animation */}
        <Animated.View 
          style={[
            styles.headerContainer, 
            { transform: [{ translateY: headerAnim }], opacity: fadeAnim }
          ]}
        >
          <View style={styles.btnLang}>
            <Text style={styles.btnText}>En</Text>
          </View>
          <Image
            resizeMode="contain"
            style={{ width: 20, height: 20 }}
            source={require("../assets/daimond.png")}
          />

          <View style={styles.searchInput}>
            <View style={styles.inputContainer}>
              <Icon
                name="search"
                size={15}
                color="#8C8C8C"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="search..."
                placeholderTextColor="#8C8C8C"
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          <Animated.View style={[styles.btn, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.btnText}>Go Live</Text>
          </Animated.View>

          <Image
            resizeMode="contain"
            style={{ width: 24, height: 24 }}
            source={require("../assets/profileIcon.png")}
          />
        </Animated.View>

        <View style={styles.callContainer}>
          {/* blue box joincall with animation */}
          <Animated.View style={{ 
            width: "45%", 
            transform: [{ translateX: blueBoxAnim }],
            opacity: fadeAnim 
          }}>
            <LinearGradient
              style={styles.joinCall}
              end={{ x: 1, y: 0 }}
              colors={["#0974D0", "#9FCCFA"]}
              locations={[0, 0.9]}
            >
              <View style={styles.joinCallLeft}>
                <Text style={{ color: "white", fontSize: 10, fontWeight: 700 }}>
                  Join call
                </Text>
                <View style={styles.joinCall2}>
                  <Image
                    style={styles.chair}
                    resizeMode="cover"
                    source={require("../assets/chair.png")}
                  />
                  <Text style={styles.views}>52k</Text>
                </View>
              </View>
              <View>
                <CharacterArrangement />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* red box play game with animation */}
          <Animated.View style={{ 
            width: "45%", 
            transform: [{ translateX: redBoxAnim }],
            opacity: fadeAnim 
          }}>
            <LinearGradient
              style={styles.joinCall}
              end={{ x: 1, y: 0 }}
              colors={["#FF5830", "#FFC8C8"]}
              locations={[0, 0.9]}
            >
              <View style={styles.joinCallLeft}>
                <Text style={{ color: "white", fontSize: 10, fontWeight: 700 }}>
                  Play Game
                </Text>
                <View style={styles.joinCall2}>
                  <Image
                    style={styles.chair}
                    resizeMode="cover"
                    source={require("../assets/console.png")}
                  />
                  <Text style={styles.views}>52k</Text>
                </View>
              </View>
              <View>
                <GamePieces />
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.chatrooms, { opacity: fadeAnim }]}>
          Live Chatrooms
        </Animated.Text>

        <Animated.View style={[styles.filter, { opacity: fadeAnim }]}>
          <View style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>All</Text>
          </View>
          <View style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Following</Text>
          </View>
          <View style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Love💖</Text>
          </View>
          <View style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Chatroom</Text>
          </View>
          <View style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>🔥New</Text>
          </View>
          <View style={styles.filterBtn}>
            <Text style={styles.filterBtnText}>Audio</Text>
          </View>
        </Animated.View>

        <ScrollView
          horizontal={false}
          vertical={true}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.mainFeedContainer}>
            <SingleFeed
              name={"Emilly Watson"}
              image={require("../assets/homeFeed/emmily.png")}
            />
            <SingleFeed
              name={"jhon Watson"}
              image={require("../assets/homeFeed/jhon.png")}
            />
            <SingleFeed
              name={"jhon Watson"}
              image={require("../assets/homeFeed/jhon.png")}
            />
            <SingleFeed
              name={"Emilly Watson"}
              image={require("../assets/homeFeed/emmily.png")}
            />
            <SingleFeed
              name={"Emilly Watson"}
              image={require("../assets/homeFeed/emmily.png")}
            />
            <SingleFeed
              name={"jhon Watson"}
              image={require("../assets/homeFeed/jhon.png")}
            />
            <SingleFeed
              name={"jhon Watson"}
              image={require("../assets/homeFeed/jhon.png")}
            />
            <SingleFeed
              name={"Emilly Watson"}
              image={require("../assets/homeFeed/emmily.png")}
            />
          </View>
        </ScrollView>
      </View>
      <HomeFooter />
    </>
  );
}

const styles = StyleSheet.create({
  mainFeedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    flexWrap: "wrap",
    paddingLeft: 3,
  },
  filterBtnText: {
    fontSize: 8,
    fontWeight: 700,
  },
  filterBtn: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#D4ACFB",
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  filter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 10,
    columnGap: 10,
    marginTop: 20,
    paddingHorizontal: 3,
    width: "100%",
  },
  chatrooms: {
    color: "white",
    fontWeight: 700,
    alignSelf: "flex-start",
    marginTop: 30,
    fontSize: 10,
  },
  joinCall2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  views: {
    alignItems: "center",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 8,
    fontWeight: 700,
  },
  chair: {
    width: 15,
    height: 15,
  },
  callContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  joinCallLeft: {
    paddingLeft: 10,
  },
  joinCall: {
    marginTop: 30,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 53,
    borderRadius: 5,
    flexDirection: "row",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2533",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginVertical: 5,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 14,
    outlineStyle: "none",
  },
  btn: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 20,
    borderRadius: 40,
    backgroundColor: "#D4ACFB",
  },
  btnLang: {
    justifyContent: "center",
    alignItems: "center",
    width: 25,
    height: 15,
    borderRadius: 5,
    backgroundColor: "#D4ACFB",
  },
  btnText: {
    color: "white",
    fontWeight: 700,
    fontSize: 8,
  },
  searchInput: {
    width: "50%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: "#0F172A",
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    marginTop: 10,
  },
});