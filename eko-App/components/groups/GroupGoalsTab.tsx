import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '@/models/groups';
import { GroupGoal } from '@/models/groupGoals';
import { getTaskById } from '@/models/goals';
import GroupGoalCard from './group-goal-card';

interface GroupGoalsTabProps {
  group: Group;
  groupGoals: GroupGoal[];
  userId: string | null;
  isCreator: boolean;
  onCreateGoal: () => void;
  onDeleteGoal: (goalId: string) => void;
}

export default function GroupGoalsTab({
  group,
  groupGoals,
  userId,
  isCreator,
  onCreateGoal,
  onDeleteGoal,
}: GroupGoalsTabProps) {
  const activeGoals = groupGoals.filter(g => !g.completed);
  const completedGoals = groupGoals.filter(g => g.completed);

  return (
    <View style={styles.contentSection}>
      {isCreator && (
        <TouchableOpacity 
          style={styles.addGoalButton}
          onPress={onCreateGoal}
        >
          <Ionicons name="add-circle-outline" size={24} color="#5ca990" />
          <Text style={styles.addGoalButtonText}>Create Group Goal</Text>
        </TouchableOpacity>
      )}
      
      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={64} color="#5ca990" />
          <Text style={styles.emptyStateText}>No group goals yet</Text>
          <Text style={styles.emptyStateSubtext}>
            {isCreator ? 'Create a goal for the entire group to work on together!' : 'The group creator can add goals here'}
          </Text>
        </View>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <View style={styles.goalsSection}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              {activeGoals.map(goal => {
                const task = getTaskById(goal.taskId);
                if (!task) return null;
                
                const userContribution = userId ? (goal.memberProgress[userId] || 0) : 0;
                
                return (
                  <GroupGoalCard
                    key={goal.id}
                    title={task.title}
                    current={goal.currentProgress}
                    target={goal.target}
                    unit={task.unit}
                    memberCount={group.members.length}
                    completed={false}
                    icon={task.icon}
                    userContribution={userContribution}
                    onLongPress={isCreator ? () => onDeleteGoal(goal.id) : undefined}
                  />
                );
              })}
            </View>
          )}
          
          {completedGoals.length > 0 && (
            <View style={styles.goalsSection}>
              <Text style={styles.sectionTitle}>Completed Goals</Text>
              {completedGoals.map(goal => {
                const task = getTaskById(goal.taskId);
                if (!task) return null;
                
                const userContribution = userId ? (goal.memberProgress[userId] || 0) : 0;
                
                return (
                  <GroupGoalCard
                    key={goal.id}
                    title={task.title}
                    current={goal.currentProgress}
                    target={goal.target}
                    unit={task.unit}
                    memberCount={group.members.length}
                    completed={true}
                    icon={task.icon}
                    userContribution={userContribution}
                    onLongPress={isCreator ? () => onDeleteGoal(goal.id) : undefined}
                  />
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    paddingVertical: 16,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
    borderWidth: 1,
    borderColor: '#5ca990',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  addGoalButtonText: {
    color: '#5ca990',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  goalsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});
