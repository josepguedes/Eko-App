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
import { PREDEFINED_TASKS, PredefinedTask, createUserGoal } from '@/models/goals';
import { getLoggedInUser } from '@/models/users';

export default function AddGoal() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<PredefinedTask | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getLoggedInUser();
      if (!user) {
        Alert.alert('Erro', 'Deve estar logado para adicionar goals');
        router.back();
        return;
      }
      setUserId(user.id);
    } catch (error) {
      console.error('Erro ao carregar utilizador:', error);
      router.back();
    }
  };

  const handleTaskSelect = (task: PredefinedTask) => {
    setSelectedTask(task);
    setTargetValue(task.defaultTarget.toString());
  };

  const handleCreateGoal = async () => {
    if (!userId || !selectedTask) {
      Alert.alert('Erro', 'Por favor, selecione uma tarefa');
      return;
    }

    const target = parseInt(targetValue);
    if (isNaN(target)) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    setLoading(true);
    try {
      await createUserGoal(userId, selectedTask.id, target);
      Alert.alert('Sucesso', 'Goal criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao criar goal:', error);
      if (error instanceof Error) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Erro ao criar goal');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'eco-score': return '#5ca990';
      case 'distance': return '#4a90e2';
      case 'consumption': return '#f5a623';
      case 'driving': return '#bd10e0';
      default: return '#5ca990';
    }
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
        <Text style={styles.sectionTitle}>Choose Your Challenge</Text>
        <Text style={styles.sectionSubtitle}>
          Selecione um objetivo e defina a sua meta
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
                  { backgroundColor: getCategoryColor(task.category) },
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
                <Text style={styles.targetLabel}>Meta:</Text>
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

        {/* Create Button */}
        {selectedTask && (
          <View style={styles.buttonContainer}>
            <BotaoCustom
              titulo={loading ? 'A criar...' : 'Create Goal'}
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
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  createButton: {
    width: 200,
  },
});