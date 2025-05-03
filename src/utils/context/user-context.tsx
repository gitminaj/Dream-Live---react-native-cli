import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { BASE_URL } from '../constant';

export const UserContext = createContext();

export const UserContextProvider = ({children}) =>{
    const [user, setUser] = useState();
    
    const fetchUser = async () =>{
        const userData = await AsyncStorage.getItem('user');
        const { _id } = JSON.parse(userData);

        console.log('userid from constext', _id)
        try {
            const response = await axios.get(`${BASE_URL}/auth/profile/${_id}`);
            console.log('response', response);
            setUser(response?.data?.data);
        } catch (error) {
            console.log('error fetching user data context', error)
        }
    }
    useEffect(()=>{
        fetchUser();
    },[])
    
    return(
        <UserContext.Provider value={{user, refreshUser: fetchUser}}>
            {children}
        </UserContext.Provider>
    )
}

