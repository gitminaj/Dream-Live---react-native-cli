import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const useGalleryPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED || result === RESULTS.LIMITED);
    };

    checkPermission();
  }, []);

  return hasPermission;
};

export default useGalleryPermission;
