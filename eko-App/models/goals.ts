import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PredefinedTask {
  id: string;
  title: string;
  description: string;
  category: 'driving' | 'consumption' | 'distance' | 'eco-score';
  unit: 'km' | 'pts' | 'l' | 'trips';
  defaultTarget: number;
  minTarget: number;
  maxTarget: number;
  icon: string;
}

export interface UserGoal {
  id: string;
  userId: string;
  taskId: string;
  target: number;
  current: number;
  startDate: Date;
  completed: boolean;
  completedDate?: Date;
}

// Predefined tasks available
export const PREDEFINED_TASKS: PredefinedTask[] = [
  {
    id: 'eco-score-200',
    title: 'Reach Eco Drive Score',
    description: 'Reach a specific eco-driving score',
    category: 'eco-score',
    unit: 'pts',
    defaultTarget: 200,
    minTarget: 50,
    maxTarget: 1000,
    icon: 'leaf-outline',
  },
  {
    id: 'distance-500',
    title: 'Drive Green Distance',
    description: 'Cover a specific distance in an eco-friendly way',
    category: 'distance',
    unit: 'km',
    defaultTarget: 500,
    minTarget: 100,
    maxTarget: 5000,
    icon: 'speedometer-outline',
  },
  {
    id: 'fuel-save-50',
    title: 'Save Fuel',
    description: 'Save a specific amount of fuel',
    category: 'consumption',
    unit: 'l',
    defaultTarget: 50,
    minTarget: 10,
    maxTarget: 200,
    icon: 'water-outline',
  },
  {
    id: 'eco-trips-20',
    title: 'Complete Eco Trips',
    description: 'Complete a number of eco-friendly trips',
    category: 'driving',
    unit: 'trips',
    defaultTarget: 20,
    minTarget: 5,
    maxTarget: 100,
    icon: 'car-outline',
  },
  {
    id: 'eco-score-500',
    title: 'Eco Master',
    description: 'Reach an advanced level of eco-driving',
    category: 'eco-score',
    unit: 'pts',
    defaultTarget: 500,
    minTarget: 200,
    maxTarget: 1000,
    icon: 'trophy-outline',
  },
  {
    id: 'distance-1000',
    title: 'Green Road Warrior',
    description: 'Cover long distances in a sustainable way',
    category: 'distance',
    unit: 'km',
    defaultTarget: 1000,
    minTarget: 500,
    maxTarget: 10000,
    icon: 'navigate-outline',
  },
];

const USER_GOALS_KEY = 'user_goals';

export async function getAllUserGoals(): Promise<UserGoal[]> {
  try {
    const data = await AsyncStorage.getItem(USER_GOALS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((json: any) => ({
      ...json,
      startDate: new Date(json.startDate),
      completedDate: json.completedDate ? new Date(json.completedDate) : undefined,
    }));
  } catch (error) {
    console.error('Erro ao obter goals:', error);
    return [];
  }
}

export async function getUserGoals(userId: string): Promise<UserGoal[]> {
  const allGoals = await getAllUserGoals();
  return allGoals.filter(goal => goal.userId === userId);
}

export async function saveUserGoal(goal: UserGoal): Promise<void> {
  try {
    const goals = await getAllUserGoals();
    const index = goals.findIndex(g => g.id === goal.id);
    
    if (index >= 0) {
      goals[index] = goal;
    } else {
      goals.push(goal);
    }
    
    await AsyncStorage.setItem(USER_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goal:', error);
    throw new Error('Error saving goal');
  }
}

export async function createUserGoal(
  userId: string,
  taskId: string,
  target: number
): Promise<UserGoal> {
  const task = PREDEFINED_TASKS.find(t => t.id === taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  if (target < task.minTarget || target > task.maxTarget) {
    throw new Error(`Value must be between ${task.minTarget} and ${task.maxTarget} ${task.unit}`);
  }

  // Check if user already has this task active
  const userGoals = await getUserGoals(userId);
  const existingGoal = userGoals.find(g => g.taskId === taskId && !g.completed);
  if (existingGoal) {
    throw new Error('You already have this goal active');
  }

  const goals = await getAllUserGoals();
  const newId = (Math.max(0, ...goals.map(g => parseInt(g.id) || 0)) + 1).toString();

  const newGoal: UserGoal = {
    id: newId,
    userId,
    taskId,
    target,
    current: 0,
    startDate: new Date(),
    completed: false,
  };

  await saveUserGoal(newGoal);
  return newGoal;
}

export async function updateGoalProgress(
  goalId: string,
  current: number
): Promise<void> {
  const goals = await getAllUserGoals();
  const goal = goals.find(g => g.id === goalId);
  
  if (!goal) {
    throw new Error('Goal not found');
  }

  goal.current = current;
  
  if (current >= goal.target && !goal.completed) {
    goal.completed = true;
    goal.completedDate = new Date();
  }

  await saveUserGoal(goal);
}

export async function deleteUserGoal(goalId: string): Promise<void> {
  try {
    const goals = await getAllUserGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await AsyncStorage.setItem(USER_GOALS_KEY, JSON.stringify(filteredGoals));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw new Error('Error deleting goal');
  }
}

export function getTaskById(taskId: string): PredefinedTask | undefined {
  return PREDEFINED_TASKS.find(t => t.id === taskId);
}