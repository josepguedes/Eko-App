import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import TabSelector from "@/components/groups/tabs";
import SuggestedGroupCard from "@/components/groups/suggested-group-card";
import GroupListCard from "@/components/groups/group-list-card";
import BotaoCustom from "@/components/buttons";
import FloatingAddButton from "@/components/groups/create-group-button";

// Tipos de dados
interface Group {
  id: string;
  name: string;
  members: number;
  image: any;
}

export default function Groups() {
  const [selectedTab, setSelectedTab] = useState("new");
  const [showAllGroups, setShowAllGroups] = useState(false);

  const tabs = [
    { key: "new", label: "New Groups" },
    { key: "joined", label: "Joined Groups" },
    { key: "goals", label: "Goals" },
  ];

  // Dados de exemplo - Suggested Groups
  const suggestedGroups: Group[] = [
    {
      id: "1",
      name: "Let's save the planet",
      members: 47,
      image: require("@/assets/images/partial-react-logo.png"),
    },
    {
      id: "2",
      name: "Eco Warriors",
      members: 52,
      image: require("@/assets/images/partial-react-logo.png"),
    },
    {
      id: "3",
      name: "Green Future",
      members: 38,
      image: require("@/assets/images/partial-react-logo.png"),
    },
  ];

  // Dados de exemplo - All Groups
  const allGroupsData: Group[] = [
    {
      id: "4",
      name: "Green Road Heroes",
      members: 48,
      image: require("@/assets/images/partial-react-logo.png"),
    },
    {
      id: "5",
      name: "EcoDrive Portugal",
      members: 37,
      image: require("@/assets/images/partial-react-logo.png"),
    },
    {
      id: "6",
      name: "SavingMoneyGang",
      members: 38,
      image: require("@/assets/images/partial-react-logo.png"),
    },
    {
      id: "7",
      name: "Clean Energy Crew",
      members: 42,
      image: require("@/assets/images/partial-react-logo.png"),
    },
    {
      id: "8",
      name: "Sustainable Drivers",
      members: 55,
      image: require("@/assets/images/partial-react-logo.png"),
    },
  ];

  const displayedGroups = showAllGroups
    ? allGroupsData
    : allGroupsData.slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tabs Component */}
        <TabSelector
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          tabs={tabs}
        />

        {/* Suggested Groups Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Groups</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            {suggestedGroups.map((group) => (
              <SuggestedGroupCard
                key={group.id}
                name={group.name}
                members={group.members}
                image={group.image}
                onJoin={() => console.log(`Joined ${group.name}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* All Groups List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Groups</Text>
          {displayedGroups.map((group) => (
            <GroupListCard
              key={group.id}
              name={group.name}
              members={group.members}
              image={group.image}
              onPress={() => console.log(`Opened ${group.name}`)}
            />
          ))}

          {/* Ver mais button */}
          {!showAllGroups && (
            <BotaoCustom
              titulo="Ver Mais"
              onPress={() => setShowAllGroups(true)}
              variante="primario"
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button Component */}
      <FloatingAddButton onPress={() => console.log("Criar grupo")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e0d",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  carousel: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
});