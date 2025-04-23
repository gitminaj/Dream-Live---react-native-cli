import React, { useState, useRef } from 'react';
import { 
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { LinearGradient } from 'react-native-linear-gradient';
import GetStartedBtn from '../components/GetStartedBtn';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');


const slides = [
  {
    key: 'slide1',
    title: 'Exclusive access to all offline and online games',
    image: require('../assets/fifthImg.png'), 
    backgroundColor: '#d8c9f0',
  },
  {
    key: 'slide2',
    title: 'Get free slot games and all others gambling games',
    text: 'Enjoy premium gaming content without any cost',
    image: require('../assets/sixthImg.png'), 
    backgroundColor: '#d8c9f0',
  },
  {
    key: 'slide3',
    title: 'Fun games and lot of more',
    text: 'Discover new entertainment options every day',
    image: require('../assets/seventhImg.png'), 
    backgroundColor: '#d8c9f0',
  }
];

const OnBoardingSlider = () => {
    const navigation = useNavigation();
  const [showRealApp, setShowRealApp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  

  // Handle "Next" button press
  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      // Go to next slide
      sliderRef.current?.goToSlide(activeIndex + 1);
      setActiveIndex(activeIndex + 1);
    } else {
        navigation.navigate('Register')
    //   router.navigate('/register')

    }
  };

  // Custom empty pagination - to completely override default pagination
  const renderPagination = () => {
    // Return empty view to override default pagination
    return <View />;
  };

  // Render the slide content with our own pagination and button
  const renderItem = ({ item, index }) => {
    const isLastSlide = index === slides.length - 1;
    
    return (
      <LinearGradient
        colors={["#0F172A", "#D4ACFB"]}
        locations={[0, 1]}
        style={[ { height: height * 1 }]}
      >
        <View style={styles.slide}>
          <Image 
            source={item.image} 
            style={styles.image} 
            resizeMode="cover"
          />
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            
            {/* Custom pagination dots */}
            <View style={styles.paginationDots}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dotStyle,
                    i === activeIndex && styles.activeDotStyle
                  ]}
                />
              ))}
            </View>
            
            {/* Next/Done button */}
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleNext}
            >
              {/* <View style={styles.buttonCircle}>
                <Text style={styles.buttonText}>
                  {isLastSlide ? "Done" : "Next"}
                </Text>
              </View> */}
              <GetStartedBtn/>

            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  };

  // If intro is done, show the main app
  if (showRealApp) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.mainAppText}>
          next screen
        </Text>
      </SafeAreaView>
    );
  }

  // Track slide changes
  const handleSlideChange = (index) => {
    setActiveIndex(index);
  };

  // Render the intro slider with completely overridden pagination
  return (
    <AppIntroSlider
      ref={sliderRef}
      data={slides}
      renderItem={renderItem}
      // onDone={handleDone}
      onSlideChange={handleSlideChange}
      // Key fix: Override pagination with empty component
      renderPagination={renderPagination}
      // Also disable default buttons
      showNextButton={false}
      showDoneButton={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
  },
  image: {
    width: width,
    height: '75%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
    // backgroundColor: '#f0e6ff', // Light purple background
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25, 
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5, 
  },
  dotStyle: {
    backgroundColor: 'white',
    width: 15,
    height: 15,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeDotStyle: {
    backgroundColor: '#9FCCFA',
    width: 15,
    height: 15,
    borderRadius: 15,
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonCircle: {
    width: 140,
    height: 44,
    backgroundColor: '#888',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainAppText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default OnBoardingSlider;