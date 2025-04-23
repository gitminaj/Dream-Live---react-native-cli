import { View, StyleSheet, Text, Image } from "react-native";

export default function HomeFooter() {
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
          <View>
            <Image
              resizeMode="contain"
              style={{ width: 25, height: 25}}
              source={require("../assets/daimond.png")}
            />
            <Text style={styles.footerText}>Store</Text>
          </View>
          <View>
            <Image
              resizeMode="contain"
              style={{ width: 25, height: 25 }}
              source={require("../assets/mic.png")}
            />
            <Text style={styles.footerText}>Audio</Text>
          </View>
        <View>
        <Image
              resizeMode="contain"
              style={{ width: 25, height: 25 }}
              source={require("../assets/message.png")}
            />
          <Text style={styles.footerText}>Message</Text>
        </View>
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
