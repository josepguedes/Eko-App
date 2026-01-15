import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuggestedGroupCardProps {
  name: string;
  members: number;
  image: ImageSourcePropType;
  onJoin?: () => void;
  group?: any;
}

export default function SuggestedGroupCard({ name, members, image, onJoin }: SuggestedGroupCardProps) {
  return (
    <View style={styles.suggestedCard}>
      <Image source={image} style={styles.suggestedImage} />
      <View style={styles.suggestedContent}>
        <Text style={styles.suggestedName}>{name}</Text>
        <View style={styles.suggestedFooter}>
          <View style={styles.membersContainer}>
            <Ionicons name="people" size={16} color="#fff" />
            <Text style={styles.membersText}>{members} members</Text>
          </View>
          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  suggestedCard: {
    width: 350,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
  },
  suggestedImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
  },
  suggestedContent: {
    padding: 16,
  },
  suggestedName: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersText: {
    color: '#999',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#5ca990',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});