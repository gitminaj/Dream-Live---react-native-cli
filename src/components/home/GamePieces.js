import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const GamePieces = () => {
  return (
    <View style={styles.container}>
      {/* Main container for both game pieces */}
      <View style={styles.gameComponentsContainer}>
        {/* Game tokens/pawns */}
        <Image
          source={require('../../assets/playGame/token.png')}
          style={styles.tokens}
          resizeMode="contain"
        />
        
        {/* Dice */}
        <Image
          source={require('../../assets/playGame/dice.png')}
          style={styles.dice}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginRight: 10
  },
  gameComponentsContainer: {
    // width: width * 0.8,
    // height: height * 0.4,
    position: 'relative',
  },
  tokens: {
    // position: 'absolute',
    width: 20,
    height: 20,
    top: 10,
    right: 0,
    zIndex: 1,
  },
  dice: {
    position: 'relative',
    width: 20,
    height: 20,
    right: 10,
    zIndex: 2,

  }
});

export default GamePieces;