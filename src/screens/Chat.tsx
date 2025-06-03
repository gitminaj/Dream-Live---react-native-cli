import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import { useRoute } from "@react-navigation/native";
import { socket } from "../utils/socket";
import { BACKEND_URL, BASE_URL } from "../utils/constant";
import axios from "axios";
import { getDataFromStore } from "../store";
import { UserContext } from "../utils/context/user-context";

export default function ChatScreen() {
  const route = useRoute();
  const { roomId, receiverUserId, roomDetails } = route.params;
  const { user } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const flatListRef = useRef();

  const receiverDetails = roomDetails?.data?.participants.filter(
    (user) => user._id === receiverUserId
  );

  const formatLastSeen = (receiverDetails) => {
    const last = new Date(receiverDetails[0]?.lastSeen);
    const now = new Date();
    const diffMs = now - last;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (receiverDetails[0]?.isOnline) {
      return "Online";
    }

    const sameDay = last.toDateString() === now.toDateString();
    if (sameDay) {
      return `Last seen today at ${last.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `Last seen yesterday at ${last.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `Last seen ${diffDays} days ago`;
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      const token = await getDataFromStore("token");
      setCurrentUserId(user?._id);

      // Join the room
      socket.emit("joinRoom", { chatRoomId: roomId });

      // Fetch existing messages
      const response = await axios.get(
        `${BASE_URL}/chat/rooms/${roomId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response?.data?.messages);

      // Listen to new messages
      socket.on("newMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      });

      return () => {
        socket.off("newMessage");
        socket.emit("leaveRoom", { chatRoomId: roomId });
      };
    };

    setupSocket();
  }, [roomId]);

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const messageData = {
      content: currentMessage.trim(),
      chatRoomId: roomId,
      messageType: "text",
      tempId: Date.now(),
    };

    socket.emit("sendMessage", messageData);
    setCurrentMessage("");
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender._id === currentUserId;
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={{
            uri: `${BACKEND_URL}/${receiverDetails[0]?.profile.replace(
              /\\/g,
              "/"
            )}`,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{receiverDetails[0]?.name}</Text>
          <Text style={{ color: "gray", fontSize: 10 }}>
            {formatLastSeen(receiverDetails)}
          </Text>
        </View>
        <Icon name="dots-three-horizontal" size={20} style={styles.icon} />
      </View>

      {/* Messages */}
      <FlatList
        data={[...messages].reverse()}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 10 }}
        style={{ flex: 1 }}
        inverted
        ref={flatListRef}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type Your Message"
          placeholderTextColor="#8C8C8C"
          value={currentMessage}
          onChangeText={setCurrentMessage}
          underlineColorAndroid="transparent"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 15,
  },
  icon: {
    color: "#94A3B8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 20,
  },
  name: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  messageContainer: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: "#D4ACFB",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: "#1E293B",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: "white",
    fontSize: 14,
  },
  messageTime: {
    color: "white",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    paddingLeft: 10,
  },
  input: {
    flex: 1,
    color: "white",
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: "#D4ACFB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "#0F172A",
    fontWeight: "bold",
  },
});
