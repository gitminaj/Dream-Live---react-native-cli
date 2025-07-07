import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { socket } from '../../utils/socket';
import { BACKEND_URL, BASE_URL } from '../../utils/constant';
import { getDataFromStore } from '../../store';
import axios from 'axios';
import { UserContext } from '../../utils/context/user-context';

const LiveChatRoom = ({ navigation, route }) => {
  const { chatRoomId, chatRoom, userId } = route.params;
  const { user } = useContext(UserContext);
  // const userId = user._id;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [onlineParticipants, setOnlineParticipants] = useState(chatRoom?.participants || []);
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const messagesRef = useRef(null);

  console.log('chr', chatRoomId, chatRoom, userId );
  console.log('user chatroom', user );

  // Function to handle leaving room with confirmation
  const handleLeaveRoom = () => {
    Alert.alert(
      "Leave Chat Room",
      "Are you sure you want to leave this chat room?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            if (socket) {
              socket.emit('leaveRoom', { chatRoomId });
            }
            navigation.goBack();
          }
        }
      ]
    );
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      handleLeaveRoom();
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      Alert.alert('Error', 'Socket connection not available');
      return;
    }

    // Check if already connected
    if (socket.connected) {
      setIsConnected(true);
      // Authenticate user
      socket.emit('authenticate', { userId });
    }

    // Socket event listeners
    const handleConnect = () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      // Authenticate user
      socket.emit('authenticate', { userId });
    };

    const handleAuthenticated = (data) => {
      if (data.success) {
        // Join the group chat room
        socket.emit('joinGroupChatRoom', { chatRoomId });
      }
    };

    const handleJoinedRoom = (data) => {
      console.log('Joined room:', data.chatRoomId);
      loadMessages();
      // Refresh chatroom data to get updated participants
      refreshChatRoom();
    };

    const handleRoomDeleted = ({ chatRoomId }) => {
      // Show alert or navigate away
      Alert.alert("Room Deleted", "The admin has deleted the chat room.");
      navigation.goBack(); // or navigate to room list
    };

    const handleNewMessage = (message) => {
      // Remove any temporary message with the same tempId or content from same user
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => {
          // Remove temp message with matching tempId
          if (msg.isTemp && message.tempId && msg._id === message.tempId) {
            return false;
          }
          // Also remove temp messages with same content from same user to prevent duplicates
          if (msg.isTemp && 
              msg.content === message.content && 
              msg.sender?._id === message.sender?._id) {
            return false;
          }
          return true;
        });
        
        // Only add the new message if it's not from the current user (to avoid duplicates)
        // Or if it's from current user but replacing a temp message
        const hasTempMessage = prev.some(msg => 
          msg.isTemp && (
            (message.tempId && msg._id === message.tempId) ||
            (msg.content === message.content && msg.sender?._id === message.sender?._id)
          )
        );
        
        if (message.sender?._id !== userId || hasTempMessage) {
          return [...filteredMessages, message];
        }
        
        return filteredMessages;
      });
      scrollToBottom();
    };

    const handleUserJoinedRoom = (data) => {
      console.log('User joined room:', data);
      
      // Refresh chatroom data to get updated participants list
      refreshChatRoom();

      // Add join notification
      const joinMessage = {
        _id: `join_${Date.now()}`,
        content: `${data.userName || 'Someone'} joined the chat`,
        messageType: 'system',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, joinMessage]);
    };

    const handleUserLeftRoom = (data) => {
      console.log('User left room:', data);
      
      // Refresh chatroom data to get updated participants list
      refreshChatRoom();

      // Add leave notification
      const leaveMessage = {
        _id: `leave_${Date.now()}`,
        content: `${data.userName || 'Someone'} left the chat`,
        messageType: 'system',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, leaveMessage]);
    };

    const handleUserOnline = (data) => {
      console.log('User online:', data);
      // Refresh chatroom data to get latest participant status
      refreshChatRoom();
    };

    const handleUserOffline = (data) => {
      console.log('User offline:', data);
      // Refresh chatroom data to get latest participant status
      refreshChatRoom();
    };

    const handleParticipantsUpdated = (data) => {
      console.log('Participants updated via socket:', data);
      if (data.participants) {
        setOnlineParticipants(data.participants);
      }
    };

    const handleDisconnect = () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      Alert.alert('Error', error.message || 'Connection error');
    };

    socket.on('connect', handleConnect);
    socket.on('authenticated', handleAuthenticated);
    socket.on('joinedRoom', handleJoinedRoom);
    socket.on('roomDeleted', handleRoomDeleted);
    socket.on('newMessage', handleNewMessage);
    socket.on('userJoinedRoom', handleUserJoinedRoom);
    socket.on('userLeftRoom', handleUserLeftRoom);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('participantsUpdated', handleParticipantsUpdated);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('authenticated', handleAuthenticated);
      socket.off('joinedRoom', handleJoinedRoom);
      socket.off('roomDeleted', handleRoomDeleted);
      socket.off('newMessage', handleNewMessage);
      socket.off('userJoinedRoom', handleUserJoinedRoom);
      socket.off('userLeftRoom', handleUserLeftRoom);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('participantsUpdated', handleParticipantsUpdated);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
      
      if (socket) {
        socket.emit('leaveRoom', { chatRoomId });
      }
    };
  }, [chatRoomId, userId]);

  const loadMessages = async () => {
    const token = await getDataFromStore('token');
    try {
      const response = await axios.get(
        `${BASE_URL}/chat/rooms/${chatRoomId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('messg res', response);
      
      if (response?.data?.success) {
        setMessages(response?.data?.messages || []);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Function to refresh chatroom data and update participants
  const refreshChatRoom = async () => {
    const token = await getDataFromStore('token');
    try {
      const response = await axios.get(
        `${BASE_URL}/chat/rooms/${chatRoomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response?.data?.success && response?.data?.chatRoom) {
        setOnlineParticipants(response.data.chatRoom.participants || []);
        console.log('Updated participants:', response.data.chatRoom.participants?.length);
      }
    } catch (error) {
      console.error('Error refreshing chatroom:', error);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim() || !socket || !isConnected) return;

    const tempId = `temp_${Date.now()}`;
    const messageData = {
      tempId,
      content: messageText.trim(),
      chatRoomId,
      messageType: 'text',
    };

    // Add temporary message to UI
    const tempMessage = {
      _id: tempId,
      content: messageText.trim(),
      sender: { _id: userId, name: user.name || 'You', profile: user?.profile },
      messageType: 'text',
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');
    
    // Scroll to bottom after sending message
    setTimeout(() => scrollToBottom(), 50);

    // Send via socket
    socket.emit('sendMessage', messageData);
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderParticipant = ({ item }) => (
    <View style={styles.participantContainer}>
      <Image
        source={{
          uri: item.profile 
            ? `${item.profile.replace(/\\/g, '/')}`
            : 'https://via.placeholder.com/40'
        }}
        style={[
          styles.participantAvatar,
          { borderColor: item.isOnline ? '#4CAF50' : '#666' }
        ]}
      />
      <View style={styles.onlineIndicator(item.isOnline)} />
    </View>
  );

const renderMessage = ({ item, index }) => {
  if (item.messageType === 'system') {
    return (
      <View style={styles.systemMessage}>
        <Text style={styles.systemMessageText}>{item.content}</Text>
      </View>
    );
  }

  const isOwnMessage = item.sender?._id === userId;
  const senderName = isOwnMessage ? 'You' : (item.sender?.name || 'Unknown');
  
  // Show sender name and avatar only if it's different from previous message sender
  const previousMessage = messages[index - 1];
  const showSenderInfo = !previousMessage || 
    previousMessage.messageType === 'system' ||
    previousMessage.sender?._id !== item.sender?._id;

  console.log('item', item)

  return (
    <View style={styles.messageWrapper}>
      <View style={styles.messageContainer}>
        <View style={styles.messageHeader}>
          {/* Only show avatar if this is the first message from this sender in sequence */}
          {showSenderInfo && (
            <Image
              source={{
                uri: item.sender?.profile 
                  ? `${item?.sender?.profile.replace(/\\/g, '/')}`
                  : 'https://via.placeholder.com/32'
              }}
              style={styles.messageSenderAvatar}
            />
          )}
          <View style={[
            styles.messageContent,
            !showSenderInfo && { marginLeft: 40 } 
          ]}>
            {showSenderInfo && (
              <Text style={[
                styles.senderName,
                { color: isOwnMessage ? '#4A90E2' : '#FF6B6B' }
              ]}>
                {senderName}
              </Text>
            )}
            <View style={[
              styles.messageBubble,
              item.isTemp && styles.tempMessage
            ]}>
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
              {item.isTemp && (
                <Text style={styles.sendingIndicator}> • Sending...</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.hostInfo}>
          <Image
            source={{
              uri: chatRoom?.picture 
                ? `${chatRoom.picture.replace(/\\/g, '/')}`
                : 'https://via.placeholder.com/40'
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.hostName}>{chatRoom?.name}</Text>
            <Text style={styles.participantCount}>
              {onlineParticipants.length} participants
            </Text>
          </View>
        </View>
        <View style={styles.statusIcons}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
          <TouchableOpacity 
            onPress={handleLeaveRoom}
            style={styles.closeButton}
          >
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}

      {/* Participants Row */}
      <View style={styles.participantsSection}>
        <FlatList
          data={onlineParticipants}
          horizontal
          renderItem={renderParticipant}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.participantsList}
          extraData={onlineParticipants} 
        />
      </View>

      {/* Main Content Area */}
      <KeyboardAvoidingView 
        style={styles.mainContent}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Chat Messages */}
        <FlatList
          ref={messagesRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : 80 } // Adjust padding based on keyboard
          ]}
          onContentSizeChange={() => {
            setTimeout(() => scrollToBottom(), 100);
          }}
          removeClippedSubviews={false}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />

        {/* Message Input - Fixed at bottom */}
        <View style={[
          styles.inputContainer,
          Platform.OS === 'ios' && keyboardHeight > 0 && {
            paddingBottom: keyboardHeight > 0 ? 0 : 34, // Adjust for safe area
          }
        ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor="#888"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { 
                  opacity: (messageText.trim() && isConnected) ? 1 : 0.5,
                  backgroundColor: (messageText.trim() && isConnected) ? '#4A90E2' : '#666'
                }
              ]}
              onPress={sendMessage}
              disabled={!messageText.trim() || !isConnected}
            >
              <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  hostName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantCount: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 2,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 88, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4458',
    marginRight: 6,
  },
  liveText: {
    color: '#FF4458',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },
  connectionStatus: {
    backgroundColor: '#FF4458',
    paddingVertical: 6,
    alignItems: 'center',
  },
  connectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  participantsSection: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  participantsList: {
    paddingHorizontal: 16,
  },
  participantContainer: {
    position: 'relative',
    marginRight: 12,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  onlineIndicator: (isOnline) => ({
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: isOnline ? '#4CAF50' : '#666',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  }),
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
  },
  messageHeader: {
    flexDirection: 'row',
    flex: 1,
  },
  messageSenderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    maxWidth: '85%',
  },
  tempMessage: {
    opacity: 0.7,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    color: '#888',
    fontSize: 11,
    marginTop: 6,
  },
  sendingIndicator: {
    color: '#4A90E2',
    fontStyle: 'italic',
  },
  systemMessage: {
    alignItems: 'center',
    marginBottom: 12,
  },
  systemMessageText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, // Safe area padding
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  messageInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default LiveChatRoom;