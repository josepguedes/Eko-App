import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '@/models/cars';

interface AddCarModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (model: string, fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid') => Promise<void>;
  editCar?: Car | null;
}

export default function AddCarModal({ visible, onClose, onSave, editCar }: AddCarModalProps) {
  const [model, setModel] = useState(editCar?.model || '');
  const [selectedFuelType, setSelectedFuelType] = useState<'gasoline' | 'diesel' | 'electric' | 'hybrid'>(
    editCar?.fuelType || 'gasoline'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible) {
      setModel(editCar?.model || '');
      setSelectedFuelType(editCar?.fuelType || 'gasoline');
      setError('');
    }
  }, [visible, editCar]);

  const fuelTypes: Array<{ value: 'gasoline' | 'diesel' | 'electric' | 'hybrid'; label: string; icon: string }> = [
    { value: 'gasoline', label: 'Gasoline', icon: 'water' },
    { value: 'diesel', label: 'Diesel', icon: 'water' },
    { value: 'electric', label: 'Electric', icon: 'flash' },
    { value: 'hybrid', label: 'Hybrid', icon: 'leaf' },
  ];

  const handleSave = async () => {
    if (!model.trim()) {
      setError('Please enter a car model');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave(model.trim(), selectedFuelType);
      setModel('');
      setSelectedFuelType('gasoline');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{editCar ? 'Edit Car' : 'Add New Car'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#f5f5f5" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Model Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Car Model</Text>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="e.g., Audi Q5, BMW 320d"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            {/* Fuel Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fuel Type</Text>
              <View style={styles.fuelTypeGrid}>
                {fuelTypes.map((fuelType) => (
                  <TouchableOpacity
                    key={fuelType.value}
                    style={[
                      styles.fuelTypeButton,
                      selectedFuelType === fuelType.value && styles.fuelTypeButtonActive,
                    ]}
                    onPress={() => setSelectedFuelType(fuelType.value)}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={fuelType.icon as any}
                      size={24}
                      color={selectedFuelType === fuelType.value ? '#fff' : '#999'}
                    />
                    <Text
                      style={[
                        styles.fuelTypeText,
                        selectedFuelType === fuelType.value && styles.fuelTypeTextActive,
                      ]}
                    >
                      {fuelType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{editCar ? 'Update' : 'Add Car'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(214, 214, 214, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 16,
    fontSize: 16,
    color: '#f5f5f5',
  },
  fuelTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fuelTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  fuelTypeButtonActive: {
    backgroundColor: '#5ca990',
    borderColor: '#5ca990',
  },
  fuelTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  fuelTypeTextActive: {
    color: '#fff',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(214, 214, 214, 0.2)',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  cancelButton: {
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#5ca990',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
