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
import CreateChatRoom from './src/screens/chatRoom/CreateChatRoom';
import Profile from './src/screens/profile/Profile';
import EditProfile from './src/screens/profile/EditProfile';
// import { streamClient } from './src/utils/streamClient';

// ludo
import LudoBoardScreen from './src/screens/ludo/LudoBoardScreen';
import SplashScreen from './src/screens/ludo/SplashScreen';
import HomeScreen from './src/screens/ludo/HomeScreen';


import { Provider } from 'react-redux';
import { persistor, store } from '$redux/store';
import { PersistGate } from 'redux-persist/integration/react';

// agency
import AgencyRegister from './src/screens/agency/Register';
import CreateHost from './src/screens/agency/CreateHost';
import HostStreaming from './src/screens/agency/HostStreaming';
import HostRegister from './src/screens/host/Register';
import HostRequest from './src/screens/agency/HostRequest';
import AgencyList from './src/screens/agency/AgencyList';


const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
                  <Stack.Screen name="EditProfile" component={EditProfile} />
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
                  <Stack.Screen name="CreateChatRoom" component={CreateChatRoom} />
                  <Stack.Screen name="ChatRoom" component={ChatRoom} />
                  {/* ludo */}
                  <Stack.Screen name='SplashScreen' component={SplashScreen} />
                <Stack.Screen name='HomeScreen' component={HomeScreen} />
                <Stack.Screen name='LudoBoardScreen' component={LudoBoardScreen} />

                {/* agency */}
                <Stack.Screen name='AgencyRegister' component={AgencyRegister} />
                <Stack.Screen name='CreateHost' component={CreateHost} />
                <Stack.Screen name='HostStreaming' component={HostStreaming} />
                <Stack.Screen name='HostRequest' component={HostRequest} />
                <Stack.Screen name='AgencyList' component={AgencyList} />

                {/* host */}
                <Stack.Screen name='HostRegister' component={HostRegister} />

                </Stack.Navigator>
              </NavigationContainer>
        </UserContextProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>

  );
}

export default App;



