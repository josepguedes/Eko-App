// Reusable settings list item with icon, label, and optional toggle or chevron

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type?: 'navigation' | 'toggle' | 'action';
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  showDivider?: boolean;
}

export default function SettingsItem({
  icon,
  label,
  type = 'navigation',
  toggleValue = false,
  onToggle,
  onPress,
  showDivider = true,
}: SettingsItemProps) {
  const handlePress = () => {
    if (type !== 'toggle' && onPress) {
      onPress();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={type === 'toggle' ? 1 : 0.7}
        disabled={type === 'toggle'}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color="#5ca990" />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>

        {type === 'toggle' && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: '#3e3e3e', true: '#5ca990' }}
            thumbColor="#fff"
            ios_backgroundColor="#3e3e3e"
          />
        )}

        {type === 'navigation' && (
          <Ionicons name="chevron-forward" size={20} color="#999" />
        )}
      </TouchableOpacity>

      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(92, 169, 144, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(214, 214, 214, 0.1)',
    marginLeft: 68,
  },
});