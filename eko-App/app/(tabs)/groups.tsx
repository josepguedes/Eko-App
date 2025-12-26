import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import TabSelector from "@/components/groups/tabs";
import SuggestedGroupCard from "@/components/groups/suggested-group-card";
import GroupListCard from "@/components/groups/group-list-card";
import GoalCard from "@/components/groups/goals-card";
import BotaoCustom from "@/components/buttons";
import FloatingAddButton from "@/components/groups/create-group-button";
import { getUserGroups, getSuggestedGroups, joinGroup, Group, initializeDefaultGroups } from "@/models/groups";
import { getLoggedInUser, addGroupToUser, initializeDefaultUsers } from "@/models/users";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  completed: boolean;
}

export default function Groups() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("new");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  const tabs = [
    { key: "new", label: "New Groups" },
    { key: "joined", label: "Joined Groups" },
    { key: "goals", label: "Goals" },
  ];

  const goalsData: Goal[] = [
    {
      id: "g1",
      title: "Reach 200 pts Eco Drive Score",
      current: 200,
      target: 200,
      completed: true,
    },
    {
      id: "g2",
      title: "Reach 200 pts Eco Drive Score",
      current: 30,
      target: 200,
      completed: false,
    },
    {
      id: "g3",
      title: "Reach 200 pts Eco Drive Score",
      current: 30,
      target: 200,
      completed: false,
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Inicializar utilizadores e grupos pré-definidos
      await initializeDefaultUsers();
      await initializeDefaultGroups();
      
      const user = await getLoggedInUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserId(user.id);

      // Carregar todos os grupos disponíveis
      const availableGroups = await getSuggestedGroups(user.id);
      const userGroups = await getUserGroups(user.id);

      // Escolher 3 grupos aleatórios para sugestões
      const shuffled = [...availableGroups].sort(() => 0.5 - Math.random());
      const randomSuggested = shuffled.slice(0, 3);

      setSuggestedGroups(randomSuggested);
      setJoinedGroups(userGroups);
      setAllGroups(availableGroups);
      
      console.log('Grupos carregados:', {
        suggested: randomSuggested.length,
        joined: userGroups.length,
        all: availableGroups.length
      });
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!userId) return;

    try {
      await joinGroup(groupId, userId);
      await addGroupToUser(userId, groupId);
      await loadData();
    } catch (error) {
      console.error('Erro ao juntar-se ao grupo:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const displayedGroups = showAllGroups
    ? allGroups
    : allGroups.slice(0, 3);

  const handleFloatingButtonPress = () => {
    if (selectedTab === 'new' || selectedTab === 'joined') {
      router.push('/create-group' as any);
    } else if (selectedTab === 'goals') {
      console.log('Criar goal');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
          <Text style={styles.loadingText}>A carregar grupos...</Text>
        </View>
      );
    }

    if (selectedTab === "joined") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          {joinedGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Ainda não faz parte de nenhum grupo</Text>
              <Text style={styles.emptySubtext}>Explore os grupos disponíveis e junte-se a uma comunidade!</Text>
            </View>
          ) : (
            joinedGroups.map((group) => (
              <GroupListCard
                key={group.id}
                name={group.name}
                members={group.members.length}
                image={require("@/assets/images/partial-react-logo.png")}
                onPress={() => console.log(`Opened ${group.name}`)}
              />
            ))
          )}
        </View>
      );
    }

    if (selectedTab === "goals") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Goals</Text>
          {goalsData.map((goal) => (
            <GoalCard
              key={goal.id}
              title={goal.title}
              current={goal.current}
              target={goal.target}
              completed={goal.completed}
            />
          ))}
        </View>
      );
    }

    // Tab "new"
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Groups</Text>
          {suggestedGroups.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum grupo sugerido disponível</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            >
              {suggestedGroups.map((group) => (
                <SuggestedGroupCard
                  key={group.id}
                  name={group.name}
                  members={group.members.length}
                  image={require("@/assets/images/partial-react-logo.png")}
                  onJoin={() => handleJoinGroup(group.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Groups</Text>
          {displayedGroups.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum grupo disponível</Text>
          ) : (
            displayedGroups.map((group) => (
              <GroupListCard
                key={group.id}
                name={group.name}
                members={group.members.length}
                image={require("@/assets/images/partial-react-logo.png")}
                onPress={() => console.log(`Opened ${group.name}`)}
              />
            ))
          )}

          {!showAllGroups && allGroups.length > 3 && (
            <View style={styles.buttonContainer}>
              <BotaoCustom
                titulo="Ver Mais"
                onPress={() => setShowAllGroups(true)}
                variante="primario"
              />
            </View>
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#5ca990"
            colors={['#5ca990']}
          />
        }
      >
        <TabSelector
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          tabs={tabs}
        />

        {renderContent()}
      </ScrollView>

      <FloatingAddButton onPress={handleFloatingButtonPress} />
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
  buttonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});