// Stats row component displaying user metrics in the profile screen

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateTripStatistics } from '@/models/tripStats';
import { getLoggedInUser } from '@/models/users';
import { useFocusEffect } from '@react-navigation/native';

export default function StatsRow() {
  const [stats, setStats] = useState({
    score: 0,
    totalGoals: 0,
    avgScore: 0,
  });

  const loadStats = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        // Get all-time statistics
        const tripStats = await calculateTripStatistics('All Time', user.id);
        
        // Calculate total points from trips
        const totalPoints = Math.round(tripStats.overallScore * tripStats.totalTrips * 10);
        
        // Get total completed goals
        const { getUserGoals } = await import('@/models/goals');
        const userGoals = await getUserGoals(user.id);
        const completedGoals = userGoals.filter(g => g.completed).length;

        setStats({
          score: totalPoints,
          totalGoals: completedGoals,
          avgScore: tripStats.overallScore,
        });
      }
    } catch (error) {
      console.error('Error loading profile stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={24} color="#5ca990" />
        </View>
        <Text style={styles.statValue}>{stats.score}</Text>
        <Text style={styles.statLabel}>Score</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#5ca990" />
        </View>
        <Text style={styles.statValue}>{stats.totalGoals}</Text>
        <Text style={styles.statLabel}>Total Goals</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="ribbon" size={24} color="#5ca990" />
        </View>
        <Text style={styles.statValue}>{stats.avgScore.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Avg. Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(92, 169, 144, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(214, 214, 214, 0.2)',
    marginVertical: 8,
  },
});