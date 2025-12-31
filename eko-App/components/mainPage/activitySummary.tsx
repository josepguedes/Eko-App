import * as React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotaoCustom from "../buttons";

interface ActivityItem {
  date: string;
  points: number;
  percentage: number;
}

export default function ActivitySummary() {
  const activities: ActivityItem[] = [
    { date: "Yesterday", points: 4.7, percentage: 94 },
    { date: "2 days ago", points: 3.8, percentage: 76 },
    { date: "09/11", points: 4.2, percentage: 84 },
    { date: "08/11", points: 3.9, percentage: 78 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="stats-chart" size={20} color="#36856D" />
          </View>
          <Text style={styles.title}>Activity Summary</Text>
        </View>

        {/* Activity List */}
        <View style={styles.activityList}>
          {activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityHeader}>
                <Text style={styles.dateText}>{activity.date}</Text>
                <Text style={styles.pointsText}>{activity.points.toFixed(1)}pts</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${activity.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Button */}
        <BotaoCustom
          titulo="Check My Rides"
          navegarPara="/detailedStats"
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  card: {
    width: "90%",
    maxWidth: 520,
    backgroundColor: "rgba(26, 26, 26, 0.85)",
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    gap: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F5F5F5",
  },
  activityList: {
    gap: 16,
    width: "100%",
  },
  activityItem: {
    gap: 8,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 15,
    color: "#F5F5F5",
    fontWeight: "500",
  },
  pointsText: {
    fontSize: 15,
    color: "#36856D",
    fontWeight: "700",
  },
  progressBarContainer: {
    width: "100%",
    height: 12,
    backgroundColor: "#3A3A3A",
    borderRadius: 25,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#36856D",
    borderRadius: 25,
  },
  button: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "70%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
