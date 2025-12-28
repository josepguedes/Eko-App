import { Image } from 'expo-image';
import {View, Text, StyleSheet, ActivityIndicator } from 'react-native';


import ParallaxScrollView from '@/components/parallax-scroll-view';
import BotaoCustom from '@/components/buttons';
import { getLoggedInUser, logoutUser, User } from '@/models/users';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'

export default function HomeScreen() {

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const loggedUser = await getLoggedInUser();
      setUser(loggedUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await logoutUser(user.id);
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#51c284" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user logged in</Text>
        <BotaoCustom
          titulo="Go to Login"
          navegarPara="/login"
          variante="primario"
        />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.greeting}>Hello {user.name}!</Text>
          <Text style={styles.loginInfo}>
            You are logged in with:
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.userId}>User ID: {user.id}</Text>
        </View>

        <BotaoCustom
          titulo="End Session"
          onPress={handleLogout}
          variante="secundario"
          style={styles.logoutButton}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0a0e0d',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  loginInfo: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5ca990',
    marginBottom: 12,
  },
  userId: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    width: '100%',
    maxWidth: 300,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    marginBottom: 20,
  },
});