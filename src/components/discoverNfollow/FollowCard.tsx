import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {BASE_URL} from '../../utils/constant';
import {getDataFromStore} from '../../store';
import {UserContext} from '../../utils/context/user-context';

const Width = Dimensions.get('window').width;
const bannerWidth = Width * 0.4;

export default function FollowCard({name, image, id}) {
  const {user} = useContext(UserContext);
  const navigation = useNavigation();

  const handleChat = async () => {
    const token = await getDataFromStore('token');
    console.log('token', token);
    console.log('user', user);

    const payload = {
      userId: user._id,
      receiverId: id,
    };

    console.log('payload', payload);

    let roomId;
    let roomDetails;

    try {
      const existingRoom = await axios.post(
        `${BASE_URL}/chat/rooms/privateroom`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('existing room', existingRoom);
      roomDetails = existingRoom?.data;
      roomId = existingRoom?.data?.data?._id;
    } catch (error) {
      console.log('Room not found, creating new one...');
    }

    if (!roomId) {
      try {
        const res = await axios.post(
          `${BASE_URL}/chat/rooms/createPrivateRoom`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log('New room created', res);
        roomDetails = res?.data;
        roomId = res.data.roomId;
      } catch (error) {
        console.log('Error creating room:', error);
      }
    }

    navigation.navigate('Chat', {roomId, receiverUserId: id, roomDetails });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row'}}>
          <Image style={styles.profileImage} source={{uri: String(image)}} />
          <View>
            <Text style={styles.name}>{name || 'unknow'}</Text>
            <Text style={styles.timestamp}>6 hour ago</Text>
          </View>
        </View>
        <View>
          {/* <Link href="/chat" > */}
          <TouchableOpacity onPress={() => handleChat(id)}>
            <Text style={styles.chatBtn}>Chat</Text>
          </TouchableOpacity>
          {/* </Link> */}
        </View>
      </View>

      {/* <Image
        style={styles.mainBanner}
        resizeMode="cover"
        source={image}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 20,
  },
  name: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 8,
  },
  chatBtn: {
    fontSize: 8,
    fontWeight: '600',
    color: '#D4ACFB',
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#D4ACFB',
    paddingHorizontal: 15,
    paddingVertical: 3,
  },
  mainBanner: {
    width: bannerWidth,
    height: Width * 0.6,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 10,
  },
});
