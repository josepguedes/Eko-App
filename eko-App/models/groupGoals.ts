import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREDEFINED_TASKS, PredefinedTask } from './goals';

export interface GroupGoal {
  id: string;
  groupId: string;
  taskId: string;
  target: number;
  currentProgress: number; // Aggregate progress from all members
  memberProgress: { [userId: string]: number }; // Individual member contributions
  startDate: Date;
  completed: boolean;
  completedDate?: Date;
  createdBy: string;
}

const GROUP_GOALS_KEY = 'group_goals';

// Get all group goals
export async function getAllGroupGoals(): Promise<GroupGoal[]> {
  try {
    const data = await AsyncStorage.getItem(GROUP_GOALS_KEY);
    if (!data) return [];
    
    const goals = JSON.parse(data);
    return goals.map((g: any) => ({
      ...g,
      startDate: new Date(g.startDate),
      completedDate: g.completedDate ? new Date(g.completedDate) : undefined,
    }));
  } catch (error) {
    console.error('Error loading group goals:', error);
    return [];
  }
}

// Get goals for a specific group
export async function getGroupGoals(groupId: string): Promise<GroupGoal[]> {
  const allGoals = await getAllGroupGoals();
  return allGoals.filter(goal => goal.groupId === groupId);
}

// Get goals that a user participates in (through their groups)
export async function getUserGroupGoals(groupIds: string[]): Promise<GroupGoal[]> {
  const allGoals = await getAllGroupGoals();
  return allGoals.filter(goal => groupIds.includes(goal.groupId));
}

// Create a new group goal
export async function createGroupGoal(
  groupId: string,
  taskId: string,
  target: number,
  createdBy: string
): Promise<GroupGoal> {
  const allGoals = await getAllGroupGoals();
  
  const newGoal: GroupGoal = {
    id: Date.now().toString(),
    groupId,
    taskId,
    target,
    currentProgress: 0,
    memberProgress: {},
    startDate: new Date(),
    completed: false,
    createdBy,
  };
  
  allGoals.push(newGoal);
  await AsyncStorage.setItem(GROUP_GOALS_KEY, JSON.stringify(allGoals));
  
  return newGoal;
}

// Update member progress for a group goal
export async function updateGroupGoalProgress(
  goalId: string,
  userId: string,
  progress: number
): Promise<{ goalCompleted?: boolean }> {
  const allGoals = await getAllGroupGoals();
  const goalIndex = allGoals.findIndex(g => g.id === goalId);
  
  if (goalIndex === -1) {
    throw new Error('Group goal not found');
  }
  
  const goal = allGoals[goalIndex];
  
  // Update individual member progress
  goal.memberProgress[userId] = progress;
  
  // Calculate total progress (sum of all members)
  goal.currentProgress = Object.values(goal.memberProgress).reduce((sum, val) => sum + val, 0);
  
  // Check if goal is completed
  if (goal.currentProgress >= goal.target && !goal.completed) {
    goal.completed = true;
    goal.completedDate = new Date();
    
    // Return flag to trigger notification
    await AsyncStorage.setItem(GROUP_GOALS_KEY, JSON.stringify(allGoals));
    return { goalCompleted: true };
  }
  
  await AsyncStorage.setItem(GROUP_GOALS_KEY, JSON.stringify(allGoals));
  return {};
}

// Delete a group goal
export async function deleteGroupGoal(goalId: string): Promise<void> {
  const allGoals = await getAllGroupGoals();
  const filteredGoals = allGoals.filter(g => g.id !== goalId);
  await AsyncStorage.setItem(GROUP_GOALS_KEY, JSON.stringify(filteredGoals));
}

// Delete all goals for a group (when group is deleted)
export async function deleteAllGroupGoals(groupId: string): Promise<void> {
  const allGoals = await getAllGroupGoals();
  const filteredGoals = allGoals.filter(g => g.groupId !== groupId);
  await AsyncStorage.setItem(GROUP_GOALS_KEY, JSON.stringify(filteredGoals));
}

// Get task by ID from predefined tasks
export function getGroupTaskById(taskId: string): PredefinedTask | undefined {
  return PREDEFINED_TASKS.find(task => task.id === taskId);
}

// Calculate group statistics
export async function getGroupStatistics(groupId: string): Promise<{
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  averageProgress: number;
  totalContributions: number;
}> {
  const goals = await getGroupGoals(groupId);
  
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed).length;
  const activeGoals = goals.filter(g => !g.completed).length;
  
  // Calculate average progress for active goals
  const activeGoalsList = goals.filter(g => !g.completed);
  const averageProgress = activeGoalsList.length > 0
    ? activeGoalsList.reduce((sum, g) => sum + (g.currentProgress / g.target) * 100, 0) / activeGoalsList.length
    : 0;
  
  // Total contributions across all goals
  const totalContributions = goals.reduce((sum, g) => sum + g.currentProgress, 0);
  
  return {
    totalGoals,
    completedGoals,
    activeGoals,
    averageProgress,
    totalContributions,
  };
}
