// import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { Chat, OverlayProvider } from 'stream-chat-react-native';
// import Toast from 'react-native-toast-message';

import Welcome from './src/screens/Welcome';
import Third from './src/screens/Third';
import OnBoarding from './src/screens/OnBoarding';
import OnBoardingSlider from './src/screens/OnBoardingSlider';
import Register from './src/screens/auth/Register';
import Login from './src/screens/auth/Login';
import VerifyEmail from './src/screens/auth/VerifyEmail';
import Home from './src/screens/Home';
import Discover from './src/screens/Discover';
import ChatScreen from './src/screens/Chat';
import Profile from './src/screens/Profile';
import LiveAudioRoom from './src/screens/LiveAudioRoom';
import Followers from './src/screens/Followers';
import Following from './src/screens/Following';
import MessageList from './src/screens/MessageList';
import VipRules from './src/screens/VipRules';
import VipDetails from './src/screens/VipDetails';
import CreatePost from './src/screens/post/CreatePost';
import PostsScreen from './src/screens/post/PostsScreen';
import UpdatePost from './src/screens/post/UpdatePost';
// import GalleryPicker from './src/screens/post/GalleryPicker';
import CustomGallery from './src/screens/post/CustomGallery';
import MyPosts from './src/screens/post/MyPosts';
import ChatRoom from './src/screens/chatRoom/ChatRoom';

import { UserContextProvider } from './src/utils/context/user-context';
// import { streamClient } from './src/utils/streamClient';


const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView>

    <UserContextProvider>
      {/* <OverlayProvider>
        <Chat client={streamClient}> */}
          <NavigationContainer theme={DarkTheme} >
            <Stack.Navigator screenOptions={{ headerShown: false }} >
              <Stack.Screen name="Welcome" component={Welcome} />
              <Stack.Screen name="Third" component={Third} />
              <Stack.Screen name="OnBoarding" component={OnBoarding} />
              <Stack.Screen name="OnBoardingSlider" component={OnBoardingSlider} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Discover" component={Discover} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="LiveAudioRoom" component={LiveAudioRoom} />
              <Stack.Screen name="Followers" component={Followers} />
              <Stack.Screen name="Following" component={Following} />
              <Stack.Screen name="MessageList" component={MessageList} />
              <Stack.Screen name="VipRules" component={VipRules} />
              <Stack.Screen name="VipDetails" component={VipDetails} />
              <Stack.Screen name="CreatePost" component={CreatePost} />
              <Stack.Screen name="PostsScreen" component={PostsScreen} />
              <Stack.Screen name="UpdatePost" component={UpdatePost} />
              <Stack.Screen name="MyPosts" component={MyPosts} />
              <Stack.Screen name="CustomGallery" component={CustomGallery} />
              <Stack.Screen name="ChatRoom" component={ChatRoom} />
            </Stack.Navigator>
          </NavigationContainer>
    </UserContextProvider>
    </GestureHandlerRootView>

  );
}

export default App;



