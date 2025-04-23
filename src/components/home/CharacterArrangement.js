import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const CharacterArrangement = () => {
  return (
    <View style={styles.container}>
      {/* Background gradient would go here */}
      <View style={styles.charactersContainer}>
        {/* Top row - two female characters */}
        <View style={styles.topRow}>
          <Image
            source={require('../../assets/joinCallCharacters/topGirl.png')}
            style={styles.topCharacter}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/joinCallCharacters/topGirl.png')}
            style={[styles.topCharacter, styles.secondTopCharacter]}
            resizeMode="contain"
          />
        </View>
        
        {/* Bottom row - three characters */}
        <View style={styles.bottomRow}>
          <Image
            source={require('../../assets/joinCallCharacters/bottomLeftBoy.png')}
            style={[styles.bottomCharacter, styles.leftBottomCharacter]}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/joinCallCharacters/bottomCenterGirl.png')}
            style={[styles.bottomCharacter, styles.centerBottomCharacter]}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/joinCallCharacters/bottomRightUncle.png')}
            style={[styles.bottomCharacter, styles.rightBottomCharacter]}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginTop: 13,
    // marginLeft: 20,
    flex: 1,
    // Here you would add your gradient background
    // backgroundColor: '#33ccff', // Just a placeholder for the blue gradient
  },
  charactersContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 1,
    // marginBottom: -height * 0.08, // Create overlap with bottom row
  },
  bottomRow: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 2,
    alignItems: 'flex-end',
  },
  topCharacter: {
    top: 6,
    left: 4,
    width: 20,
    height: 20,
  },
  secondTopCharacter: {
    left: -2
    // marginLeft: -width * 0.1, // Overlap with first character
  },
  bottomCharacter: {
    width: 20,
    height: 20,
  },
  centerBottomCharacter: {
    // marginLeft: -width * 0.05,
    // marginRight: -width * 0.05,
    zIndex: 2, // Make center character appear on top
  },
  leftBottomCharacter: {
    left: 6
    // marginLeft: -width * 0.02,
  },
  rightBottomCharacter: {
    right: 7
  },
});

export default CharacterArrangement;