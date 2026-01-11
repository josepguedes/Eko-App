import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Car } from '@/models/cars';

interface CarCardProps {
  car: Car;
  onEdit: () => void;
  onDelete: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function CarCard({ car, onEdit, onDelete, isSelected = false, onSelect }: CarCardProps) {
  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return '#5ca990';
      case 'hybrid':
        return '#7ab8a0';
      case 'diesel':
        return '#999';
      case 'gasoline':
        return '#a8d5c5';
      default:
        return '#999';
    }
  };

  const getFuelTypeIcon = (fuelType: string) => {
    switch (fuelType) {
      case 'electric':
        return 'flash';
      case 'hybrid':
        return 'leaf';
      case 'diesel':
      case 'gasoline':
        return 'water';
      default:
        return 'water';
    }
  };

  return (
    <View style={[styles.card, isSelected && styles.selectedCard]}>
      <View style={styles.header}>
        <View style={styles.carInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${getFuelTypeColor(car.fuelType)}20` }]}>
            <Ionicons name="car" size={24} color={getFuelTypeColor(car.fuelType)} />
          </View>
          <View style={styles.textInfo}>
            <View style={styles.modelContainer}>
              <Text style={styles.model}>{car.model}</Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#5ca990" />
                  <Text style={styles.selectedText}>Selecionado</Text>
                </View>
              )}
            </View>
            <View style={styles.fuelTypeContainer}>
              <Ionicons 
                name={getFuelTypeIcon(car.fuelType)} 
                size={14} 
                color={getFuelTypeColor(car.fuelType)} 
              />
              <Text style={[styles.fuelType, { color: getFuelTypeColor(car.fuelType) }]}>
                {car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          {onSelect && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.selectButton]}
              onPress={() => {
                console.log('Select button pressed');
                onSelect();
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isSelected ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={20} 
                color="#5ca990" 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('Edit button pressed');
              onEdit();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={20} color="#5ca990" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              console.log('Delete button pressed');
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    padding: 20,
    marginBottom: 16,
  },
  selectedCard: {
    borderColor: '#5ca990',
    borderWidth: 2,
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInfo: {
    flex: 1,
    gap: 6,
  },
  modelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  model: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(92, 169, 144, 0.2)',
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5ca990',
  },
  fuelTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fuelType: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: 'rgba(92, 169, 144, 0.2)',
  },
});
