import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import CarCard from '@/components/cars/car-card';
import AddCarModal from '@/components/cars/add-car-modal';
import DeleteConfirmModal from '@/components/cars/delete-confirm-modal';
import { getLoggedInUser, setSelectedCar } from '@/models/users';
import { getUserCars, createCar, updateCar, deleteCar, Car } from '@/models/cars';
import { addCarToUser, removeCarFromUser } from '@/models/users';

export default function MyCarsScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadCars();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCars();
    }, [])
  );

  const loadCars = async () => {
    try {
      setLoading(true);
      const user = await getLoggedInUser();
      if (user) {
        setUserId(user.id);
        const userCars = await getUserCars(user.id);
        setCars(userCars);
        setSelectedCarId(user.selectedCarId);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      Alert.alert('Error', 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setModalVisible(true);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setModalVisible(true);
  };

  const handleSaveCar = async (
    model: string,
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  ) => {
    try {
      if (editingCar) {
        // Update existing car
        await updateCar(editingCar.id, { model, fuelType });
      } else {
        // Create new car
        const newCar = await createCar(userId, model, fuelType);
        await addCarToUser(userId, newCar.id);
        
        // Auto-select the first car created
        if (cars.length === 0) {
          await setSelectedCar(userId, newCar.id);
          setSelectedCarId(newCar.id);
        }
      }
      await loadCars();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save car');
    }
  };

  const handleDeleteCar = (car: Car) => {
    console.log('handleDeleteCar called for car:', car.model, car.id);
    setDeletingCar(car);
    setDeleteModalVisible(true);
  };

  const confirmDeleteCar = async () => {
    if (!deletingCar) return;
    
    console.log('Delete confirmed for car:', deletingCar.id);
    try {
      await deleteCar(deletingCar.id);
      await removeCarFromUser(userId, deletingCar.id);
      await loadCars();
      console.log('Car deleted successfully');
      setDeleteModalVisible(false);
      setDeletingCar(null);
    } catch (error) {
      console.error('Error deleting car:', error);
      Alert.alert('Error', 'Failed to delete car');
    }
  };

  const cancelDelete = () => {
    console.log('Delete cancelled');
    setDeleteModalVisible(false);
    setDeletingCar(null);
  };

  const handleSelectCar = async (carId: string) => {
    try {
      await setSelectedCar(userId, carId);
      setSelectedCarId(carId);
      Alert.alert('Sucesso', 'Carro selecionado com sucesso!');
    } catch (error) {
      console.error('Error selecting car:', error);
      Alert.alert('Erro', 'Falha ao selecionar o carro');
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#f5f5f5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cars</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCar}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#5ca990" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cars.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={64} color="#707070" />
            </View>
            <Text style={styles.emptyTitle}>No cars yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first car to start tracking your eco-friendly driving!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddCar}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Add Your First Car</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.carsList}>
            <Text style={styles.sectionTitle}>
              {cars.length} {cars.length === 1 ? 'Car' : 'Cars'}
            </Text>
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onEdit={() => handleEditCar(car)}
                onDelete={() => handleDeleteCar(car)}
                isSelected={car.id === selectedCarId}
                onSelect={() => handleSelectCar(car.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddCarModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingCar(null);
        }}
        onSave={handleSaveCar}
        editCar={editingCar}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        carModel={deletingCar?.model || ''}
        onConfirm={confirmDeleteCar}
        onCancel={cancelDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(214, 214, 214, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(92, 169, 144, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#5ca990',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  carsList: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 16,
  },
});
