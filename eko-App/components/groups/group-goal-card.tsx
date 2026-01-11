import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroupGoalCardProps {
  title: string;
  description?: string;
  current: number;
  target: number;
  unit: string;
  memberCount: number;
  completed: boolean;
  icon?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  userContribution?: number;
  selectionMode?: boolean;
  isSelected?: boolean;
}

export default function GroupGoalCard({
  title,
  description,
  current,
  target,
  unit,
  memberCount,
  completed,
  icon = 'flag-outline',
  onPress,
  onLongPress,
  userContribution = 0,
  selectionMode = false,
  isSelected = false,
}: GroupGoalCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const progress = Math.min((current / target) * 100, 100);
  const progressPerMember = memberCount > 0 ? current / memberCount : 0;

  // Format numbers to max 2 decimal places
  const formatNumber = (num: number): string => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.completedCard, isPressed && styles.pressedCard, selectionMode && isSelected && styles.selectedCard]}
      onPress={selectionMode ? onPress : onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
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
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, completed && styles.completedIcon]}>
            <Ionicons name={icon as any} size={20} color="#fff" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        {completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#5ca990" />
          </View>
        )}
      </View>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {formatNumber(current)} / {formatNumber(target)} {unit}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color="#5ca990" />
          <Text style={styles.statText}>{memberCount} members</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#5ca990" />
          <Text style={styles.statText}>
            Your: {formatNumber(userContribution)} {unit}
          </Text>
        </View>
        <Text style={styles.percentageText}>{progress.toFixed(0)}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  completedCard: {
    borderColor: '#5ca990',
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
  },
  pressedCard: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  selectedCard: {
    borderColor: '#5ca990',
    borderWidth: 2,
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(92, 169, 144, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedIcon: {
    backgroundColor: 'rgba(92, 169, 144, 0.4)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: '#9BA1A6',
    marginTop: 8,
    marginBottom: 12,
  },
  completedBadge: {
    marginLeft: 8,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5ca990',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  percentageText: {
    color: '#5ca990',
    fontSize: 14,
    fontWeight: '600',
  },
});
