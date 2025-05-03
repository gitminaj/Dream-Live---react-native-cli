import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Width = Dimensions.get("window").width;
const bannerWidth = Width * 0.4 ; 


export default function FollowCard({ name, image }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row" }}>
          <Image
            style={styles.profileImage}
            source={{uri: String(image)}}
          />
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.timestamp}>6 hour ago</Text>
          </View>
        </View>
        <View>
          {/* <Link href="/chat" > */}
          <TouchableOpacity onPress={() => navigation.navigate('Chat') }>
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
  chatBtn: {
    fontSize: 8,
    fontWeight: "600",
    color: "#D4ACFB",
    borderWidth: 1,
    borderRadius: 50,
    borderColor: "#D4ACFB",
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
