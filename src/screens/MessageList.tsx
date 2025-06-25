import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import axios from 'axios';
import {BACKEND_URL, BASE_URL} from '../utils/constant';
import {UserContext} from '../utils/context/user-context';
import {getDataFromStore} from '../store';

import Icon from 'react-native-vector-icons/Ionicons';

const MessageList = () => {
  const {user} = useContext(UserContext);
  const navigation = useNavigation();
  const [rooms, setRooms] = useState();
  const [roomsDetails, setRoomsDetails] = useState();

  useEffect(() => {
    const getRooms = async () => {
      const token = await getDataFromStore('token');

      const response = await axios.get(
        `${BASE_URL}/chat/rooms/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRoomsDetails(response?.data?.chatRooms.filter(room => room.type === "private"))

      setRooms(
  response.data.chatRooms
    .filter(room => room.type === "private") // ✅ only keep private rooms
    .map(room =>
      room.participants.filter(partic => partic._id !== user._id)[0]
    )
);
      console.log('res room', response);
    };
    
    getRooms();
    console.log('rooms', rooms);
  }, []);

  const renderChatItem = ({item}) =>{ 
    const users = item.participants.filter(partic => partic?._id !== user?._id);
    console.log('item', item);
    console.log('users', users);
        
    return (
    <TouchableOpacity
    key={item._id}
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', {roomId: item?._id , receiverUserId: users[0]?._id , roomDetails:{ data: item}})}>
      <Image source={{
                  uri: `${users[0]?.profile}`,
                }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{users[0]?.name}</Text>
        <Text style={styles.chatStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  )};

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                      >
                        <Icon name="chevron-back" size={24} color="#FFFFFF" />
                      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chats</Text>
      <TouchableOpacity style={styles.inviteButton}>
        <Feather
          name="user-plus"
          style={{color: 'white', marginRight: 5}}
          size={12}
        />

        <Text style={styles.inviteText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {renderHeader()}

      <View style={styles.searchContainer}>
        {/* <Image 
        //   source={require('../assets/search-icon.png')} 
          style={styles.searchIcon} 
        /> */}
        <Feather name="search" style={{color: '#747474'}} size={20} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#747474"
        />
      </View>

      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>Message</Text>
      </View>

      <FlatList
        data={roomsDetails}
        renderItem={renderChatItem}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark navy background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderColor: 'white',
    borderWidth: 1,
  },
  inviteIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: 'white',
  },
  inviteText: {
    color: 'white',
    fontSize: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#434343',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  searchIcon: {
    width: 18,
    height: 18,
    color: '#747474',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  messageSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: '#3B82F6', // Blue color for avatar background
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  chatStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default MessageList;
