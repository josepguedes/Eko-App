import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  completed?: boolean;
  onDelete?: () => void;
}

export default function GoalCard({ title, current, target, unit = 'pts', completed = false, onDelete }: GoalCardProps) {
  const progress = (current / target) * 100;
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteButton,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <Ionicons name="trash" size={28} color="#fff" />
      </Animated.View>
    );
  };

  const goalCardContent = (
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
        <Text style={styles.progressText}>{current}/{target}{unit}</Text>
      </View>
    </View>
  );

  const handleSwipeOpen = () => {
    // Fechar o swipeable automaticamente para criar efeito de fisga
    swipeableRef.current?.close();
    // Chamar onDelete após um pequeno delay para o efeito visual
    setTimeout(() => {
      onDelete?.();
    }, 200);
  };

  if (onDelete) {
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={handleSwipeOpen}
        overshootRight={false}
        rightThreshold={40}
      >
        {goalCardContent}
      </Swipeable>
    );
  }

  return goalCardContent;
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
  deleteButton: {
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 16,
    marginBottom: 12,
  },
});