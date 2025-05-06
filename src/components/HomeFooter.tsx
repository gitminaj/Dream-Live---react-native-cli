import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";

export default function HomeFooter() {
  const navigation = useNavigation();
  return (
    <>
      <View style={styles.footerContainer}>
        <View>
          <Image
            resizeMode="contain"
            style={{ width: 25, height: 25 }}
            source={require("../assets/home.png")}
          />

          <Text style={styles.footerText}>Home</Text>
        </View>

          <View>
            <Image
              resizeMode="contain"
              style={{ width: 25, height: 25 }}
              source={require("../assets/dice.png")}
            />
          <Text style={styles.footerText}>Games</Text>

          </View>
          <TouchableOpacity onPress={() => navigation.navigate('VipRules')}>
            <Image
              resizeMode="contain"
              style={{ width: 25, height: 25}}
              source={require("../assets/daimond.png")}
            />
            <Text style={styles.footerText}>Store</Text>
          </TouchableOpacity>
          <View>
            <Image
              resizeMode="contain"
              style={{ width: 25, height: 25 }}
              source={require("../assets/mic.png")}
            />
            <Text style={styles.footerText}>Audio</Text>
          </View>
        <TouchableOpacity onPress={() => navigation.navigate('MessageList')}>
        <Image
              resizeMode="contain"
              style={{ width: 25, height: 25 }}
              source={require("../assets/message.png")}
            />
          <Text style={styles.footerText}>Message</Text>
        </TouchableOpacity >
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  footerText:{
    fontSize: 8,
    color: 'white',
    alignSelf: 'center',
  },
  footerContainer: {
    backgroundColor: "#1E293B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 10
  },
  middleNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    alignItems: 'center'
  },
});
