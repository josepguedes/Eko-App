import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  completed?: boolean;
  onLongPress?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

export default function GoalCard({ title, current, target, unit = 'pts', completed = false, onLongPress, selectionMode = false, isSelected = false, onPress }: GoalCardProps) {
  const progress = (current / target) * 100;

  return (
    <TouchableOpacity 
      style={[styles.goalCard, completed && styles.completedGoalCard]}
      onLongPress={onLongPress}
      onPress={selectionMode ? onPress : undefined}
      activeOpacity={0.7}
      disabled={selectionMode ? false : true}
    >
      <View style={styles.header}>
        {selectionMode && (
          <View style={styles.checkboxContainer}>
            <Ionicons 
              name={isSelected ? "checkbox" : "square-outline"} 
              size={24} 
              color={isSelected ? "#5ca990" : "#666"} 
            />
          </View>
        )}
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
        <Text style={styles.progressText}>{current}/{target}{unit}</Text>
      </View>
    </TouchableOpacity>
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
  completedGoalCard: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
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
    flex: 3,
    height: 14,
    backgroundColor: '#3a3a3a',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: '#5ca990',
  },
  progressText: {
    color: '#5ca990',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'left',
  },
});