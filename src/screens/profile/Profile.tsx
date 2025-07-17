import React, {useEffect, useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl, 
} from 'react-native';
import {getDataFromStore, removeDataFromStore} from '../../store';
import {useNavigation, CommonActions} from '@react-navigation/native';
import {UserContext} from '../../utils/context/user-context';

// icons
import Icon from 'react-native-vector-icons/Ionicons';
import AgencyIcon from 'react-native-vector-icons/SimpleLineIcons';
import MyRoomIcon from 'react-native-vector-icons/Ionicons';
import MainIcon from 'react-native-vector-icons/Feather';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import MyPosts from '../post/MyPosts';
import { socket } from '../../utils/socket';
import HomeFooter from '../../components/HomeFooter';

const MenuItem = ({icon, onPress, title}) => {
  return (
    <View>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
          {/* <AgencyIcon name='user' size={20} color="#8D96A8" />; */}
          {icon}
        </View>
        <Text style={styles.menuItemText}>{title}</Text>
        <Icon name="chevron-forward" size={20} color="#8D96A8" />
      </TouchableOpacity>
    </View>
  );
};

const Profile = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeScreen, setActiveScreen] = useState('settings');

  const { user, following, followers, refreshAllUserData, userPost } = useContext(UserContext);
  const [followingList, setFollowingList] = useState();
  console.log('user', user);


  const navigation = useNavigation();

  const onRefresh = () => {
    setRefreshing(true);

    refreshAllUserData();

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(()=>{
    refreshAllUserData();
  }, []);

const handleLogout = async () => {
  try {
    socket.disconnect();
    await removeDataFromStore('token');
    await removeDataFromStore('user');

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  } catch (error) {
    console.log('error logout', error);
  }
};

const handlePostClick = () => {
    setActiveScreen('posts');
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      <ScrollView contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      >
        {/* Profile Header */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity onPress={ () => navigation.navigate('EditProfile') }>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: `${user?.profile}`}}
              style={styles.profileImage}
              defaultSource={require('../../assets/profileIcon.png')}
            />
            <View>
              <Text style={styles.userName}>{user?.name}</Text>
              {/* <Text style={styles.userId}>ID: {user._id}</Text> */}
            </View>
          </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#8D96A8" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Room</Text>
          </View>
          <TouchableOpacity onPress={ handlePostClick } style={styles.statItem}>
            <Text style={styles.statValue}>{userPost?.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => navigation.navigate('Following') } style={styles.statItem}>
            <Text style={styles.statValue}>{following?.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={ () => navigation.navigate('Followers') } style={styles.statItem}>
            <Text style={styles.statValue}>{followers?.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
        </View>

        {
          activeScreen === 'settings' ? (
            <View>
             {/* Currency Boxes */}
        <View style={styles.currencyContainer}>
          <View style={styles.currencyBox}>
            <View style={styles.currencyIconContainer}>
              <Image
                source={require('../../assets/coin.png')}
                style={{width: 40, height: 40}}
                // defaultSource={require('./assets/profile-avatar.png')}
              />
            </View>
            <View>
              <Text style={styles.currencyValue}>0</Text>
              <Text style={styles.currencyLabel}>Coins</Text>
            </View>
          </View>
          <View style={styles.currencyBox}>
            <View style={styles.currencyIconContainer}>
              <Image
                source={require('../../assets/daimond.png')}
                style={{width: 30, height: 30}}
                // defaultSource={require('./assets/profile-avatar.png')}
              />
            </View>
            <View>
              <Text style={styles.currencyValue}>0</Text>
              <Text style={styles.currencyLabel}>Diamonds</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => console.log(`Pressed ${item.title}`)}>
              <View style={styles.menuIconContainer}>
                {renderIcon(item)}
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Icon name="chevron-forward" size={20} color="#8D96A8" />
            </TouchableOpacity>
          ))} */}
          <View style={styles.agencyContainer}>
            <MenuItem
              icon={<AgencyIcon name="user" size={20} color="#8D96A8" />}
              title="Agency"
              onPress={ () => navigation.navigate('AgencyRegister') }
            />
            <MenuItem
              icon={<AgencyIcon name="user" size={20} color="#8D96A8" />}
              title="Host"
              onPress={ () => navigation.navigate('HostRegister') }
            />
            <MenuItem
              icon={<MyRoomIcon name="key-outline" size={20} color="#8D96A8" />}
              title="My Room"
            />
            <MenuItem
              icon={<MaterialCommunityIcon name="post-outline" size={20} color="#8D96A8" />}
              title="My Posts"
              onPress={() => navigation.navigate('PostsScreen')}
            />
          </View>
          <View style={styles.agencyContainer}>
            <MenuItem
              icon={<MainIcon name="home" size={20} color="#8D96A8" />}
              title="Mail"
            />
            <MenuItem
              icon={
                <MaterialCommunityIcon
                  name="medal-outline"
                  size={20}
                  color="#8D96A8"
                />
              }
              title="Badge"
            />
            <MenuItem
              icon={
                <MaterialCommunityIcon
                  name="crown-outline"
                  size={20}
                  color="#8D96A8"
                />
              }
              title="My Level"
            />
          </View>
          <View style={styles.agencyContainer}>
            <MenuItem
              icon={
                <MaterialCommunityIcon
                  name="clipboard-check-outline"
                  size={20}
                  color="#8D96A8"
                />
              }
              title="Task"
            />
            <MenuItem
              icon={
                <MaterialCommunityIcon
                  name="email-newsletter"
                  size={20}
                  color="#8D96A8"
                />
              }
              title="Feedback"
            />
            <MenuItem
              icon={
                <MaterialCommunityIcon
                  name="thumbs-up-down-outline"
                  size={20}
                  color="#8D96A8"
                />
              }
              title="Invitation"
            />
            <MenuItem
              icon={<AntDesign name="setting" size={20} color="#8D96A8" />}
              title="Settings"
            />
              <MenuItem
                icon={<AntDesign name="setting" size={20} color="#8D96A8" />}
                title="VIP Rules"
                onPress={() => navigation.navigate('VipRules')}
              />
              {/* <MenuItem
                icon={<AntDesign name="setting" size={20} color="#8D96A8" />}
                title="VIP Details"
                onPress={() => navigation.navigate('VipDetails')}
              /> */}
          </View>
        </View>

        </View>
          ) :(
            <MyPosts/>
          )
        }

       
        
      </ScrollView>
    </SafeAreaView>
       <HomeFooter />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginRight: 35,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  userId: {
    fontSize: 12,
    color: '#8D96A8',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    // marginHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8D96A8',
    marginTop: 4,
  },
  currencyContainer: {
    flexDirection: 'row',
    // paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  currencyBox: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },

  currencyIconContainer: {
    marginRight: 12,
  },
  currencyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 5,
  },
  currencyLabel: {
    fontSize: 12,
    color: '#8D96A8',
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#2D3748',
  },
  menuIconContainer: {
    // width: 32,
    // height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  agencyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginBottom: 10,
  },
});

export default Profile;
