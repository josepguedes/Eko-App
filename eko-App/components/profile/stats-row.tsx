// Stats display row with three equal-width cards for Score, Total Goals, and Average Score

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}

interface StatsRowProps {
  score: number;
  totalGoals: number;
  avgScore: number;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#5ca990" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StatsRow({ score, totalGoals, avgScore }: StatsRowProps) {
  return (
    <View style={styles.container}>
      <StatItem 
        icon="leaf-outline" 
        value={score.toString()} 
        label="Score" 
      />
      
      <View style={styles.divider} />
      
    <StatItem 
      icon="checkmark-circle-outline" 
      value={totalGoals.toString()} 
      label="Completed Goals" 
    />
      
      <View style={styles.divider} />
      
      <StatItem 
        icon="trophy-outline" 
        value={avgScore.toFixed(1)} 
        label="Avg. Score" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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