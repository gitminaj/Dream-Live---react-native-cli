import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useRoute} from '@react-navigation/native';
import {socket} from '../utils/socket';
import {BACKEND_URL, BASE_URL} from '../utils/constant';
import axios from 'axios';
import {getDataFromStore} from '../store';
import {UserContext} from '../utils/context/user-context';

export default function ChatScreen() {
  const route = useRoute();
  const {roomId, receiverUserId, roomDetails} = route.params;
  const {user} = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [receiverInfo, setReceiverInfo] = useState();
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const flatListRef = useRef();
  const modalAnimation = useRef(new Animated.Value(0)).current;

  // console.log('route params', roomId, receiverUserId, roomDetails);

  useEffect(() => {
    const initialReceiver = roomDetails?.data?.participants.find(
      user => user._id === receiverUserId,
    );
    setReceiverInfo(initialReceiver);
    console.log(receiverInfo);
  }, [receiverUserId, roomDetails]);

  const formatLastSeen = info => {
    if (!info) return '';

    const last = new Date(info.lastSeen);
    const now = new Date();
    const diffMs = now - last;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (info.isOnline) {
      return 'Online';
    }

    const sameDay = last.toDateString() === now.toDateString();
    if (sameDay) {
      return `Last seen today at ${last.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays === 1) {
      return `Last seen yesterday at ${last.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return `Last seen ${diffDays} days ago`;
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      const token = await getDataFromStore('token');
      setCurrentUserId(user?._id);

      // Join the room
      socket.emit('joinRoom', {chatRoomId: roomId});

      // Fetch existing messages
      const response = await axios.get(
        `${BASE_URL}/chat/rooms/${roomId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessages(response?.data?.messages);

      // Listen to new messages
      socket.on('newMessage', newMessage => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        flatListRef.current?.scrollToOffset({offset: 0, animated: true});
      });

      // Listen to message edits
      socket.on('messageEdited', editedMessage => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === editedMessage._id ? editedMessage : msg,
          ),
        );
      });

      // Listen to message deletions
      socket.on('messageDeleted', ({messageId}) => {
        setMessages(prevMessages =>
          prevMessages.filter(msg => msg._id !== messageId),
        );
      });

      // Listen to socket errors
      socket.on('error', error => {
        Alert.alert('Error', error.message);
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageEdited');
        socket.off('messageDeleted');
        socket.off('error');
        socket.emit('leaveRoom', {chatRoomId: roomId});
      };
    };

    setupSocket();
  }, [roomId]);

  useEffect(() => {
    socket.on('userOnline', ({userId}) => {
      if (userId === receiverUserId) {
        setReceiverInfo(prev => ({...prev, isOnline: true}));
      }
    });

    socket.on('userOffline', ({userId}) => {
      if (userId === receiverUserId) {
        setReceiverInfo(prev => ({
          ...prev,
          isOnline: false,
          lastSeen: new Date().toISOString(),
        }));
      }
    });

    return () => {
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [receiverUserId]);

  // Show action modal with animation
  const showActionModalWithAnimation = () => {
    setShowActionModal(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Hide action modal with animation
  const hideActionModalWithAnimation = () => {
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setShowActionModal(false);
      setSelectedMessage(null);
    });
  };

  // Handle long press on message
  const handleMessageLongPress = message => {
    if (message.sender._id === currentUserId) {
      setSelectedMessage(message);
      showActionModalWithAnimation();
    }
  };

  // Handle edit message
  const handleEditMessage = () => {
    setIsEditing(true);
    setEditingMessage(selectedMessage);
    setCurrentMessage(selectedMessage.content);
    hideActionModalWithAnimation();
  };

  // Handle delete message with confirmation
  const handleDeleteMessage = () => {
    hideActionModalWithAnimation();

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            socket.emit('deleteMessage', {
              messageId: selectedMessage._id,
            });
          },
        },
      ],
    );
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingMessage(null);
    setCurrentMessage('');
  };

  // Send or edit message
  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    if (editingMessage) {
      console.log("editmessage",editingMessage)
      // Edit existing message
      socket.emit('editMessage', {
        messageId: editingMessage?._id, // Note: using 'messagesId' to match your socket controller
        content: currentMessage.trim(),
      });

      setIsEditing(false);
      setEditingMessage(null);
    } else {
      // Send new message
      const messageData = {
        content: currentMessage.trim(),
        chatRoomId: roomId,
        messageType: 'text',
        tempId: Date.now(),
      };

      socket.emit('sendMessage', messageData);
    }

    setCurrentMessage('');
  };

  const renderMessage = ({item}) => {
    const isCurrentUser = item.sender._id === currentUserId;

    return (
      <TouchableOpacity
        onLongPress={() => handleMessageLongPress(item)}
        activeOpacity={0.7}
        key={item._id}>
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.myMessage : styles.theirMessage,
          ]}>
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.myMessageText : styles.theirMessageText,
            ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isCurrentUser ? styles.myMessageTime : styles.theirMessageTime,
              ]}>
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.edited && (
              <Text
                style={[
                  styles.editedText,
                  isCurrentUser ? styles.myEditedText : styles.theirEditedText,
                ]}>
                edited
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Action Modal Component
  const ActionModal = () => (
    <Modal
      transparent={true}
      visible={showActionModal}
      animationType="none"
      onRequestClose={hideActionModalWithAnimation}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={hideActionModalWithAnimation}>
        <Animated.View
          style={[
            styles.actionModal,
            {
              transform: [
                {
                  scale: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: modalAnimation,
            },
          ]}>
          <Text style={styles.modalTitle}>Message Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditMessage}>
            <MaterialIcons name="edit" size={20} color="#D4ACFB" />
            <Text style={styles.actionButtonText}>Edit Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteMessage}>
            <MaterialIcons name="delete" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete Message
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={hideActionModalWithAnimation}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={{
            uri: `${BACKEND_URL}/${receiverInfo?.profile.replace(/\\/g, '/')}`,
          }}
        />
        <View style={{flex: 1}}>
          <Text style={styles.name}>{receiverInfo?.name}</Text>
          <Text style={{color: 'gray', fontSize: 10}}>
            {formatLastSeen(receiverInfo)}
          </Text>
        </View>
        <Icon name="dots-three-horizontal" size={20} style={styles.icon} />
      </View>

      {/* Messages */}
      <FlatList
        data={[...messages].reverse()}
        keyExtractor={item => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{paddingVertical: 10}}
        style={{flex: 1}}
        inverted
        ref={flatListRef}
      />

      {/* Editing indicator */}
      {isEditing && (
        <View style={styles.editingIndicator}>
          <MaterialIcons name="edit" size={16} color="#D4ACFB" />
          <Text style={styles.editingText}>Editing message</Text>
          <TouchableOpacity
            onPress={cancelEdit}
            style={styles.cancelEditButton}>
            <MaterialIcons name="close" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={isEditing ? 'Edit your message' : 'Type Your Message'}
          placeholderTextColor="#8C8C8C"
          value={currentMessage}
          onChangeText={setCurrentMessage}
          underlineColorAndroid="transparent"
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>
            <FontAwesome name={isEditing ? 'check' : 'send'} />
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Modal */}
      <ActionModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 15,
  },
  icon: {
    color: '#94A3B8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  messageContainer: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 3,
  },
  myMessage: {
    backgroundColor: '#D4ACFB',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  myMessageText: {
    color: '#0F172A',
  },
  theirMessageText: {
    color: 'white',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  myMessageTime: {
    color: '#0F172A',
    opacity: 0.7,
  },
  theirMessageTime: {
    color: 'white',
    opacity: 0.7,
  },
  editedText: {
    fontSize: 9,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  myEditedText: {
    color: '#0F172A',
    opacity: 0.6,
  },
  theirEditedText: {
    color: 'white',
    opacity: 0.6,
  },
  editingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  editingText: {
    color: '#D4ACFB',
    marginLeft: 6,
    flex: 1,
    fontSize: 12,
  },
  cancelEditButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#D4ACFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 4,
  },
  sendButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#334155',
  },
  deleteButton: {
    backgroundColor: '#3F1F1F',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#475569',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
