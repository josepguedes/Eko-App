// Activity summary card displaying recent trip statistics

import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotaoCustom from '../buttons';
import { Viagem } from '@/models/trip';
import { getRecentTrips } from '@/models/tripStats';
import { getLoggedInUser } from '@/models/users';
import { useFocusEffect } from '@react-navigation/native';

export default function ActivitySummary() {
  const [trips, setTrips] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentTrips = async () => {
    try {
      const user = await getLoggedInUser();
      if (user) {
        const recentTrips = await getRecentTrips(4, user.id);
        setTrips(recentTrips);
      }
    } catch (error) {
      console.error('Error loading recent trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentTrips();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentTrips();
    }, [])
  );

  const formatTripDate = (date: string | Date): string => {
    const tripDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - tripDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} min ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return tripDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#5ca990" />
        </View>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart" size={20} color="#36856D" />
            </View>
            <Text style={styles.title}>Activity Summary</Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No trips recorded yet</Text>
            <Text style={styles.emptySubtext}>Start driving to see your activity</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="stats-chart" size={20} color="#36856D" />
          </View>
          <Text style={styles.title}>Activity Summary</Text>
        </View>

        {/* Activity List */}
        <View style={styles.activityList}>
          {trips.map((trip, index) => {
            const percentage = (trip.ecoScore / 5) * 100;
            return (
              <View key={trip.id || index} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Text style={styles.dateText}>{formatTripDate(trip.data)}</Text>
                  <Text style={styles.pointsText}>{trip.ecoScore.toFixed(1)}pts</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Button */}
        <BotaoCustom
          titulo="Check My Rides"
          navegarPara="/(tabs)/stats"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 28,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(54, 133, 109, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F5F5',
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    gap: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    color: '#F5F5F5',
    fontWeight: '500',
  },
  pointsText: {
    fontSize: 15,
    color: '#5ca990',
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(214, 214, 214, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5ca990',
    borderRadius: 4,
  },
  button: {
    alignSelf: 'center',
    marginTop: 8,
    width: '80%',
    height: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});