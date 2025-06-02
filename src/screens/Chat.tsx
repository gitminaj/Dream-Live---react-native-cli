import { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import { useRoute } from '@react-navigation/native';
import { socket } from '../utils/socket';


export default function Chat() {
  const route = useRoute();
  const { roomId, receiverUserId } = route.params;

  console.log('roomid, receiveruserid', roomId,receiverUserId);

  socket.emit('hi', "hi");

  return (
    <>
      <View style={styles.container}>

              <View style={styles.header}>
                  <Image
                    style={styles.profileImage}
                    source={require('../assets/homeFeed/emmily.png')}
                  />
                  <View>
                    <Text style={styles.name}>Emilly shane</Text>
                    <Text style={styles.timestamp}>Online 6 hour ago</Text>
                  </View>

                <View>
                  <Icon name="dots-three-horizontal" size={20} style={styles.icon}></Icon>
                </View>
              </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
    icon:{
        color: '#94A3B8'
    },
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 15
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  timestamp: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 8,
  },
});