import { View, StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return <View style={[StyleSheet.absoluteFill, styles.background]} />;
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'transparent',
  },
});
