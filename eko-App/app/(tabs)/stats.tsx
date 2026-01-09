// Stats screen with driving analysis, metrics, and history

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type TimePeriod = 'Today' | 'Week' | 'Month' | 'Year' | 'All Time';

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
  date: string;
  score: string;
  onPress: () => void;
}

function HistoryItem({ date, score, onPress }: HistoryItemProps) {
  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress}>
      <View style={styles.historyIconContainer}>
        <Ionicons name="trophy" size={24} color="#5ca990" />
      </View>
      <Text style={styles.historyDate}>{date}</Text>
      <Text style={styles.historyScore}>Score: {score}</Text>
      <Ionicons name="chevron-forward" size={20} color="#5ca990" />
    </TouchableOpacity>
  );
}

export default function StatsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Today');

  const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Year', 'All Time'];

  // Mock data - replace with actual data from your backend
  const statsData = {
    Today: {
      overallScore: 4.5,
      timeSpent: '89:09',
      distance: 76,
      gasSaved: 0.8,
      acceleration: 4,
      breaking: 3.5,
      speed: 5,
      co2Impact: 2,
      gasSpent: 12.25,
      gasChange: -3.4,
    },
    Week: {
      overallScore: 4.2,
      timeSpent: '523:45',
      distance: 456,
      gasSaved: 4.2,
      acceleration: 3.8,
      breaking: 3.2,
      speed: 4.5,
      co2Impact: 2.5,
      gasSpent: 78.5,
      gasChange: -2.1,
    },
    Month: {
      overallScore: 4.3,
      timeSpent: '2145:30',
      distance: 1823,
      gasSaved: 18.5,
      acceleration: 4.1,
      breaking: 3.4,
      speed: 4.7,
      co2Impact: 2.3,
      gasSpent: 312.75,
      gasChange: -1.8,
    },
    Year: {
      overallScore: 4.1,
      timeSpent: '25746:15',
      distance: 21876,
      gasSaved: 215.3,
      acceleration: 3.9,
      breaking: 3.3,
      speed: 4.4,
      co2Impact: 2.4,
      gasSpent: 3542.5,
      gasChange: -2.5,
    },
    'All Time': {
      overallScore: 4.0,
      timeSpent: '51492:30',
      distance: 43752,
      gasSaved: 430.6,
      acceleration: 3.8,
      breaking: 3.1,
      speed: 4.3,
      co2Impact: 2.6,
      gasSpent: 7085.0,
      gasChange: -3.0,
    },
  };

  const currentStats = statsData[selectedPeriod];

  const historyData = [
    { date: 'Yesterday, 09:11', score: '2.7Pts' },
    { date: '07/10, 21:30', score: '2.7Pts' },
    { date: '05/10, 20:20', score: '2.7Pts' },
  ];

  // Mock gas chart data
  const gasChartData = Array(30).fill(0).map(() => Math.random() * 100);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return '#5ca990';
    if (score >= 4.0) return '#7ab8a0';
    if (score >= 3.5) return '#a8d5c5';
    return '#999';
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Car Header */}
        <View style={styles.carHeader}>
          <View style={styles.carImageContainer}>
            <Image
              source={require('@/assets/images/car-placeholder.png')}
              style={styles.carImage}
              resizeMode="contain"
            />
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>245pts</Text>
            </View>
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
                  { backgroundColor: getScoreColor(currentStats.overallScore) }
                ]}
              />
              <View style={styles.circularScoreInner}>
                <Text style={styles.circularScoreText}>
                  {currentStats.overallScore.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStats.timeSpent}</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
              <Text style={styles.statUnit}>Min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStats.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statUnit}>Km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStats.gasSaved}</Text>
              <Text style={styles.statLabel}>Gas Saved</Text>
              <Text style={styles.statUnit}>L</Text>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.metricsContainer}>
            <MetricBar 
              label={`Acceleration: ${currentStats.acceleration}`} 
              value={currentStats.acceleration} 
              maxValue={5} 
            />
            <MetricBar 
              label={`Breaking: ${currentStats.breaking}`} 
              value={currentStats.breaking} 
              maxValue={5} 
            />
            <MetricBar 
              label={`Speed: ${currentStats.speed}`} 
              value={currentStats.speed} 
              maxValue={5} 
            />
            <MetricBar 
              label={`CO2 Impact: ${currentStats.co2Impact}`} 
              value={currentStats.co2Impact} 
              maxValue={5} 
            />
          </View>
        </View>

        {/* Gas Spent Section */}
        <View style={styles.gasSection}>
          <Text style={styles.sectionTitle}>Gas Spent</Text>
          <View style={styles.gasAmountContainer}>
            <Text style={styles.gasAmount}>{currentStats.gasSpent.toFixed(2)}L</Text>
            <View style={[
              styles.gasChangeBadge,
              currentStats.gasChange < 0 ? styles.gasChangePositive : styles.gasChangeNegative
            ]}>
              <Text style={styles.gasChangeText}>
                {currentStats.gasChange > 0 ? '+' : ''}{currentStats.gasChange.toFixed(1)}%
              </Text>
            </View>
          </View>
          <Text style={styles.gasDate}>23/11</Text>
          
          {/* Gas Chart */}
          <View style={styles.gasChart}>
            {gasChartData.map((value, index) => (
              <View
                key={index}
                style={[
                  styles.gasChartBar,
                  { height: `${value}%` }
                ]}
              />
            ))}
          </View>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>My History</Text>
          {historyData.map((item, index) => (
            <HistoryItem
              key={index}
              date={item.date}
              score={item.score}
              onPress={() => {}}
            />
          ))}
          
          {/* Check All Button */}
          <TouchableOpacity style={styles.checkAllButton}>
            <Text style={styles.checkAllButtonText}>Check All My Rides</Text>
            <Ionicons name="arrow-forward" size={20} color="#1a1a1a" />
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  carHeader: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  carImageContainer: {
    position: 'relative',
    width: '90%',
    maxWidth: 350,
    height: 180,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  pointsBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#5ca990',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pointsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    textAlign: 'center',
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
});