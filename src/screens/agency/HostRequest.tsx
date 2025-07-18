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
import {BACKEND_URL, BASE_URL} from '../../utils/constant';
import {UserContext} from '../../utils/context/user-context';
import {getDataFromStore} from '../../store';

import * as Burnt from 'burnt';

const Width = Dimensions.get('window').width;
const bannerWidth = Width * 0.4;

export default function HostRequest() {
  const [hosts, setHosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {
    user: userCon,
    followers,
    following,
    refreshAllUserData,
  } = useContext(UserContext);

  const [followingIds, setFollowingIds] = useState(
    following.map(user => user?.followingId?._id),
  );

  console.log('following ', following);
  console.log('follower ', followers);

  const isFollowing = id => {
    // console.log('is follwing passed it ',id)
    return followingIds.includes(id);
  };

  const onRefresh = () => {
    setRefreshing(true);

    refreshAllUserData();
    getData();

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  console.log('folowing', following);

  const getData = async () => {
      const token = await getDataFromStore('token');
    console.log('token', token);
    const hostdata = await axios.get(`${BASE_URL}/host/getAllHost`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('host', hostdata);
    setHosts(hostdata?.data?.data?.filter(a => a.status === 'pending'));
  };

  useEffect(() => {
    getData();
  }, []);

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

  const handleAccept = async id => {
    
      const token = await getDataFromStore('token');
    console.log('token', token);
    const agencydata = await axios.put(
      `${BASE_URL}/host/updateStatus/${id}`,
      {status: 'approved'},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    Burnt.toast({
      title: 'Request Approved!',
      preset: 'done',
    });
    getData();
    console.log('host', agencydata);
  };

  const handleReject = async id => {
      const token = await getDataFromStore('token');
    console.log('token', token);
    const agencydata = await axios.put(
      `${BASE_URL}/host/updateStatus/${id}`,
      {status: 'rejected'},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    getData();
    Burnt.toast({
      title: 'Request Rejected!',
      preset: 'done',
    });
    console.log('host', agencydata);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.tabButton}>
              <Text
                style={{
                  fontSize: 14,
                  color: 'white',
                  fontWeight: 700,
                  marginRight: 40,
                }}>
                Host Request
              </Text>
            </TouchableOpacity>
          </View>
          <Icon style={styles.bellIcon} size={20} name="bell" />
        </View>

        <ScrollView
          horizontal={false}
          vertical={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsHorizontalScrollIndicator={false}
          style={styles.contentContainer}>
          {hosts.map(user => {
            return (
              <View
                style={styles.discovercontainer}
                key={user?._id}>
                <View style={styles.header}>
                  <View style={{flexDirection: 'row'}}>
                    <Image
                      style={styles.profileImage}
                      source={{uri: user?.hostLogo}}
                    />
                    <View>
                      <Text style={styles.name}>{user?.name || 'unknow'}</Text>
                      {/* <Text style={styles?.timestamp}>6 hour ago</Text> */}
                    </View>
                  </View>

                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                      onPress={() =>
                        handleAccept(user?._id)
                      }>
                      <Text style={[styles.followBtn, {marginRight: 10}]}>
                        Approve
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleReject(user?._id)
                      }>
                      <Text style={styles.followBtn}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
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
