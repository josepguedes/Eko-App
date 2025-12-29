// Wrapper component for grouped settings items

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SettingsSectionProps {
  children: React.ReactNode;
}

export default function SettingsSection({ children }: SettingsSectionProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(214, 214, 214, 0.2)',
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
});