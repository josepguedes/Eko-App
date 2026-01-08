// Profile settings screen matching Figma design with user card, stats, and settings sections

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import UserCard from '@/components/profile/user-card';
import StatsRow from '@/components/profile/stats-row';
import SettingsItem from '@/components/profile/settings-item';
import SettingsSection from '@/components/profile/settings-section';
import { getLoggedInUser, logoutUser, User } from '@/models/users';
import { getUserGoals } from '@/models/goals';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lightModeEnabled, setLightModeEnabled] = useState(false);

  // Stats - now calculated from user goals
  const [stats, setStats] = useState({
    score: 210,
    totalGoals: 0,
    avgScore: 4.2,
  });

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
      
      // Calculate completed goals
      if (loggedUser) {
        const userGoals = await getUserGoals(loggedUser.id);
        const completedGoalsCount = userGoals.filter(goal => goal.completed).length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalGoals: completedGoalsCount,
        }));
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

  const handleConnectCar = () => {
    console.log('Navigate to connect car');
  };

  const handleUnits = () => {
    console.log('Navigate to units settings');
  };

  const handleTerms = () => {
    console.log('Navigate to terms & conditions');
  };

  const handleSupport = () => {
    console.log('Navigate to support/help');
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
          onPress={handleUserCardPress}
        />

        {/* Stats Row */}
        <StatsRow
          score={stats.score}
          totalGoals={stats.totalGoals}
          avgScore={stats.avgScore}
        />

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
            icon="bluetooth-outline"
            label="Connect Car"
            type="navigation"
            onPress={handleConnectCar}
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
            icon="moon-outline"
            label="Light Mode"
            type="toggle"
            toggleValue={lightModeEnabled}
            onToggle={setLightModeEnabled}
            showDivider
          />
          <SettingsItem
            icon="log-out-outline"
            label="Logout"
            type="action"
            onPress={handleLogout}
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