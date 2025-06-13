import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { BACKEND_URL } from '../utils/constant';

const LiveAudioRoom = ({navigation, route}) => {
  const { chatRoomId, chatRoom} = route.params;
  console.log('char room', chatRoomId, chatRoom)
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.hostInfo}>
          <Image
            source={{
                        uri: `${BACKEND_URL}/${chatRoom?.picture.replace(/\\/g, '/')}`,
                      }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.hostName}>{chatRoom?.name}</Text>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followText}>+ Follow</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statusIcons}>
          <Text style={styles.liveText}> Live</Text>
          <AntDesign name="eye" size={18} style={{color: 'white'}} />
          <Text style={styles.viewCount}>1.6k</Text>
          <AntDesign name="setting" size={24} color="#fff" />
          <Feather name="x" size={24} color="#fff" />
        </View>
      </View>

      {/* Participants Row */}
      {/* <ScrollView horizontal style={styles.participantsRow}> */}
      <View style={styles.participantsRow}>
        {[...Array(10)].map((_, idx) => (
          <Image
            key={idx}
            source={require('../assets/homeFeed/jhon.png')}
            style={styles.participantAvatar}
          />
        ))}
      </View>
      {/* </ScrollView> */}

      {/* Waiting Area */}
      <View style={styles.waitingArea}>
        <Image
          source={require('../assets/homeFeed/emmily.png')}
          style={styles.waitingAvatar}
        />
        <Text style={styles.heart}>❤️</Text>
        <Image
          source={require('../assets/homeFeed/emmily.png')}
          style={styles.waitingAvatar}
        />
      </View>
      <Text style={styles.waitingText}>Waiting for the host to start</Text>

      {/* Chat Messages */}
      <ScrollView style={styles.chatContainer}>
        <Text style={styles.chatMsg}>
          <Text style={styles.chatName}>Jhon Doe</Text> has joined the live room
        </Text>
        <Text style={styles.chatMsg}>
          <Text style={styles.chatName}>Jhon Doe</Text> has joined the live room
        </Text>
        <Text style={styles.chatMsg}>
          <Text style={styles.chatName}>Jhon Doe</Text> has joined the live room
        </Text>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TextInput
          style={styles.input}
          placeholder="Say Hi"
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity>
          <Icon name="share" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="videocam" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="card-giftcard" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="sports-esports" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LiveAudioRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostInfo: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 40, height: 40, marginRight: 10, borderRadius: 20},
  hostName: {color: '#fff', fontWeight: 'bold'},
  followBtn: {borderRadius: 20, alignItems: 'flex-start'},
  followText: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: '#D4ACFB',
    color: '#fff',
    fontWeight: 700,
    fontSize: 8,
  },
  statusIcons: {flexDirection: 'row', alignItems: 'center', gap: 10},
  liveText: {color: '#FA5252', marginRight: 5},

  viewCount: {color: '#fff', marginRight: 5},
  participantsRow: {
    flexDirection: 'row',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  participantAvatar: {width: 30, height: 30, borderRadius: 20, marginRight: 5},
  waitingArea: {
    alignSelf: 'center',
    width: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#434343',
    borderRadius: 50,
  },
  waitingAvatar: {width: 40, height: 40, borderRadius: 30},
  heart: {fontSize: 15, color: 'red', marginHorizontal: 5},
  waitingText: {
    color: '#ccc',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 400,
  },
  chatContainer: {flex: 1, marginVertical: 10},
  chatMsg: {color: '#fff', marginVertical: 2},
  chatName: {color: '#5a4fff', fontWeight: 'bold'},
  bottomBar: {flexDirection: 'row', alignItems: 'center', gap: 10},
  input: {
    flex: 1,
    backgroundColor: '#1f2235',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#fff',
  },
});
