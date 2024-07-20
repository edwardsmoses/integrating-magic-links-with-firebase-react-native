/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
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
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import dynamicLinks from '@react-native-firebase/dynamic-links';

const MagicLinkLogin = () => {
  const [email, setEmail] = useState('');

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

const useEmailLinkEffect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleDynamicLink = async (link: any) => {
      console.log('what is link', link);
      if (auth().isSignInWithEmailLink(link.url)) {
        setLoading(true);

        try {
          const email = await AsyncStorage.getItem('emailForSignIn');
          await auth().signInWithEmailLink(email as string, link.url);
        } catch (e: any) {
          setError(e);
        } finally {
          setLoading(false);
        }
      }
    };

    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    dynamicLinks()
      .getInitialLink()
      .then(link => link && handleDynamicLink(link));

    return () => unsubscribe();
  }, []);

  return {error, loading};
};

const EmailLinkHandler = () => {
  const {loading, error} = useEmailLinkEffect();

  if (loading || error) {
    return (
      <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer]}>
        {loading && <ActivityIndicator />}
      </View>
    );
  }

  return null;
};

const MagicLinkSignIn = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(authUser => {
      setUser(authUser);
      if (initializing) {
        setInitializing(false);
      }
    });
    return () => subscriber(); // unsubscribe on unmount
  }, [initializing]);

  if (initializing) {
    return null;
  }

  if (!user) {
    return <MagicLinkLogin />;
  }

  return (
    <View style={styles.authContainer}>
      <Text style={styles.sectionTitle}>Welcome {user.email}</Text>
    </View>
  );
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
        <EmailLinkHandler />
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
  loadingContainer: {
    backgroundColor: 'rgba(250,250,250,0.33)',
    justifyContent: 'center',
    alignItems: 'center',
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
