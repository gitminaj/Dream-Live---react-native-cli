import {useState, useEffect, useRef, useContext} from 'react';
import {
  ScrollView,
  TextInput,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Fontisto';
import HomeFooter from '../components/HomeFooter';
import SingleFeed from '../components/home/SingleFeed';
import CharacterArrangement from '../components/home/CharacterArrangement';
import GamePieces from '../components/home/GamePieces';
import {useNavigation} from '@react-navigation/native';
import {UserContext} from '../utils/context/user-context';

import {BACKEND_URL, BASE_URL} from '../utils/constant';
import axios from 'axios';
import { getDataFromStore } from '../store';

export default function Home() {
  const [feedData, setFeedData] = useState([])
  const {user} = useContext(UserContext);
  console.log('user home', user);
  const navigation = useNavigation();
  // Animation values
  const blueBoxAnim = useRef(new Animated.Value(-200)).current;
  const redBoxAnim = useRef(new Animated.Value(200)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(-50)).current; // For header slide-in from top

  // Diamond animations
  const diamondScale = useRef(new Animated.Value(1)).current;
  // const diamondRotate = useRef(new Animated.Value(0)).current;
  const diamondOpacity = useRef(new Animated.Value(1)).current;

  // Feed item animations - corrected reference method
  const feedAnimations = useRef(
    [...Array(8)].map(() => new Animated.Value(100)),
  ).current;
  const feedOpacity = useRef(
    [...Array(8)].map(() => new Animated.Value(0)),
  ).current;

  // Sample feed data
  // const feedData = [
  //   {name: 'Emilly Watson', image: require('../assets/homeFeed/emmily.png')},
  //   {name: 'Jhon Watson', image: require('../assets/homeFeed/jhon.png')},
  //   {name: 'Jhon Watson', image: require('../assets/homeFeed/jhon.png')},
  //   {name: 'Emilly Watson', image: require('../assets/homeFeed/emmily.png')},
  //   {name: 'Emilly Watson', image: require('../assets/homeFeed/emmily.png')},
  //   {name: 'Jhon Watson', image: require('../assets/homeFeed/jhon.png')},
  //   {name: 'Jhon Watson', image: require('../assets/homeFeed/jhon.png')},
  //   {name: 'Emilly Watson', image: require('../assets/homeFeed/emmily.png')},
  // ];

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

    // Start feed card animations with staggered delay
    startFeedAnimations();

    // Start diamond animation
    startDiamondAnimation();
  }, []);

  // fetch chat rooms
  useEffect(() => {
    const getChatRooms = async () =>{
      const token = await getDataFromStore('token')
      const res = await axios.get(`${BASE_URL}/chat/groupChatRooms`, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      console.log('resp cahtrooms', res?.data?.data);
      setFeedData(res?.data?.data);
    }
    getChatRooms();
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
      ]),
    ).start();
  };

  // Diamond animation function - combined scale, rotation and opacity
  const startDiamondAnimation = () => {
    // Create a combined animation sequence
    Animated.loop(
      Animated.parallel([
        // Scale animation
        Animated.sequence([
          Animated.timing(diamondScale, {
            toValue: 1.3,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(diamondScale, {
            toValue: 0.9,
            duration: 1500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(diamondScale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),

        // Rotation animation
        //

        // Glittering effect with opacity
        Animated.sequence([
          Animated.timing(diamondOpacity, {
            toValue: 0.7,
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(diamondOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(diamondOpacity, {
            toValue: 0.8,
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(diamondOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.delay(2400), // Wait for the rest of the animation cycle
        ]),
      ]),
    ).start();
  };

  // Staggered animation for feed cards
  const startFeedAnimations = () => {
    // Create animation sequence for each feed item with staggered delay
    const animations = feedAnimations.map((animation, index) => {
      return Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 800,
          delay: 1000 + index * 100, // Staggered delay
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(feedOpacity[index], {
          toValue: 1,
          duration: 800,
          delay: 1000 + index * 100,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  };

  // Calculate rotation interpolation for diamond
  // const spin = diamondRotate.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: ['0deg', '360deg']
  // });

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          horizontal={false}
          vertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          {/* Wrap header in Animated.View for slide-in from top animation */}
          <Animated.View
            style={[
              styles.headerContainer,
              {transform: [{translateY: headerAnim}], opacity: fadeAnim},
            ]}>
            <View style={styles.btnLang}>
              <Text style={styles.btnText}>En</Text>
            </View>

            {/* Diamond with multiple animations */}
            <Animated.View
              style={{
                transform: [
                  {scale: diamondScale},
                  // { rotate: spin }
                ],
                opacity: diamondOpacity,
              }}>
              <Image
                resizeMode="contain"
                style={styles.diamond}
                source={require('../assets/daimond.png')}
              />
            </Animated.View>

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

            <Animated.View
              style={[styles.btn, {transform: [{scale: pulseAnim}]}]}>
              <Text style={styles.btnText}>Go Live</Text>
            </Animated.View>

            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                resizeMode="cover"
                style={{width: 25, height: 25, borderRadius: 40}}
                source={{
                  uri: `${BACKEND_URL}/${user?.profile.replace(/\\/g, '/')}`,
                }}
              />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.callContainer}>
            {/* blue box joincall with animation */}

            <Animated.View
              style={{
                width: '45%',
                transform: [{translateX: blueBoxAnim}],
                opacity: fadeAnim,
              }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LiveAudioRoom')}>
                <LinearGradient
                  style={styles.joinCall}
                  end={{x: 1, y: 0}}
                  colors={['#0974D0', '#9FCCFA']}
                  locations={[0, 0.9]}>
                  <View style={styles.joinCallLeft}>
                    <Text
                      style={{color: 'white', fontSize: 10, fontWeight: 700}}>
                      Join call
                    </Text>
                    <View style={styles.joinCall2}>
                      <Image
                        style={styles.chair}
                        resizeMode="cover"
                        source={require('../assets/chair.png')}
                      />
                      <Text style={styles.views}>52k</Text>
                    </View>
                  </View>
                  <View>
                    <CharacterArrangement />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* red box play game with animation */}
            <Animated.View
              style={{
                width: '45%',
                transform: [{translateX: redBoxAnim}],
                opacity: fadeAnim,
              }}>
              <LinearGradient
                style={styles.joinCall}
                end={{x: 1, y: 0}}
                colors={['#FF5830', '#FFC8C8']}
                locations={[0, 0.9]}>
                <View style={styles.joinCallLeft}>
                  <Text style={{color: 'white', fontSize: 10, fontWeight: 700}}>
                    Play Game
                  </Text>
                  <View style={styles.joinCall2}>
                    <Image
                      style={styles.chair}
                      resizeMode="cover"
                      source={require('../assets/console.png')}
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

          <Animated.Text style={[styles.chatrooms, {opacity: fadeAnim}]}>
            Live Chatrooms
          </Animated.Text>

          <Animated.View style={[styles.filter, {opacity: fadeAnim}]}>
            <View style={styles.filterBtn}>
              <Text style={styles.filterBtnText}>All</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              style={styles.filterBtn}>
              <Text style={styles.filterBtnText}>Discover</Text>
            </TouchableOpacity>
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

          <View style={styles.mainFeedContainer}>
            {feedData?.map((feed, index) => { 
              
              const image = `${BACKEND_URL}/${feed?.admin?.profile?.replace(/\\/g, '/')}`
              return(
              <Animated.View
                key={index}
                style={{
                  transform: [{translateY: feedAnimations[index]}],
                  opacity: feedOpacity[index],
                  width: '48%',
                  marginBottom: 10,
                }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    // Create a press animation effect
                    Animated.sequence([
                      Animated.timing(feedAnimations[index], {
                        toValue: -5,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                      Animated.timing(feedAnimations[index], {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                    ]).start();

                    navigation.navigate('ChatRoom');
                  }}>
                  <SingleFeed name={feed.name} image={image} />
                </TouchableOpacity>
              </Animated.View>
            )}
            )}
          </View>
        </ScrollView>
      </View>
      <HomeFooter />
    </>
  );
}

const styles = StyleSheet.create({
  diamond: {
    width: 20,
    height: 20,
  },
  mainFeedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
    paddingLeft: 3,
    marginTop: 10,
  },
  filterBtnText: {
    fontSize: 8,
    fontWeight: 700,
  },
  filterBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#D4ACFB',
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  filter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 10,
    columnGap: 10,
    marginTop: 20,
    paddingHorizontal: 3,
    width: '100%',
  },
  chatrooms: {
    color: 'white',
    fontWeight: 700,
    alignSelf: 'flex-start',
    marginTop: 30,
    fontSize: 10,
  },
  joinCall2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  views: {
    alignItems: 'center',
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 8,
    fontWeight: 700,
  },
  chair: {
    width: 15,
    height: 15,
  },
  callContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  joinCallLeft: {
    paddingLeft: 10,
  },
  joinCall: {
    marginTop: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 53,
    borderRadius: 5,
    flexDirection: 'row',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2533',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginVertical: 5,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    outlineStyle: 'none',
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 20,
    borderRadius: 40,
    backgroundColor: '#D4ACFB',
  },
  btnLang: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 15,
    borderRadius: 5,
    backgroundColor: '#D4ACFB',
  },
  btnText: {
    color: 'white',
    fontWeight: 700,
    fontSize: 8,
  },
  searchInput: {
    width: '50%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#0F172A',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    marginTop: 10,
  },
});
