import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const GamePieces = () => {
  return (
    <View style={styles.container}>
      {/* Main container for both game pieces */}
      <View style={styles.gameComponentsContainer}>
        {/* Game tokens/pawns */}
        <Image
          source={{ uri: "https://s3-alpha-sig.figma.com/img/90cd/5729/8a8702e394f05a42bd25058490649eb6?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=T13tFWW7bRtDjdgjCwiVQANJ7y~FWhN3vclPokzaPSIVWVES2MYlmbiNokp2HaI3MCt45jQCBEDVf8Fge113sKWXIxwR9st3-GMOS9HFnHapXNGvCPaaUjI5mf703~WrorswAhEDIo0TE-9UiLtOWJb1wKbKPxG5IeEZX1W5aylyfM41oD0HN~fegYw2sc4Fx0joALkGlIUqQ3BTuHXGftIFncTyZc7UPC~ZSh5p~Ij8kbjpU~hxeZY8ypvWUwxg0-FMG5SIvBjJk8R2dFK0OQ-eBvWJ0qQx9PnLwc7BspZSJsixt1jeaBXHs03BVkEAGimlB5GpKdZLqndxsJ-btA__" }}
          style={styles.tokens}
          resizeMode="contain"
        />
        
        {/* Dice */}
        <Image
          source={{ uri: "https://s3-alpha-sig.figma.com/img/50a4/0f1a/29f41e0c39d4ea780d6be88704c58797?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=lnmON-2z7pQN4QL157NqfXy~-9tzzRTf-NBvdDlWoQFzyPtZTOQuoHirz4eNAvHaD-3BSw6D-y~UbUqVTZ3YIocYvBHgSP39jJL1-f1gF1OjPYedj6OmjQEIMrsNFRG4bur~qvXFuBfqJX0rfEE4GKTy0Tp3SIM859ylwP4e-ZHblTqC5wwPbku-57H-UyGVspPqrOrFX7jRN2VZyntFyprjt~~PPqR5E54KU2hS4exh5H2FYKqsJww8hX1tLJcL37uc7iOeOPLkCImT-lyiPlW8JVaziFQXoYrs9~be7LaDv~MfkGc6Pzro~oqBeUkR-DpKPcFkwCbDWryLrbeEWw__" }}
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
    // backgroundColor: '#ffb6b9', // Pink background color
    // justifyContent: 'center',
    // alignItems: 'center',
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