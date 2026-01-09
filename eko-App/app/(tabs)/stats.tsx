import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

export default function stats() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View>
        <Text style={styles.text}>stats</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  text: {
    color: '#fff',
  },
})