import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {createContext, useEffect, useState} from 'react';
import {BASE_URL} from '../constant';
import { getDataFromStore } from '../../store';

export const UserContext = createContext();

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState(  );
  const [followers, setFollowers] = useState();
  const [following, setFollowing] = useState();
  const [followRequest, setFollowRequest] = useState();
  const [userPost, setUserPost] = useState();

  const fetchUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    const {_id} = JSON.parse(userData);

    console.log('userid from constext', _id);
    try {
      const response = await axios.get(`${BASE_URL}/auth/profile/${_id}`);
      // console.log('response', response);
      setUser(response?.data?.data);
    } catch (error) {
      console.log('error fetching user data context', error);
    }
  };

  const getFollowingUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    const {_id} = JSON.parse(userData);
    try {
      const response = await axios.get(`${BASE_URL}/follow/following/${_id}`);

      // console.log('following user', response);
      setFollowing(response?.data?.data);
      return response?.data?.data;
    } catch (error) {
      console.log('error fetching all users', error);
    }
  };

  const getFollowerUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    const {_id} = JSON.parse(userData);
    try {
      const response = await axios.get(`${BASE_URL}/follow/follower/${_id}`);

      // console.log('follower user', response);
      setFollowers(response?.data?.data);
      return response?.data?.data;
    } catch (error) {
      console.log('error fetching all users', error.response);
    }
  };

  const getFollowRequest = async () => {
    const userData = await AsyncStorage.getItem('user');
    const {_id} = JSON.parse(userData);
    try {
      const response = await axios.get(`${BASE_URL}/follow/getFollowRequests/${_id}`);

      console.log('follow user request', response);
      setFollowRequest(response?.data?.data);
      return response?.data?.data;
    } catch (error) {
      console.log('error fetching all users', error.response);
    }
  };

  const fetchUsersPosts = async () => {
    const token = await getDataFromStore('token');
    try {
      const response = await axios.get(`${BASE_URL}/post/get-usersPosts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('response', response?.data?.data)
      setUserPost(response?.data?.data);
      return response?.data?.data;
      
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  }


  const refreshAllUserData = async () => {
    await Promise.all([
      fetchUser(),
      getFollowingUser(),
      getFollowerUser(),
      fetchUsersPosts(),
      getFollowRequest()
    ]);
  };

  useEffect(() => {
    refreshAllUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{user, refreshAllUserData, getFollowingUser, getFollowerUser, followers, following, userPost, followRequest}}>
      {children}
    </UserContext.Provider>
  );
}
