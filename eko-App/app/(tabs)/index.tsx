import { View, StyleSheet } from 'react-native'
import Dropdown from '@/components/mainPage/dropdown'
import React from 'react'
import IntroBox from '@/components/mainPage/introBox'
import MyGoals from '@/components/mainPage/mainGoals'

export default function index() {
  return (
    <View style={styles.container}>
      <Dropdown />
      <View style={{marginTop: 24}}>
      <IntroBox />
      </View>
      <View style={{marginTop: 24}}>
      <MyGoals />
      </View>

    </View>
    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 24,
  },
})
