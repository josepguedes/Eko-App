import { View, StyleSheet, ScrollView } from 'react-native'
import Dropdown from '@/components/mainPage/dropdown'
import React from 'react'
import IntroBox from '@/components/mainPage/introBox'
import MyGoals from '@/components/mainPage/mainGoals'
import MyLastTrip from '@/components/mainPage/lastTrip'
import ActivitySummary from '@/components/mainPage/activitySummary'

export default function index() {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Dropdown />
        <View style={{ marginTop: 24 }}>
          <IntroBox />
        </View>
        <View style={{ marginTop: 24 }}>
          <MyGoals />
        </View>
        <View style={{ marginTop: 24}}>
          <MyLastTrip />
        </View>
        <View style={{ marginTop: 24 }}></View>
          <ActivitySummary />
        </View>
    </ScrollView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 24,
  },
})
