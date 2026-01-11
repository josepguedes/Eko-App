import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoalCardProps {
  title: string;
  description?: string;
  current: number;
  target: number;
  unit?: string;
  completed?: boolean;
  onLongPress?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

export default function GoalCard({ title, description, current, target, unit = 'pts', completed = false, onLongPress, selectionMode = false, isSelected = false, onPress }: GoalCardProps) {
  const progress = (current / target) * 100;
  
  // Format numbers to max 2 decimal places
  const formatNumber = (num: number): string => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

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
      
      {description && (
        <Text style={styles.goalDescription}>{description}</Text>
      )}
      
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
        <Text style={styles.progressText}>{formatNumber(current)}/{formatNumber(target)}{unit}</Text>
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
  goalDescription: {
    color: '#9BA1A6',
    fontSize: 13,
    marginBottom: 12,
    marginTop: -6,
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