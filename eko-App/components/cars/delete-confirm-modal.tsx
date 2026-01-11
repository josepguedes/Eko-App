import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteConfirmModalProps {
  visible: boolean;
  carModel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  visible,
  carModel,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={48} color="#e74c3c" />
          </View>
          
          <Text style={styles.title}>Delete Car</Text>
          <Text style={styles.message}>
            Are you sure you want to delete{'\n'}
            <Text style={styles.carName}>{carModel}</Text>?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  carName: {
    color: '#f5f5f5',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
