import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { requestMultiple, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const useGalleryPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        setHasPermission(result === RESULTS.GRANTED || result === RESULTS.LIMITED);
      } else {
        if (Platform.Version >= 33) {
          // Android 13+ needs both
          const results = await requestMultiple([
            PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
            PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
          ]);

          const hasImage = results[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED;
          const hasVideo = results[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === RESULTS.GRANTED;

          setHasPermission(hasImage && hasVideo);
        } else {
          // Android 12 and below
          const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          setHasPermission(result === RESULTS.GRANTED);
        }
      }
    };

    checkPermission();
  }, []);

  return hasPermission;
};

export default useGalleryPermission;
