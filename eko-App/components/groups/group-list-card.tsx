import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroupListCardProps {
  name: string;
  members: number;
  image: ImageSourcePropType;
  onPress?: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
}

export default function GroupListCard({ name, members, image, onPress, onLongPress, selectionMode, isSelected }: GroupListCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.groupCard,
        selectionMode && isSelected && styles.groupCardSelected
      ]} 
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      {selectionMode && (
        <View style={styles.checkboxContainer}>
          <Ionicons 
            name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={isSelected ? "#5ca990" : "#666"} 
          />
        </View>
      )}
      <Image source={image} style={styles.groupImage} />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{name}</Text>
        <View style={styles.membersContainer}>
          <Ionicons style={styles.membersText} name="people" size={14} color="#fff" />
          <Text style={styles.membersText}>{members} members</Text>
        </View>
      </View>
      {!selectionMode && (
        <Ionicons name="chevron-forward" size={24} color="#5ca990" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  groupCardSelected: {
    borderColor: '#5ca990',
    borderWidth: 2,
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  groupName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 16,
  },
});