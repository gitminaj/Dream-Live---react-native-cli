import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import DiscoverCard from '../components/discoverNfollow/DiscoverCard';
import FollowCard from '../components/discoverNfollow/FollowCard';
import Icon from "react-native-vector-icons/SimpleLineIcons";


export default function Discover() {
  const [activeTab, setActiveTab] = useState("discover");

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header} >
          <View style={{ flexDirection: 'row' }} >
              <TouchableOpacity 
                onPress={() => setActiveTab("discover")}
                style={styles.tabButton}
              >
                <Text
                  style={{ 
                    fontSize: 14,
                    color: activeTab === "discover" ? 'white' : '#94A3B8', 
                    fontWeight: 700, 
                    marginRight: 40 
                    }}
                > 
                  Discover
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setActiveTab("follow")}
                style={styles.tabButton}
              >
                <Text 
                  style={{ 
                    fontSize: 14, 
                    color: activeTab === "follow" ? 'white' : '#94A3B8', 
                    fontWeight: 700 
                  }} 
                >
                  Follow
                </Text>
              </TouchableOpacity>
          </View>
          <Icon style={styles.bellIcon} size={20} name='bell' />
        </View>

        {activeTab === "discover" && (
          <ScrollView
          horizontal={false}
          vertical={true}
          showsHorizontalScrollIndicator={false} style={styles.contentContainer}>
            <DiscoverCard name={'Emilly Watson'} image={require('../assets/homeFeed/emmily.png')} />
            <DiscoverCard name={'jhon Watson'} image={require('../assets/homeFeed/jhon.png')} />
            <DiscoverCard name={'jhon Watson'} image={require('../assets/homeFeed/jhon.png')} />
          </ScrollView>
        )} 

        {activeTab === "follow" && (
          <ScrollView
          horizontal={false}
          vertical={true}
          showsHorizontalScrollIndicator={false} style={styles.contentContainer}>
            <FollowCard name={'Emilly Watson'} image={require('../assets/homeFeed/emmily.png')} />
            <FollowCard name={'Watson Jhon'} image={require('../assets/homeFeed/jhon.png')} />
            <FollowCard name={'Emilly Watson'} image={require('../assets/homeFeed/emmily.png')} />
            
          </ScrollView>
        )}

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 15
  },
  header:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  bellIcon:{
    color: "#94A3B8",
  },
  tabButton: {
    paddingVertical: 5,
  },
  contentContainer: {
    // padding: 10,
  },
  contentText: {
    color: 'white',
    fontSize: 16
  }
});


