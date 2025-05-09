import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {UserContext} from '../../utils/context/user-context';
import { getDataFromStore } from '../../store';
import axios from 'axios';
import { BASE_URL } from '../../utils/constant';

const Width = Dimensions.get('window').width;
const bannerWidth = Width * 0.4;

export default function DiscoverCard({name, image, id}) {
  const {
    following,
    user: userCon,
  } = useContext(UserContext);

  const [followingIds, setFollowingIds] = useState(
    following.map(user => user?.followingId?._id),
  );

  const isFollowing = userid => {
    // console.log('is follwing passed it ',id)
    return followingIds.includes(userid);
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
    <View style={styles.discovercontainer}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row'}}>
          <Image style={styles.profileImage} source={{uri: String(image)}} />
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.timestamp}>6 hour ago</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleFollowToggle(id)}>
          <Text style={styles.followBtn}>
            {isFollowing(id) ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
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
