import {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DiscoverCard from '../components/discoverNfollow/DiscoverCard';
import FollowCard from '../components/discoverNfollow/FollowCard';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import axios from 'axios';
import {BACKEND_URL, BASE_URL} from '../utils/constant';
import {UserContext} from '../utils/context/user-context';
import {getDataFromStore} from '../store';
import HomeFooter from '../components/HomeFooter';

export default function Discover() {
  const [activeTab, setActiveTab] = useState('discover');
  const [discoverUser, setDiscoverUser] = useState([]);
  const [followingUser, setFollowingUser] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {user: userCon} = useContext(UserContext);

  const onRefresh = () => {
    setRefreshing(true);

    getDiscoverUser();

    getFollowingUser();

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getDiscoverUser = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/follow/discover/${userCon?._id}`,
      );

      console.log('all user', response);
      setDiscoverUser(response?.data);
    } catch (error) {
      console.log('error fetching all users', error);
    }
  };

  const getFollowingUser = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/follow/following/${userCon?._id}`,
      );

      console.log('following user', response);
      setFollowingUser(response?.data?.data);
    } catch (error) {
      console.log('error fetching all users', error);
    }
  };

  useEffect(() => {
    getDiscoverUser();
    getFollowingUser();
  }, []);

  const handleFollow = async followingId => {
    const token = await getDataFromStore('token');
    const payload = {
      followerId: userCon._id,
      followingId,
    };
    try {
      const response = await axios.post(`${BASE_URL}/follow/follow`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('response', response);
    } catch (err) {
      console.log('error while following', err.response);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => setActiveTab('discover')}
              style={styles.tabButton}>
              <Text
                style={{
                  fontSize: 14,
                  color: activeTab === 'discover' ? 'white' : '#94A3B8',
                  fontWeight: 700,
                  marginRight: 40,
                }}>
                Discover
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('follow')}
              style={styles.tabButton}>
              <Text
                style={{
                  fontSize: 14,
                  color: activeTab === 'follow' ? 'white' : '#94A3B8',
                  fontWeight: 700,
                }}>
                Follow
              </Text>
            </TouchableOpacity>
          </View>
          <Icon style={styles.bellIcon} size={20} name="bell" />
        </View>

        {activeTab === 'discover' && (
          <ScrollView
            horizontal={false}
            vertical={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsHorizontalScrollIndicator={false}
            style={styles.contentContainer}>
            {discoverUser.map(user => {
              const profileUrl = `${user?.profile}`;
              return (
                // <TouchableOpacity
                //   // onPress={() => handleFollow(user._id)}
                //   >
                  <DiscoverCard
                    key={user._id}
                    id={user?._id}
                    name={user?.name}
                    image={String(profileUrl)}
                    isPrivate={user.isPrivate}
  isRequested={user.followRequests.includes(userCon._id)}
                  />
                // </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {activeTab === 'follow' && (
          <ScrollView
            horizontal={false}
            vertical={true}
            showsHorizontalScrollIndicator={false}
            style={styles.contentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {followingUser.map(user => {
              const profileUrl = `${user?.followingId?.profile}`;
              return (
                <TouchableOpacity key={user?._id}>
                  <FollowCard
                    name={user?.followingId?.name}
                    image={String(profileUrl)}
                    id={user?.followingId?._id}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
      <HomeFooter />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bellIcon: {
    color: '#94A3B8',
  },
  tabButton: {
    paddingVertical: 5,
  },
  contentContainer: {
    // padding: 10,
  },
  contentText: {
    color: 'white',
    fontSize: 16,
  },
});
