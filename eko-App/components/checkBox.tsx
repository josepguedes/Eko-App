import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Já vem no Expo

interface CheckboxProps {
  label: string;
  selecionado: boolean;
  onPress: () => void;
}

export default function Checkbox({ label, selecionado, onPress }: CheckboxProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={[styles.caixa, selecionado && styles.caixaSelecionada]}>
        {selecionado && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  caixa: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  caixaSelecionada: {
    backgroundColor: '#007AFF',
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});