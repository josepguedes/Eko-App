import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SegmentedControlsProps {
  tabs: Array<{ key: string; label: string }>;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
}

export default function SegmentedControls({ tabs, selectedTab, onSelectTab }: SegmentedControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.segment,
              index === 0 && styles.segmentFirst,
              index === tabs.length - 1 && styles.segmentLast,
              selectedTab === tab.key && styles.segmentActive,
            ]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            {selectedTab === tab.key && <View style={styles.activeBackground} />}
            <Text
              style={[
                styles.segmentText,
                selectedTab === tab.key && styles.segmentTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  segmentFirst: {
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
  },
  segmentLast: {
    borderTopRightRadius: 9,
    borderBottomRightRadius: 9,
  },
  segmentActive: {
    // Active segment styling
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#5ca990',
    borderRadius: 9,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    zIndex: 1,
  },
  segmentTextActive: {
    color: '#fff',
  },
});
