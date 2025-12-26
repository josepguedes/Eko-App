import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  completed?: boolean;
}

export default function GoalCard({ title, current, target, completed = false }: GoalCardProps) {
  const progress = (current / target) * 100;

  return (
    <View style={styles.goalCard}>
      <View style={styles.header}>
        <Text style={styles.goalTitle}>{title}</Text>
        {completed && (
          <Ionicons name="checkmark-circle" size={24} color="#5ca990" />
        )}
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(progress, 100)}%`,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{current}/{target}pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#5ca990',
  },
  progressText: {
    color: '#5ca990',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 80,
  },
});