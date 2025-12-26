import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TabSelectorProps {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  tabs: Array<{ key: string; label: string }>;
}

export default function TabSelector({ selectedTab, onSelectTab, tabs }: TabSelectorProps) {
  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
          onPress={() => onSelectTab(tab.key)}>
          <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 35,
    width: '100%',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#5ca990',
    borderColor: '#5ca990',
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
});