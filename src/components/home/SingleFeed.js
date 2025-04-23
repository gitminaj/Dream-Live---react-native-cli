import { View,Image, Text, StyleSheet, ImageBackground } from "react-native";
// import Icon from 'react-native-vector-icons/AntDesign'

export default function SingleFeed({name,image}) {
  return (
    <>
     <View style={{ width: "48%" }} >

        <ImageBackground
          source={image}
          resizeMode="cover"
          style={styles.image}
        >
      <View style={styles.container}>
          <View style={styles.feedHeader}>
            <View style={styles.liveContainer}>
              <Text style={styles.liveText}>Live</Text>
            </View>
            <View style={styles.watchingContainer}>
              <Text style={styles.watchingText}>33 watching</Text>
            </View>
          </View>

          <View style={styles.feedFooter} >
            <View style={styles.chatContainer} >
              <Text style={{ color: 'white', fontSize: 10, fontWeight:600 }} > {name}  </Text>
              <View style={styles.chitChatContainer} >
                <Image style={{width:20, height:20}} source={{uri: "https://s3-alpha-sig.figma.com/img/589c/b8a3/30edda1bc2b729bc41d50cfae1c8f0c1?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=p5Y1RJd7wCI947xAfZtxzByzq5SHZYTU4HhQ8WX-EdAgxop3Cpzws62md8sVQc-FGAM6o4VgcBxd2K-JrQbxx3hWlI3V1XuCsmzvqeRL0iBKrpUFMIw6olUbM8bBGgBYp51pNMi-GiJCRWjX9vQtr5QLSWuzte8KnRFOOroSKdI~itJhYT1YeD2a57V8uwSQhhA59hHQEyerQ0qc-PCX0Q6Hz6B880UT14DoWUsLBIx7FnoFpPBE8JklcJia6qICoYlWzTCJ9Cr12rkXTea~UwWm9N4cofrklbczBBivB7Nl-xmLbxK5BukqLPfxDQl3-up3HjVvUuBAd4UzuSJlpA__"}} />
                <Text style={styles.chitChatText} >Chit chat</Text>
              </View>
            </View>
            {/* <Icon name='playcircleo' size={25} style={{ color: 'white'}} /> */}
          </View>


      </View>
        </ImageBackground>
     </View>
    </>
  );
}

const styles = StyleSheet.create({
  chitChatText:{
    color: 'white',
    fontSize: 8,
    fontWeight: 700,
  },
  chitChatContainer:{
    flexDirection: 'row',
    backgroundColor: '#747474',
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    width: 70
  },
  container:{
    flex: 1,
    flexDirection: 'column',
    // width: "100%",
    height: 'auto',
    justifyContent: 'space-between'
  },
  chatContainer:{

  },
  feedFooter:{
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    // alignItems: 'flex-end',
    alignSelf: 'bottom',
    marginBottom: 15
  },
  feedHeader: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  liveContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 10,
    borderRadius: 40,
    backgroundColor: "#F05858",
  },
  watchingContainer: {
    justifyContent: "center",
    alignItems: "center",
    // width: 36,
    // height: 10,
    borderRadius: 40,
    backgroundColor: "#747474",
    paddingHorizontal: 10,
  },
  liveText: {
    fontSize: 5,
    fontWeight: 700,
    color: "white",
  },
  watchingText: {
    fontSize: 5,
    fontWeight: 700,
    color: "white",
  },
  image: {
    // flex: 1,
    width: "100%",
    height: 200,
    padding: 5,
    marginTop: 20
  },
});
