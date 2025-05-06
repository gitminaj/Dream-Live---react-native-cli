import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

// Sample data for chat list
const CHATS = [
  {
    id: '1',
    name: 'Jhon Doe',
    avatar: require('../assets/homeFeed/jhon.png'), // You'll need to add this image to your assets
    status: 'New Chat',
    lastMessage: '',
    time: '',
  },
  {
    id: '2',
    name: 'Jhon Doe',
    avatar: require('../assets/homeFeed/jhon.png'),
    status: 'New Chat',
    lastMessage: '',
    time: '',
  },
  {
    id: '3',
    name: 'Jhon Doe',
    avatar: require('../assets/homeFeed/jhon.png'),
    status: 'New Chat',
    lastMessage: '',
    time: '',
  },
];

const MessageList = () => {
  const navigation = useNavigation();

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chat: item })}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Chats</Text>
      <TouchableOpacity style={styles.inviteButton}>
          <Feather name='user-plus' style={{  color: 'white', marginRight: 5 }} size={12} />

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
        <Feather name='search' style={{  color: '#747474'}} size={20} />

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
        data={CHATS}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
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
    borderWidth: 1
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
    backgroundColor: '#3B82F6', // Blue color for avatar background
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