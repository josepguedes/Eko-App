// Profile settings screen matching Figma design with user card, stats, and settings sections

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import UserCard from '@/components/profile/user-card';
import StatsRow from '@/components/profile/stats-row';
import SettingsItem from '@/components/profile/settings-item';
import SettingsSection from '@/components/profile/settings-section';
import { getLoggedInUser, logoutUser, User } from '@/models/users';
import { getUserGoals } from '@/models/goals';
import { useFocusEffect } from '@react-navigation/native';
import { useNotification } from '@/contexts/NotificationContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // Reload user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const loggedUser = await getLoggedInUser();
      setUser(loggedUser);
      
      // Load notification settings
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotificationsEnabled(settings.enabled ?? true);
      }
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

  const handleUserCardPress = () => {
    // Navigate to profile details/edit screen
    router.push('/edit-profile');
  };

  const handleUnits = () => {
    console.log('Navigate to units settings');
  };

  const handleMyCars = () => {
    router.push('/mycars');
  };

  const handleTerms = () => {
    router.push('/terms');
  };

  const handleSupport = () => {
    router.push('/support');
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Clear Storage',
      'This will delete ALL app data (users, trips, goals, cars). This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              showNotification('success', 'Storage cleared successfully!');
              
              // Update user state immediately
              setUser(null);
              
              // Redirect to login after clearing - use a longer delay to ensure notification shows
              setTimeout(() => {
                try {
                  router.replace('/login');
                } catch (navError) {
                  console.error('Navigation error:', navError);
                  // Force reload the app as fallback
                  router.replace('/');
                }
              }, 2000);
            } catch (error) {
              showNotification('critical', 'Failed to clear storage');
              console.error('Error clearing storage:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <UserCard
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          onPress={handleUserCardPress}
        />

        {/* Stats Row - Now loads its own data */}
        <StatsRow />

        {/* Settings Section 1 */}
        <SettingsSection>
          <SettingsItem
            icon="notifications-outline"
            label="Notifications"
            type="toggle"
            toggleValue={notificationsEnabled}
            onToggle={setNotificationsEnabled}
            showDivider
          />
          <SettingsItem
            icon="speedometer-outline"
            label="Units"
            type="navigation"
            onPress={handleUnits}
            showDivider
          />
          <SettingsItem
            icon="car-outline"
            label="My Cars"
            type="navigation"
            onPress={handleMyCars}
            showDivider
          />
          <SettingsItem
            icon="document-text-outline"
            label="Terms & Conditions"
            type="navigation"
            onPress={handleTerms}
            showDivider
          />
          <SettingsItem
            icon="help-circle-outline"
            label="Support/Help"
            type="navigation"
            onPress={handleSupport}
            showDivider={false}
          />
        </SettingsSection>

        {/* Settings Section 2 */}
        <SettingsSection>
          <SettingsItem
            icon="log-out-outline"
            label="Logout"
            type="action"
            onPress={handleLogout}
            showDivider
          />
          <SettingsItem
            icon="trash-outline"
            label="Clear Storage (DEBUG)"
            type="action"
            onPress={handleClearStorage}
            showDivider={false}
          />
        </SettingsSection>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for bottom tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 24,
  },
});