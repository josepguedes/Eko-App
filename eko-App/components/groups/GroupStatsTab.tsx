import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '@/models/groups';
import { User } from '@/models/users';

interface GroupStatsTabProps {
  group: Group;
  statistics: {
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    averageProgress: number;
    totalContributions: number;
  };
  groupMembers: User[];
}

export default function GroupStatsTab({
  group,
  statistics,
  groupMembers,
}: GroupStatsTabProps) {
  const creationDate = new Date(group.createdAt).toLocaleDateString('pt-PT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  const creator = groupMembers.find(m => m.id === group.createdBy);
  const creatorName = creator ? creator.name : 'Unknown';

  return (
    <View style={styles.contentSection}>
      <View style={styles.statsContainer}>
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#5ca990" />
            <Text style={styles.statValue}>{group.members.length}/{group.maxUsers}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color="#5ca990" />
            <Text style={styles.statValue}>{creationDate}</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#5ca990" />
            <Text style={styles.statValue}>{statistics.completedGoals}</Text>
            <Text style={styles.statLabel}>Goals Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="person" size={32} color="#5ca990" />
            <Text style={styles.statValue}>{creatorName}</Text>
            <Text style={styles.statLabel}>Creator</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    paddingVertical: 16,
  },
  statsContainer: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});
