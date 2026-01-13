// Stats screen with driving analysis, metrics, and history

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  calculateTripStatistics, 
  getRecentTrips, 
  getGasSpentHistory,
  TimePeriod,
  TripStatistics 
} from '@/models/tripStats';
import { getLoggedInUser } from '@/models/users';
import { getCarById } from '@/models/cars';
import { Viagem } from '@/models/trip';
import Dropdown from '@/components/mainPage/dropdown';

interface MetricBarProps {
  label: string;
  value: number;
  maxValue: number;
}

function MetricBar({ label, value, maxValue }: MetricBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <View style={styles.metricBar}>
      <Text style={styles.metricLabel}>{label}</Text>
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
}

interface HistoryItemProps {
  trip: Viagem;
  onPress: () => void;
}

function HistoryItem({ trip, onPress }: HistoryItemProps) {
  const tripDate = new Date(trip.data);
  const formattedDate = tripDate.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress}>
      <View style={styles.historyIconContainer}>
        <Ionicons name="trophy" size={24} color="#5ca990" />
      </View>
      <Text style={styles.historyDate}>{formattedDate}</Text>
      <Text style={styles.historyScore}>Score: {trip.ecoScore}Pts</Text>
      <Ionicons name="chevron-forward" size={20} color="#5ca990" />
    </TouchableOpacity>
  );
}

export default function StatsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Today');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TripStatistics | null>(null);
  const [recentTrips, setRecentTrips] = useState<Viagem[]>([]);
  const [gasChartData, setGasChartData] = useState<number[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Year', 'All Time'];

  const loadStats = async () => {
    try {
      setLoading(true);
      const user = await getLoggedInUser();
      
      if (!user) {
        console.log('No user logged in');
        setStats(null);
        setLoading(false);
        return;
      }

      // Calculate statistics for selected period
      const statistics = await calculateTripStatistics(selectedPeriod, user.id);
      console.log('Stats loaded:', statistics);
      setStats(statistics);

      // Get recent trips
      const trips = await getRecentTrips(3, user.id);
      setRecentTrips(trips);

      // Get gas spent history
      const gasHistory = await getGasSpentHistory(30, user.id);
      setGasChartData(gasHistory.length > 0 ? gasHistory : []);

      // Calculate user points from total eco score
      const allTimeStats = await calculateTripStatistics('All Time', user.id);
      setUserPoints(Math.round(allTimeStats.overallScore * allTimeStats.totalTrips * 10));

    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values on error
      setStats(null);
      setRecentTrips([]);
      setGasChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload stats when screen is focused or period changes
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [selectedPeriod])
  );

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return '#5ca990';
    if (score >= 4.0) return '#7ab8a0';
    if (score >= 3.5) return '#a8d5c5';
    return '#999';
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="stats-chart" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No data available</Text>
          <Text style={styles.emptyText}>Start recording trips to see your statistics</Text>
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
        {/* Connected Car Dropdown */}
        <View style={styles.carDropdownContainer}>
          <Dropdown />
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{userPoints}pts</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.pageTitle}>Driving analysis</Text>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.sectionTitle}>Overall Score</Text>
          
          {/* Circular Score */}
          <View style={styles.circularScoreContainer}>
            <View style={styles.circularScoreOuter}>
              <View 
                style={[
                  styles.circularScoreProgress,
                  { backgroundColor: getScoreColor(stats.overallScore) }
                ]}
              />
              <View style={styles.circularScoreInner}>
                <Text style={styles.circularScoreText}>
                  {stats.overallScore.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.timeSpent}</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
              <Text style={styles.statUnit}>Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statUnit}>Km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.gasSaved.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Gas Saved</Text>
              <Text style={styles.statUnit}>L</Text>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.metricsContainer}>
            <MetricBar 
              label={`Eco Score: ${stats.overallScore.toFixed(1)}`} 
              value={stats.overallScore} 
              maxValue={5} 
            />
            <MetricBar 
              label={`Max Speed: ${stats.maxSpeed.toFixed(0)} km/h`} 
              value={stats.maxSpeed} 
              maxValue={120} 
            />
            <MetricBar 
              label={`Avg Speed: ${stats.avgSpeed.toFixed(0)} km/h`} 
              value={stats.avgSpeed} 
              maxValue={100} 
            />
            <MetricBar 
              label={`Trips: ${stats.totalTrips}`} 
              value={stats.totalTrips} 
              maxValue={Math.max(stats.totalTrips, 10)} 
            />
          </View>
        </View>

        {/* Gas Spent Section */}
        <View style={styles.gasSection}>
          <Text style={styles.sectionTitle}>Gas Spent</Text>
          <View style={styles.gasAmountContainer}>
            <Text style={styles.gasAmount}>{stats.gasSpent.toFixed(2)}L</Text>
            {stats.gasChange !== 0 && (
              <View style={[
                styles.gasChangeBadge,
                stats.gasChange < 0 ? styles.gasChangePositive : styles.gasChangeNegative
              ]}>
                <Text style={styles.gasChangeText}>
                  {stats.gasChange > 0 ? '+' : ''}{stats.gasChange.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.gasDate}>Last 30 days</Text>
          
          {/* Gas Chart */}
          <View style={styles.gasChart}>
            {gasChartData.map((value, index) => (
              <View
                key={index}
                style={[
                  styles.gasChartBar,
                  { height: `${Math.max(value, 4)}%` }
                ]}
              />
            ))}
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>My History</Text>
          {recentTrips.length > 0 ? (
            <>
              {recentTrips.map((trip) => (
                <HistoryItem
                  key={trip.id}
                  trip={trip}
                  onPress={() => {
                    // Navigate to trip details if implemented
                    console.log('View trip:', trip.id);
                  }}
                />
              ))}
              
              {/* Check All Button */}
              <TouchableOpacity 
                style={styles.checkAllButton}
                onPress={() => {
                  // Navigate to all trips view
                  console.log('View all trips');
                }}
              >
                <Text style={styles.checkAllButtonText}>Check All My Rides</Text>
                <Ionicons name="arrow-forward" size={20} color="#1a1a1a" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="car-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>No trips recorded yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carDropdownContainer: {
    position: 'relative',
    marginTop: 16,
    marginHorizontal: 16,
  },
  pointsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#5ca990',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  pointsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#5ca990',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  scoreCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
    textAlign: 'center',
    marginBottom: 24,
  },
  circularScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circularScoreOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularScoreProgress: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: '#5ca990',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '135deg' }],
  },
  circularScoreInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0a0e0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularScoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#f5f5f5',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 11,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(214, 214, 214, 0.2)',
  },
  metricsContainer: {
    gap: 16,
  },
  metricBar: {
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(214, 214, 214, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5ca990',
    borderRadius: 6,
  },
  gasSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 20,
  },
  gasAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  gasAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  gasChangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gasChangePositive: {
    backgroundColor: '#5ca990',
  },
  gasChangeNegative: {
    backgroundColor: '#e74c3c',
  },
  gasChangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  gasDate: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  gasChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 2,
  },
  gasChartBar: {
    flex: 1,
    backgroundColor: '#5ca990',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 4,
  },
  historySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  historyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(92, 169, 144, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyDate: {
    flex: 1,
    fontSize: 15,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  historyScore: {
    fontSize: 15,
    color: '#f5f5f5',
    fontWeight: '600',
  },
  checkAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  checkAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
});