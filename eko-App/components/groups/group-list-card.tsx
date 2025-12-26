import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroupListCardProps {
  name: string;
  members: number;
  image: ImageSourcePropType;
  onPress?: () => void;
}

export default function GroupListCard({ name, members, image, onPress }: GroupListCardProps) {
  return (
    <TouchableOpacity style={styles.groupCard} onPress={onPress}>
      <Image source={image} style={styles.groupImage} />
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{name}</Text>
        <View style={styles.membersContainer}>
          <Ionicons name="people" size={14} color="#fff" />
          <Text style={styles.membersText}>{members} members</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#5ca990" />
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
  },
});