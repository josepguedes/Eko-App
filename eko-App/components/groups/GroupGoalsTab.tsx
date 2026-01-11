import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
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
  onDeleteMultiple?: (goalIds: string[]) => void;
}

export default function GroupGoalsTab({
  group,
  groupGoals,
  userId,
  isCreator,
  onCreateGoal,
  onDeleteGoal,
  onDeleteMultiple,
}: GroupGoalsTabProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  
  const activeGoals = groupGoals.filter(g => !g.completed);
  const completedGoals = groupGoals.filter(g => g.completed);

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedGoals(new Set());
  };

  const toggleGoalSelection = (goalId: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoals(newSelected);
  };

  const deleteSelected = () => {
    if (onDeleteMultiple && selectedGoals.size > 0) {
      onDeleteMultiple(Array.from(selectedGoals));
      setSelectionMode(false);
      setSelectedGoals(new Set());
    }
  };

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
          {isCreator && activeGoals.length > 0 && (
            <View style={styles.actionBar}>
              <Pressable 
                style={[styles.selectionButton, selectionMode && styles.selectionButtonActive]}
                onPress={toggleSelectionMode}
              >
                <Ionicons name={selectionMode ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={selectionMode ? "#fff" : "#5ca990"} />
                <Text style={[styles.selectionButtonText, selectionMode && styles.selectionButtonTextActive]}>
                  {selectionMode ? `Selected: ${selectedGoals.size}` : 'Delete Goals'}
                </Text>
              </Pressable>
              
              {selectionMode && selectedGoals.size > 0 && (
                <Pressable 
                  style={styles.deleteSelectedButton}
                  onPress={deleteSelected}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.deleteSelectedButtonText}>Delete</Text>
                </Pressable>
              )}
            </View>
          )}
          {activeGoals.length > 0 && (
            <View style={styles.goalsSection}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              {activeGoals.map(goal => {
                const task = getTaskById(goal.taskId);
                if (!task) return null;
                
                const userContribution = userId ? (goal.memberProgress[userId] || 0) : 0;
                
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => {
                      if (isCreator) {
                        if (!selectionMode) {
                          setSelectionMode(true);
                          setSelectedGoals(new Set([goal.id]));
                        } else {
                          toggleGoalSelection(goal.id);
                        }
                      }
                    }}
                    style={selectedGoals.has(goal.id) && styles.cardWrapperSelected}
                  >
                    <GroupGoalCard
                      title={task.title}
                      description={task.description}
                      current={goal.currentProgress}
                      target={goal.target}
                      unit={task.unit}
                      memberCount={group.members.length}
                      completed={false}
                      icon={task.icon}
                      userContribution={userContribution}
                      selectionMode={isCreator && selectionMode}
                      isSelected={selectedGoals.has(goal.id)}
                      onPress={() => {
                        if (isCreator) {
                          if (!selectionMode) {
                            setSelectionMode(true);
                            setSelectedGoals(new Set([goal.id]));
                          } else {
                            toggleGoalSelection(goal.id);
                          }
                        }
                      }}
                    />
                  </Pressable>
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
                    description={task.description}
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
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  selectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5ca990',
    gap: 8,
  },
  selectionButtonActive: {
    backgroundColor: '#5ca990',
  },
  selectionButtonText: {
    color: '#5ca990',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionButtonTextActive: {
    color: '#fff',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  deleteSelectedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardWrapperSelected: {
    opacity: 0.7,
  },
});
