import {useState, useContext, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  Dimensions,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import axios from 'axios';
import {BACKEND_URL, BASE_URL} from '../utils/constant';
import {UserContext} from '../utils/context/user-context';
import {getDataFromStore} from '../store';

const Width = Dimensions.get('window').width;
const bannerWidth = Width * 0.4;

export default function Followers() {
  const [activeTab, setActiveTab] = useState('followers');
  const [refreshing, setRefreshing] = useState(false);
  const {
    user: userCon,
    followers,
    following,
    refreshAllUserData,
    followRequest,
  } = useContext(UserContext);
  const [followingIds, setFollowingIds] = useState(
    following.map(user => user?.followingId?._id),
  );

  const [followingRequest, setFollowingRequest] = useState(followRequest);

  useEffect(() => {
    setFollowingRequest(followRequest);
  }, [refreshAllUserData]);

  //   console.log('following ids', followingIds)
  //   console.log('follower ids', followers)

  const isFollowing = id => {
    // console.log('is follwing passed it ',id)
    return followingIds.includes(id);
  };

  const onRefresh = () => {
    setRefreshing(true);

    refreshAllUserData();

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  console.log('folowing', following);

  const handleAccept = async requesterId => {
    const token = await getDataFromStore('token');
    try {
      const response = await axios.post(
        `${BASE_URL}/follow/accept`,
        {requesterId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('response', response);

       setFollowingRequest(prev =>
      prev.map(user =>
        user._id === requesterId ? { ...user, __accepted: true } : user
      )
    );
    } catch (err) {
      console.log('error while following', err.response);
    }
  };

  const handleFollowToggle = async targetId => {
    const token = await getDataFromStore('token');
    const payload = {
      token: token,
      followerId: userCon._id,
      followingId: targetId,
    };
    try {
      if (isFollowing(targetId)) {
        // un follow logic
        try {
          const response = await axios.delete(`${BASE_URL}/follow/unfollow`, {
            data: payload,
          });
          console.log('response unfollow', response);
          setFollowingIds(prev => prev.filter(id => id !== targetId));
        } catch (err) {
          console.log('error while unfollowing', err.response);
        }
      } else {
        // follow logic
        try {
          const response = await axios.post(
            `${BASE_URL}/follow/follow`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          console.log('response', response);
          setFollowingIds(prev => [...prev, targetId]);
        } catch (err) {
          console.log('error while following', err.response);
        }
      }
    } catch (err) {
      console.log('Follow toggle failed', err);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setActiveTab('followers')}>
              <Text
                style={{
                  fontSize: 14,
                  color: 'white',
                  fontWeight: 700,
                  marginRight: 40,
                }}>
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => setActiveTab('request')}>
              <Text
                style={{
                  fontSize: 14,
                  color: 'white',
                  fontWeight: 700,
                  marginRight: 40,
                }}>
                Request's
              </Text>
            </TouchableOpacity>
          </View>
          <Icon style={styles.bellIcon} size={20} name="bell" />
        </View>

        {activeTab === 'followers' && (
          <ScrollView
            horizontal={false}
            vertical={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsHorizontalScrollIndicator={false}
            style={styles.contentContainer}>
            {followers.map(user => {
              return (
                <View
                  style={styles.discovercontainer}
                  key={user?.followerId?._id}>
                  <View style={styles.header}>
                    <View style={{flexDirection: 'row'}}>
                      <Image
                        style={styles.profileImage}
                        source={{uri: `${user?.followerId?.profile}`}}
                      />
                      <View>
                        <Text style={styles.name}>
                          {user?.followerId?.name || 'unknow'}
                        </Text>
                        {/* <Text style={styles.timestamp}>6 hour ago</Text> */}
                      </View>
                    </View>
                    <View>
                      <TouchableOpacity
                        onPress={() =>
                          handleFollowToggle(user?.followerId?._id)
                        }>
                        <Text style={styles.followBtn}>
                          {isFollowing(user?.followerId?._id)
                            ? 'Unfollow'
                            : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {activeTab === 'request' && (
          <ScrollView
            horizontal={false}
            vertical={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsHorizontalScrollIndicator={false}
            style={styles.contentContainer}>
            {followingRequest.map(user => {
              return (
                <View style={styles.discovercontainer} key={user?.profile}>
                  <View style={styles.header}>
                    <View style={{flexDirection: 'row'}}>
                      <Image
                        style={styles.profileImage}
                        source={{uri: `${user?.profile}`}}
                      />
                      <View>
                        <Text style={styles.name}>
                          {user?.name || 'unknow'}
                        </Text>
                        {/* <Text style={styles.timestamp}>6 hour ago</Text> */}
                      </View>
                    </View>
                    <View>
                      <TouchableOpacity
                        onPress={() => handleAccept(user?._id)}
                        disabled={user.__accepted}>
                        <Text style={styles.followBtn}>
                          {user.__accepted ? 'Accepted' : 'Accept'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
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
  discovercontainer: {
    marginTop: 30,
    // borderRadius: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 20,
  },
  name: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 8,
  },
  followBtn: {
    fontSize: 8,
    fontWeight: '600',
    color: '#D4ACFB',
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#D4ACFB',
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: bannerWidth,
  },
  icon: {
    width: Width * 0.06,
    height: Width * 0.06,
  },
});
