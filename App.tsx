/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  TextInput,
  Button,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import auth from '@react-native-firebase/auth';

const MagicLinkSignIn = () => {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.authContainer}>
      <Text style={styles.sectionTitle}>Magic Link Sign In</Text>
      <TextInput
        style={styles.textInput}
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <Button
        color={'007AFF'}
        title="Send login link"
        onPress={() => sendSignInLink(email)}
      />
    </View>
  );
};

const BUNDLE_ID =
  'org.reactjs.native.example.reactnative-firebase-magiclink-app';

const sendSignInLink = async (email: string) => {
  try {
    await AsyncStorage.setItem('emailForSignIn', email);
    await auth().sendSignInLinkToEmail(email, {
      handleCodeInApp: true,
      url: 'https://bike-rentals-5f360.web.app',
      iOS: {
        bundleId: BUNDLE_ID,
      },
      android: {
        packageName: BUNDLE_ID,
      },
    });

    Alert.alert(`Login link sent to ${email}`);
  } catch (error) {
    console.error(error);
    Alert.alert('Error sending login link');
  }
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: 'lightgray',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.sectionContainer}>
        <MagicLinkSignIn />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 24,
    height: '100%',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textInput: {
    borderColor: 'blue',
    borderWidth: 1,
    marginTop: 16,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
