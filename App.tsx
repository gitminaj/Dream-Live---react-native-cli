// import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Welcome from './src/screens/Welcome';
import Third from './src/screens/Third';
import OnBoarding from './src/screens/OnBoarding';
import OnBoardingSlider from './src/screens/OnBoardingSlider';
import Register from './src/screens/auth/Register';
import Login from './src/screens/auth/Login';
import VerifyEmail from './src/screens/auth/VerifyEmail';
import Home from './src/screens/Home';
import Discover from './src/screens/Discover';
import Chat from './src/screens/Chat';
import Profile from './src/screens/Profile';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// import { AppContextProvider } from './src/utils/context/context'


const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    // <AppContextProvider>
    <>
      <NavigationContainer>
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
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
      </>
    // </AppContextProvider>
    // <View>
    //   <Text>App</Text>
    // </View>
  );
}

export default App;



