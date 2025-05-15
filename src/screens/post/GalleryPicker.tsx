import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomGalleryBottomSheet from './CustomGalleryBottomSheet';

const GalleryPicker = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    navigation.goBack();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <CustomGalleryBottomSheet 
        navigation={navigation}
        visible={isVisible}
        onClose={handleClose}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GalleryPicker;