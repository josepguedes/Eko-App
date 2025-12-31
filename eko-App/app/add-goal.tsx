import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BotaoCustom from '@/components/buttons';
import { useNotification } from '@/contexts/NotificationContext';
import { PREDEFINED_TASKS, PredefinedTask, createUserGoal } from '@/models/goals';
import { getLoggedInUser } from '@/models/users';

export default function AddGoal() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [selectedTask, setSelectedTask] = useState<PredefinedTask | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getLoggedInUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to add goals');
        router.back();
        return;
      }
      setUserId(user.id);
    } catch (error) {
      console.error('Error loading user:', error);
      router.back();
    }
  };

  const handleTaskSelect = (task: PredefinedTask) => {
    setSelectedTask(task);
    setTargetValue(task.defaultTarget.toString());
    setErrorMessage(null); // Limpar erro ao selecionar nova tarefa
  };

  const handleCreateGoal = async () => {
    setErrorMessage(null); // Limpar mensagem de erro anterior

    if (!userId || !selectedTask) {
      setErrorMessage('Please select a task');
      return;
    }

    const target = parseInt(targetValue);
    if (isNaN(target)) {
      setErrorMessage('Please enter a valid number');
      return;
    }

    if (target < selectedTask.minTarget) {
      setErrorMessage(`Minimum target is ${selectedTask.minTarget} ${selectedTask.unit}`);
      return;
    }

    if (target > selectedTask.maxTarget) {
      setErrorMessage(`Maximum target is ${selectedTask.maxTarget} ${selectedTask.unit}`);
      return;
    }

    setLoading(true);
    try {
      await createUserGoal(userId, selectedTask.id, target);
      
      // Show success notification
      showNotification('success', `Goal "${selectedTask.title}" created successfully!`);
      
      // Navegar para a tab de goals após a notificação
      setTimeout(() => {
        router.replace('/(tabs)/groups?tab=goals');
      }, 1500);
    } catch (error) {
      console.error('Error creating goal:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to create goal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string, isSelected: boolean = false) => {
    const baseColor = '#5ca990';  // Main green for all categories
    const darkerColor = '#3d8f7d'; // Darker green when selected
    return isSelected ? darkerColor : baseColor;
  };

  if (!userId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#5ca990" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Goal</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Choose Your Goal</Text>
        <Text style={styles.sectionSubtitle}>
          Select a goal and set your target
        </Text>

        {/* Task Cards */}
        {PREDEFINED_TASKS.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              selectedTask?.id === task.id && styles.taskCardSelected,
            ]}
            onPress={() => handleTaskSelect(task)}
          >
            <View style={styles.taskHeader}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: getCategoryColor(task.category, selectedTask?.id === task.id) },
                ]}
              >
                <Ionicons name={task.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
              {selectedTask?.id === task.id && (
                <Ionicons name="checkmark-circle" size={24} color="#5ca990" />
              )}
            </View>

            {selectedTask?.id === task.id && (
              <View style={styles.targetContainer}>
                <Text style={styles.targetLabel}>Target:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    keyboardType="number-pad"
                    placeholder={task.defaultTarget.toString()}
                    placeholderTextColor="#666"
                  />
                  <Text style={styles.unit}>{task.unit}</Text>
                </View>
                <Text style={styles.rangeText}>
                  ({task.minTarget} - {task.maxTarget} {task.unit})
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#e53935" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Create Button */}
        {selectedTask && (
          <View style={styles.buttonContainer}>
            <BotaoCustom
              titulo={loading ? 'Creating...' : 'Create Goal'}
              onPress={handleCreateGoal}
              variante="primario"
              style={styles.createButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  taskCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  taskCardSelected: {
    borderColor: '#5ca990',
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: '#999',
  },
  targetContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5ca990',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
  },
  unit: {
    fontSize: 16,
    color: '#5ca990',
    fontWeight: '600',
  },
  rangeText: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: '#e53935',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  createButton: {
    width: 200,
  },
});