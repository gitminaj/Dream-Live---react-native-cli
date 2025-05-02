import { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, ScrollView } from "react-native";
import DiscoverCard from '../components/discoverNfollow/DiscoverCard';
import FollowCard from '../components/discoverNfollow/FollowCard';
import Icon from "react-native-vector-icons/SimpleLineIcons";
import axios from 'axios';
import { BACKEND_URL, BASE_URL } from "../utils/constant";
import { UserContext } from "../utils/context/user-context";


export default function Discover() {
  const [activeTab, setActiveTab] = useState("discover");
  const [discoverUser, setDiscoverUser] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user: userCon  } = useContext(UserContext);

  const onRefresh = () => {
    setRefreshing(true);
      const getAllUser = async () =>{
        try {
          const response = await axios.get(`${BASE_URL}/auth/users`);
    
          console.log('all user', response?.data?.data);
          setDiscoverUser(response?.data?.data);
        } catch (error) {
          console.log('error fetching all users', error);
        }
      }
      getAllUser();
      
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(()=>{
    const getAllUser = async () =>{
      try {
        const response = await axios.get(`${BASE_URL}/auth/users`);
  
        console.log('all user', response?.data?.data);
        setDiscoverUser(response?.data?.data.filter( user => userCon._id !== user._id ));
      } catch (error) {
        console.log('error fetching all users', error);
      }
    }
    getAllUser();
  },[])


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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsHorizontalScrollIndicator={false} style={styles.contentContainer}>
            {
              discoverUser.map((user) => {
                const profileUrl = `${BACKEND_URL}/${user.profile.replace(/\\/g, '/')}`;
                return(
                <DiscoverCard key={user._id} name={user.name} image={ String(profileUrl)} />
              )})
            }
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


