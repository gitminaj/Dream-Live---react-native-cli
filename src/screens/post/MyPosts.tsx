import React, {useEffect, useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {UserContext} from '../../utils/context/user-context';
import Video from 'react-native-video';

const Width = Dimensions.get('window').width;
const bannerWidth = Width * 0.4;

// icons
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {BACKEND_URL} from '../../utils/constant';

const MyPosts = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {user, following, followers, refreshAllUserData, userPost} =
    useContext(UserContext);

  console.log('userPost', userPost);

  const navigation = useNavigation();

  const onRefresh = () => {
    setRefreshing(true);
    refreshAllUserData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    refreshAllUserData();
  }, []);

  // Function to determine if a post is a video based on the file extension
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

const renderMedia = (feed) => {
  if (!feed?.postUrl) return null;

  const mediaUrl = feed.postUrl.startsWith('http') 
    ? feed.postUrl.replace(/\\/g, '/')
    : `${BACKEND_URL}/${feed.postUrl.replace(/\\/g, '/')}`;

  console.log('Rendering media:', mediaUrl);

  if (isVideo(feed.postUrl)) {
    return (
      <View style={styles.mediaContainer}>
        <Video
          source={{uri: mediaUrl}}
          style={styles.video}
          resizeMode="cover"
          paused={true}
          controls={false}
          onError={(e) => console.log('Video Error:', e)}
        />
        <TouchableOpacity style={styles.playButton}>
          <AntDesign name="playcircleo" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mediaContainer}>
      <Image
        source={{uri: mediaUrl}}
        style={styles.image}
        onError={(e) => console.log('Image Error:', e.nativeEvent.error)}
      />
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.mainFeedContainer}>
          {userPost.map((feed, index) => (
            <View 
              key={index} 
              style={styles.postItemContainer}
            >
              <TouchableOpacity onPress={() => navigation.navigate('PostsScreen')}>
                <View style={styles.mainContainer}>
                  <View style={styles.shadowWrapper}>
                    <View style={styles.outerContainer}>
                      {renderMedia(feed)}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  mainFeedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  postItemContainer: {
    width: '48%',
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mainContainer: {
    width: '100%',
  },
  shadowWrapper: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  outerContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 8,
  },
  chitChatText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '700',
  },
  chitChatContainer: {
    flexDirection: 'row',
    backgroundColor: '#747474',
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    width: 70,
  },
  feedcontainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  chatContainer: {},
  nameText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  feedFooter: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
  },
  feedHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  liveContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 10,
    borderRadius: 40,
    backgroundColor: '#F05858',
  },
  watchingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    backgroundColor: '#747474',
    paddingHorizontal: 10,
  },
  liveText: {
    fontSize: 5,
    fontWeight: '700',
    color: 'white',
  },
  watchingText: {
    fontSize: 5,
    fontWeight: '700',
    color: 'white',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#1a1a1a',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  icon: {
    width: Width * 0.06,
    height: Width * 0.06,
  },
});

export default MyPosts;