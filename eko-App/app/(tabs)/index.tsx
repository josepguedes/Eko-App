import { View, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Dropdown from '@/components/mainPage/dropdown'
import React from 'react'
import IntroBox from '@/components/mainPage/introBox'
import MyGoals from '@/components/mainPage/mainGoals'
import MyLastTrip from '@/components/mainPage/lastTrip'
import ActivitySummary from '@/components/mainPage/activitySummary'

export default function index() {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <Dropdown />
        </View>
        <View style={styles.section}>
          <IntroBox />
        </View>
        <View style={styles.section}>
          <MyGoals />
        </View>
        <View style={styles.section}>
          <MyLastTrip />
        </View>
        <View style={styles.section}>
          <ActivitySummary />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  topSection: {
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
})
