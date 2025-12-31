import * as React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { getLoggedInUser } from "@/models/users";
import { getUserGoals, getTaskById, UserGoal, PredefinedTask } from "@/models/goals";
import { useFocusEffect } from "@react-navigation/native";

interface GoalItemWithDetails {
  id: string;
  title: string;
  completed: boolean;
  current: number;
  target: number;
  unit: string;
}

interface MyGoalsProps {
  title?: string;
  onGoalPress?: (goalId: string) => void;
}

export default function MyGoals({ 
  title = "My Goals",
  onGoalPress
}: MyGoalsProps) {
  const [goals, setGoals] = React.useState<GoalItemWithDetails[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const loadUserGoals = async () => {
    try {
      setLoading(true);
      const loggedInUser = await getLoggedInUser();
      
      if (!loggedInUser) {
        setGoals([]);
        setProgress(0);
        return;
      }

      const userGoals = await getUserGoals(loggedInUser.id);
      
      // Map goals with task details
      const goalsWithDetails: GoalItemWithDetails[] = userGoals.map((goal: UserGoal) => {
        const task = getTaskById(goal.taskId);
        return {
          id: goal.id,
          title: task ? task.title : 'Unknown Goal',
          completed: goal.completed,
          current: goal.current,
          target: goal.target,
          unit: task?.unit || 'pts'
        };
      });

      setGoals(goalsWithDetails);

      // Calculate overall progress percentage
      if (goalsWithDetails.length > 0) {
        const totalProgress = goalsWithDetails.reduce((acc, goal) => {
          const goalProgress = Math.min((goal.current / goal.target) * 100, 100);
          return acc + goalProgress;
        }, 0);
        const averageProgress = totalProgress / goalsWithDetails.length;
        setProgress(Math.round(averageProgress));
      } else {
        setProgress(0);
      }
    } catch (error) {
      console.error('Error loading user goals:', error);
      setGoals([]);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Load goals when component mounts and when screen comes into focus
  React.useEffect(() => {
    loadUserGoals();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserGoals();
    }, [])
  );

  const handleGoalPress = (goalId: string) => {
    if (onGoalPress) {
      onGoalPress(goalId);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={[styles.card, styles.centerContent]}>
          <ActivityIndicator size="large" color="#5ca990" />
        </View>
      </SafeAreaView>
    );
  }

  if (goals.length === 0) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconWrapper}>
                <Image 
                  style={styles.targetIcon} 
                  source={require('@/assets/images/targetIcon.png')}
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color="#707070" />
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubtext}>Create your first goal to get started!</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconWrapper}>
              <Image 
                style={styles.targetIcon} 
                source={require('@/assets/images/targetIcon.png')}
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        {/* Progress Bar Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>

        <View style={styles.divider} />

        {/* Goals List */}
        <View style={styles.goalsList}>
          {goals.map((goal, index) => (
            <React.Fragment key={goal.id}>
              <TouchableOpacity 
                style={styles.goalItem} 
                activeOpacity={0.7}
                onPress={() => handleGoalPress(goal.id)}
              >
                <View style={styles.goalContent}>
                  <View style={[
                    styles.checkbox, 
                    goal.completed ? styles.checkboxCompleted : styles.checkboxIncomplete
                  ]}>
                    {goal.completed && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <View style={styles.goalTextContainer}>
                    <Text style={styles.goalText}>{goal.title}</Text>
                    <Text style={styles.goalProgress}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#f5f5f5" />
              </TouchableOpacity>
              
              {index < goals.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 368,
    backgroundColor: "transparent",
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(214, 214, 214, 0.2)",
    overflow: "hidden",
    paddingVertical: 12,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(92, 169, 144, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  targetIcon: {
    width: 24,
    height: 24,
    tintColor: "#5ca990",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f5f5f5",
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#707070",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5ca990",
    borderRadius: 25,
  },
  progressText: {
    fontSize: 12,
    color: "#a9a9a9",
    marginTop: 8,
    textAlign: "center",
  },
  divider: {
    height: 0.8,
    backgroundColor: "rgba(169, 169, 169, 0.3)",
    marginHorizontal: 16,
  },
  goalsList: {
    paddingTop: 4,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  goalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  goalTextContainer: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#5ca990",
    borderColor: "#5ca990",
  },
  checkboxIncomplete: {
    backgroundColor: "#707070",
    borderColor: "#a9a9a9",
  },
  goalText: {
    fontSize: 16,
    color: "#f5f5f5",
    lineHeight: 22,
  },
  goalProgress: {
    fontSize: 13,
    color: "#a9a9a9",
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a9a9a9',
    marginTop: 8,
    textAlign: 'center',
  },
});