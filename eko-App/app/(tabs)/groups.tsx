import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Modal
} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState } from "react";
import { useRouter, useFocusEffect, Redirect } from "expo-router";
import TabSelector from "@/components/groups/tabs";
import SuggestedGroupCard from "@/components/groups/suggested-group-card";
import GroupListCard from "@/components/groups/group-list-card";
import GoalCard from "@/components/groups/goals-card";
import BotaoCustom from "@/components/buttons";
import FloatingAddButton from "@/components/groups/create-group-button";
import { getUserGroups, getSuggestedGroups, joinGroup, Group, initializeDefaultGroups, deleteUserGroup } from "@/models/groups";
import { getLoggedInUser, addGroupToUser, initializeDefaultUsers } from "@/models/users";
import { getUserGoals, getTaskById, UserGoal, deleteUserGoal } from "@/models/goals";

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
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);

  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [deleteGoalModalVisible, setDeleteGoalModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState<Group | null>(null);

  const tabs = [
    { key: "new", label: "New Groups" },
    { key: "joined", label: "Joined Groups" },
    { key: "goals", label: "Goals" },
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

      // Carregar goals do utilizador
      const goals = await getUserGoals(user.id);
      setUserGoals(goals);

      // Escolher 3 grupos aleatórios para sugestões
      const shuffled = [...availableGroups].sort(() => 0.5 - Math.random());
      const randomSuggested = shuffled.slice(0, 3);

      setSuggestedGroups(randomSuggested);
      setJoinedGroups(userGroups);
      setAllGroups(availableGroups);

      console.log('Data loaded:', {
        suggested: randomSuggested.length,
        joined: userGroups.length,
        all: availableGroups.length,
        goals: goals.length,
      });
    } catch (error) {
      console.error('Error loading groups:', error);
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
      console.error('Error joining group:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleLongPressGroup = (group: Group) => {
    setSelectedGroup(group);
    setLeaveModalVisible(true);
  };

  const confirmLeaveGroup = async () => {
    if (!userId || !selectedGroup) return;

    try {
      // Remover o utilizador do grupo
      const updatedMembers = selectedGroup.members.filter(id => id !== userId);
      selectedGroup.members = updatedMembers;
      await deleteUserGroup(selectedGroup.id, userId);
      setLeaveModalVisible(false);
      setSelectedGroup(null);
      await loadData();
    } catch (error) {
      console.error('Error leaving group:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goal = userGoals.find(g => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setDeleteGoalModalVisible(true);
    }
  };

  const confirmDeleteGoal = async () => {
    if (!selectedGoal) return;

    try {
      await deleteUserGoal(selectedGoal.id);
      setDeleteGoalModalVisible(false);
      setSelectedGoal(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
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
      router.push('/add-goal' as any);
    }
  };

  const handleShowJoinModal = (group: Group) => {
    setGroupToJoin(group);
    setJoinModalVisible(true);
  };

  const confirmJoinGroup = async () => {
    if (!userId || !groupToJoin) return;

    try {
      await joinGroup(groupToJoin.id, userId);
      await addGroupToUser(userId, groupToJoin.id);
      setJoinModalVisible(false);
      setGroupToJoin(null);
      await loadData();
    } catch (error) {
      console.error('Error joining group:', error);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/group-page?id=${groupId}` as any);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      );
    }

    if (selectedTab === "joined") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          {joinedGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You are not part of any group yet</Text>
              <Text style={styles.emptySubtext}>Explore available groups and join a community!</Text>
            </View>
          ) : (
            joinedGroups.map((group) => (
              <GroupListCard
                key={group.id}
                name={group.name}
                members={group.members.length}
                image={group.bannerImage && group.bannerImage !== 'default' ? { uri: group.bannerImage } : require("@/assets/images/partial-react-logo.png")}
                onPress={() => handleGroupPress(group.id)}
                onLongPress={() => handleLongPressGroup(group)}
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
          {userGoals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active goals yet</Text>
              <Text style={styles.emptySubtext}>Add a new challenge to get started!</Text>
            </View>
          ) : (
            userGoals.map((goal) => {
              const task = getTaskById(goal.taskId);
              if (!task) return null;

              return (
                <GoalCard
                  key={goal.id}
                  title={task.title}
                  current={goal.current}
                  target={goal.target}
                  unit={task.unit}
                  completed={goal.completed}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              );
            })
          )}
        </View>
      );
    }

    // Tab "new"
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Groups</Text>
          {suggestedGroups.length === 0 ? (
            <Text style={styles.emptyText}>No suggested groups available</Text>
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
                  image={group.bannerImage && group.bannerImage !== 'default' ? { uri: group.bannerImage } : require("@/assets/images/partial-react-logo.png")}
                  onJoin={() => handleJoinGroup(group.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Groups</Text>
          {displayedGroups.length === 0 ? (
            <Text style={styles.emptyText}>No available groups</Text>
          ) : (
            displayedGroups.map((group) => (
              <GroupListCard
                key={group.id}
                name={group.name}
                members={group.members.length}
                image={group.bannerImage && group.bannerImage !== 'default' ? { uri: group.bannerImage } : require("@/assets/images/partial-react-logo.png")}
                onPress={() => handleShowJoinModal(group)}
              />
            ))
          )}

          {!showAllGroups && allGroups.length > 3 && (
            <View style={styles.buttonContainer}>
              <BotaoCustom
                titulo="See More"
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
    <GestureHandlerRootView style={styles.container}>
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

      {/* Modal para sair do grupo */}
      <Modal
        visible={leaveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLeaveModalVisible(false)}
        >
          <Pressable style={styles.leaveModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Sair do Grupo</Text>
            <Text style={styles.modalMessage}>
              Tem a certeza que deseja sair do grupo "{selectedGroup?.name}"?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLeaveModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.leaveButton]}
                onPress={confirmLeaveGroup}
              >
                <Text style={styles.leaveButtonText}>Sair do Grupo</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal para juntar-se a grupo */}
      <Modal
        visible={joinModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setJoinModalVisible(false)}
        >
          <Pressable style={styles.leaveModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Juntar-se ao Grupo</Text>
            <Text style={styles.modalMessage}>
              Deseja juntar-se ao grupo "{groupToJoin?.name}"?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.joinButton]}
                onPress={confirmJoinGroup}
              >
                <Text style={styles.joinButtonText}>Juntar-se</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal para eliminar goal */}
      <Modal
        visible={deleteGoalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteGoalModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeleteGoalModalVisible(false)}
        >
          <Pressable style={styles.leaveModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Eliminar Goal</Text>
            <Text style={styles.modalMessage}>
              Tem a certeza que deseja eliminar o goal{selectedGoal ? ` "${getTaskById(selectedGoal.taskId)?.title}"` : ''}?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteGoalModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.leaveButton]}
                onPress={confirmDeleteGoal}
              >
                <Text style={styles.leaveButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </GestureHandlerRootView>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveModalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#e53935',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  joinButton: {
    backgroundColor: '#5ca990',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});