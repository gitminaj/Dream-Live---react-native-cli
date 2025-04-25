import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const Width = Dimensions.get("window").width;
const bannerWidth = Width * 0.4 ; 


export default function DiscoverCard({ name, image }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row" }}>
          <Image
            style={styles.profileImage}
            source={image}
          />
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.timestamp}>6 hour ago</Text>
          </View>
        </View>
        <View>
          <Text style={styles.followBtn}>+ Follow</Text>
        </View>
      </View>

      {/* <Image
        style={styles.mainBanner}
        resizeMode="cover"
        source={image}
      />

      <View style={styles.iconRow}>
        <Image
          style={styles.icon}
          source={require("../../assets/discoverLike.png")}
          resizeMode="contain"
        />
        <Image
          style={styles.icon}
          source={require("../../assets/discoverMsg.png")}
          resizeMode="contain"
        />
        <Image
          style={styles.icon}
          source={require("../../assets/discoverGift.png")}
          resizeMode="contain"
        />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    // borderRadius: 10
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
  followBtn: {
    fontSize: 8,
    fontWeight: "600",
    color: "#D4ACFB",
    borderWidth: 1,
    borderRadius: 50,
    borderColor: "#D4ACFB",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  mainBanner: {
    width: bannerWidth,
    height: Width * 0.5,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: bannerWidth,
  },
  icon: {
    width: Width * 0.06,
    height: Width * 0.06,
  },
});
