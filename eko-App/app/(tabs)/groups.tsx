import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useMemo, useCallback } from "react";
import { useRouter, useFocusEffect, Redirect, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import TabSelector from "@/components/groups/tabs";
import SuggestedGroupCard from "@/components/groups/suggested-group-card";
import GroupListCard from "@/components/groups/group-list-card";
import GoalCard from "@/components/goals/goals-card";
import BotaoCustom from "@/components/buttons";
import FloatingAddButton from "@/components/groups/create-group-button";
import { useNotification } from "@/contexts/NotificationContext";
import { getUserGroups, getSuggestedGroups, joinGroup, Group, deleteUserGroup, getGroupById } from "@/models/groups";
import { getLoggedInUser, addGroupToUser } from "@/models/users";
import { getUserGoals, getTaskById, UserGoal, deleteUserGoal } from "@/models/goals";
import { getGroupImageSource } from "@/utils/imageHelper";
import { getUserGroupGoals, GroupGoal, getGroupTaskById } from "@/models/groupGoals";
import GroupGoalCard from "@/components/groups/group-goal-card";

export default function Groups() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showNotification } = useNotification();
  const [selectedTab, setSelectedTab] = useState("new");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [suggestedGroups, setSuggestedGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [groupGoals, setGroupGoals] = useState<GroupGoal[]>([]);
  const [goalsSubTab, setGoalsSubTab] = useState<'my' | 'group'>('my');

  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState<Group | null>(null);
  
  // Pesquisa
  const [searchQuery, setSearchQuery] = useState('');
  
  // Seleção múltipla
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const tabs = [
    { key: "new", label: "Explore Groups" },
    { key: "joined", label: "Your Groups" },
    { key: "goals", label: "Goals" },
  ];

  // Cache de tasks para evitar múltiplas chamadas de getTaskById
  const taskCache = useMemo(() => {
    const cache = new Map();
    userGoals.forEach(goal => {
      const task = getTaskById(goal.taskId);
      if (task) cache.set(goal.taskId, task);
    });
    return cache;
  }, [userGoals]);

  const groupTaskCache = useMemo(() => {
    const cache = new Map();
    groupGoals.forEach(goal => {
      const task = getGroupTaskById(goal.taskId);
      if (task) cache.set(goal.taskId, task);
    });
    return cache;
  }, [groupGoals]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      // Se vier com parâmetro tab=goals, mudar para a tab de goals
      if (params.tab === 'goals') {
        setSelectedTab('goals');
      }
    }, [params.tab])
  );

  const loadData = async () => {
    try {
      setLoading(true);

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
      
      // Carregar group goals dos grupos que o utilizador participa
      const userGroupIds = userGroups.map(g => g.id);
      const gGoals = await getUserGroupGoals(userGroupIds);
      setGroupGoals(gGoals);

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
      
      // Show notification and redirect to group page
      const joinedGroup = await getGroupById(groupId);
      if (joinedGroup) {
        showNotification('success', `Successfully joined ${joinedGroup.name}!`);
        setTimeout(() => {
          router.push(`/group-page?id=${groupId}` as any);
        }, 1500);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      if (error instanceof Error) {
        showNotification('critical', error.message);
      } else {
        showNotification('critical', 'Failed to join group');
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
      const groupName = selectedGroup.name;
      // Remover o utilizador do grupo
      const updatedMembers = selectedGroup.members.filter(id => id !== userId);
      selectedGroup.members = updatedMembers;
      await deleteUserGroup(selectedGroup.id, userId);
      setLeaveModalVisible(false);
      setSelectedGroup(null);
      await loadData();
      showNotification('success', `Successfully left ${groupName}`);
    } catch (error) {
      console.error('Error leaving group:', error);
      if (error instanceof Error) {
        showNotification('critical', error.message);
      } else {
        showNotification('critical', 'Failed to leave group');
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
  
  // Função para toggle de seleção múltipla
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems(new Set());
  };
  
  // Função para selecionar/desselecionar item
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };
  
  // Função para deletar itens selecionados
  const deleteSelectedItems = async () => {
    if (!userId) return;
    
    try {
      if (selectedTab === 'joined') {
        // Deletar grupos selecionados
        for (const groupId of selectedItems) {
          await deleteUserGroup(groupId, userId);
        }
        showNotification('success', `Successfully left ${selectedItems.size} group(s)`);
      } else if (selectedTab === 'goals') {
        // Deletar goals selecionados
        for (const goalId of selectedItems) {
          await deleteUserGoal(goalId);
        }
        showNotification('success', `Successfully deleted ${selectedItems.size} goal(s)`);
      }
      
      setSelectionMode(false);
      setSelectedItems(new Set());
      await loadData();
    } catch (error) {
      console.error('Error deleting selected items:', error);
      showNotification('critical', 'Failed to delete some items');
    }
  };
  
  // Filtrar grupos com base na pesquisa (memoized)
  const filterGroups = useCallback((groups: Group[]) => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter(group => 
      group.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  
  // Grupos filtrados memoizados
  const filteredSuggestedGroups = useMemo(() => filterGroups(suggestedGroups), [suggestedGroups, filterGroups]);
  const filteredJoinedGroups = useMemo(() => filterGroups(joinedGroups), [joinedGroups, filterGroups]);
  const filteredAllGroups = useMemo(() => filterGroups(allGroups), [allGroups, filterGroups]);
  
  // Goals filtrados e categorizados (memoized)
  const categorizedGoals = useMemo(() => {
    return {
      activeGoals: userGoals.filter(goal => !goal.completed),
      completedGoals: userGoals.filter(goal => goal.completed),
      activeGroupGoals: groupGoals.filter(g => !g.completed),
      completedGroupGoals: groupGoals.filter(g => g.completed),
    };
  }, [userGoals, groupGoals]);

  const handleShowJoinModal = (group: Group) => {
    setGroupToJoin(group);
    setJoinModalVisible(true);
  };

  const confirmJoinGroup = async () => {
    if (!userId || !groupToJoin) return;

    try {
      const groupName = groupToJoin.name;
      const groupId = groupToJoin.id;
      await joinGroup(groupToJoin.id, userId);
      await addGroupToUser(userId, groupToJoin.id);
      setJoinModalVisible(false);
      setGroupToJoin(null);
      await loadData();
      
      // Show notification and redirect to group page
      showNotification('success', `Successfully joined ${groupName}!`);
      setTimeout(() => {
        router.push(`/group-page?id=${groupId}` as any);
      }, 1500);
    } catch (error) {
      console.error('Error joining group:', error);
      if (error instanceof Error) {
        showNotification('critical', error.message);
      } else {
        showNotification('critical', 'Failed to join group');
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
      const createdGroups = filteredJoinedGroups.filter(group => group.createdBy === userId);
      const memberGroups = filteredJoinedGroups.filter(group => group.createdBy !== userId);

      return (
        <>
          {/* Barra de pesquisa */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { outlineStyle: 'none' } as any]}
              placeholder="Search groups..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </Pressable>
            )}
          </View>
          
          {/* Groups Created By User */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Groups Created</Text>
            {createdGroups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No groups found' : "You haven't created any groups yet"}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try a different search' : 'Create a new group to start your community!'}
                </Text>
              </View>
            ) : (
              createdGroups.map((group) => (
                <GroupListCard
                  key={group.id}
                  name={group.name}
                  members={group.members.length}
                  image={getGroupImageSource(group.bannerImage)}
                  onPress={() => handleGroupPress(group.id)}
                  onLongPress={() => handleLongPressGroup(group)}
                />
              ))
            )}
          </View>

          {/* Groups User is Member Of */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Groups Joined</Text>
            {memberGroups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No groups found' : 'You are not part of any group yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try a different search' : 'Explore available groups and join a community!'}
                </Text>
              </View>
            ) : (
              memberGroups.map((group) => (
                <GroupListCard
                  key={group.id}
                  name={group.name}
                  members={group.members.length}
                  image={getGroupImageSource(group.bannerImage)}
                  onPress={() => handleGroupPress(group.id)}
                />
              ))
            )}
          </View>
        </>
      );
    }

    if (selectedTab === "goals") {
      const { activeGoals, completedGoals, activeGroupGoals, completedGroupGoals } = categorizedGoals;

      return (
        <>
          {/* Sub-tabs for Goals */}
          <View style={styles.goalsSubTabs}>
            <Pressable
              style={[styles.subTab, goalsSubTab === 'my' && styles.subTabActive]}
              onPress={() => {
                setGoalsSubTab('my');
                setSearchQuery('');
                setSelectionMode(false);
                setSelectedItems(new Set());
              }}
            >
              <Text style={[styles.subTabText, goalsSubTab === 'my' && styles.subTabTextActive]}>
                My Goals
              </Text>
            </Pressable>
            <Pressable
              style={[styles.subTab, goalsSubTab === 'group' && styles.subTabActive]}
              onPress={() => {
                setGoalsSubTab('group');
                setSearchQuery('');
                setSelectionMode(false);
                setSelectedItems(new Set());
              }}
            >
              <Text style={[styles.subTabText, goalsSubTab === 'group' && styles.subTabTextActive]}>
                Group Goals
              </Text>
            </Pressable>
          </View>

          {goalsSubTab === 'my' ? (
            <>
              {/* Botão de seleção múltipla para My Goals */}
              {activeGoals.length > 0 && (
                <View style={styles.actionBar}>
                  <Pressable 
                    style={[styles.selectionButton, selectionMode && styles.selectionButtonActive]}
                    onPress={toggleSelectionMode}
                  >
                    <Ionicons name={selectionMode ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={selectionMode ? "#fff" : "#5ca990"} />
                    <Text style={[styles.selectionButtonText, selectionMode && styles.selectionButtonTextActive]}>
                      {selectionMode ? `Selected: ${selectedItems.size}` : 'Delete Goals'}
                    </Text>
                  </Pressable>
                  
                  {selectionMode && selectedItems.size > 0 && (
                    <Pressable 
                      style={styles.deleteSelectedButton}
                      onPress={deleteSelectedItems}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.deleteSelectedButtonText}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              )}
              
              {/* My Active Goals Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Goals</Text>
                {activeGoals.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No active goals yet</Text>
                    <Text style={styles.emptySubtext}>Add a new challenge to get started!</Text>
                  </View>
                ) : (
                  activeGoals.map((goal) => {
                    const task = taskCache.get(goal.taskId);
                    if (!task) return null;

                    return (
                      <Pressable
                        key={goal.id}
                        onPress={() => {
                          if (!selectionMode) {
                            // Ativar modo de seleção e selecionar este goal
                            setSelectionMode(true);
                            setSelectedItems(new Set([goal.id]));
                          } else {
                            toggleItemSelection(goal.id);
                          }
                        }}
                        style={selectedItems.has(goal.id) && styles.cardWrapperSelected}
                      >
                        <GoalCard
                          title={task.title}
                          description={task.description}
                          current={goal.current}
                          target={goal.target}
                          unit={task.unit}
                          completed={false}
                          selectionMode={selectionMode}
                          isSelected={selectedItems.has(goal.id)}
                          onPress={() => {
                            if (!selectionMode) {
                              setSelectionMode(true);
                              setSelectedItems(new Set([goal.id]));
                            } else {
                              toggleItemSelection(goal.id);
                            }
                          }}
                        />
                      </Pressable>
                    );
                  })
                )}
              </View>

              {/* My Completed Goals Section */}
              {completedGoals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Completed Goals</Text>
                  {completedGoals.map((goal) => {
                    const task = taskCache.get(goal.taskId);
                    if (!task) return null;

                    return (
                      <GoalCard
                        key={goal.id}
                        title={task.title}
                        description={task.description}
                        current={goal.target}
                        target={goal.target}
                        unit={task.unit}
                        completed={true}
                      />
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            <>
              {/* Group Active Goals Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Group Goals</Text>
                {activeGroupGoals.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No active group goals</Text>
                    <Text style={styles.emptySubtext}>Join a group and start collaborating on goals!</Text>
                  </View>
                ) : (
                  activeGroupGoals.map((goal) => {
                    const task = groupTaskCache.get(goal.taskId);
                    const group = joinedGroups.find(g => g.id === goal.groupId);
                    if (!task || !group) return null;
                    
                    // Obter contribuição do utilizador
                    const userContribution = userId ? (goal.memberProgress[userId] || 0) : 0;

                    return (
                      <View key={goal.id} style={styles.groupGoalWrapper}>
                        <View style={styles.groupGoalHeader}>
                          <Ionicons name="people" size={16} color="#5ca990" />
                          <Text style={styles.groupGoalGroupName}>{group.name}</Text>
                        </View>
                        <GroupGoalCard
                          title={task.title}
                          description={task.description}
                          current={goal.currentProgress}
                          target={goal.target}
                          unit={task.unit}
                          memberCount={group.members.length}
                          completed={false}
                          icon={task.icon}
                          userContribution={userContribution}
                          onPress={() => router.push(`/group-page?id=${group.id}` as any)}
                        />
                      </View>
                    );
                  })
                )}
              </View>

              {/* Group Completed Goals Section */}
              {completedGroupGoals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Completed Group Goals</Text>
                  {completedGroupGoals.map((goal) => {
                    const task = groupTaskCache.get(goal.taskId);
                    const group = joinedGroups.find(g => g.id === goal.groupId);
                    if (!task || !group) return null;
                    
                    // Obter contribuição do utilizador
                    const userContribution = userId ? (goal.memberProgress[userId] || 0) : 0;

                    return (
                      <View key={goal.id} style={styles.groupGoalWrapper}>
                        <View style={styles.groupGoalHeader}>
                          <Ionicons name="people" size={16} color="#5ca990" />
                          <Text style={styles.groupGoalGroupName}>{group.name}</Text>
                        </View>
                        <GroupGoalCard
                          title={task.title}
                          description={task.description}
                          current={goal.currentProgress}
                          target={goal.target}
                          unit={task.unit}
                          memberCount={group.members.length}
                          completed={true}
                          icon={task.icon}
                          userContribution={userContribution}
                          onPress={() => router.push(`/group-page?id=${group.id}` as any)}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </>
      );
    }

    // Tab "new"
    const filteredDisplayedGroups = showAllGroups ? filteredAllGroups : filteredAllGroups.slice(0, 3);
    
    return (
      <>
        {/* Barra de pesquisa */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { outlineStyle: 'none' } as any]}
            placeholder="Search groups..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </Pressable>
          )}
        </View>
        
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
                  image={getGroupImageSource(group.bannerImage)}
                  onJoin={() => handleShowJoinModal(group)}
                  group={group}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Groups</Text>
          {filteredDisplayedGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No groups found' : 'No available groups'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery && 'Try a different search'}
              </Text>
            </View>
          ) : (
            filteredDisplayedGroups.map((group) => (
              <GroupListCard
                key={group.id}
                name={group.name}
                members={group.members.length}
                image={getGroupImageSource(group.bannerImage)}
                onPress={() => handleShowJoinModal(group)}
              />
            ))
          )}

          {!showAllGroups && filteredAllGroups.length > 3 && (
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0e0d' }} edges={['top']}>
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
      </GestureHandlerRootView>
    </SafeAreaView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  goalsSubTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  subTabActive: {
    backgroundColor: '#5ca990',
  },
  subTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#fff',
  },
  groupGoalWrapper: {
    marginBottom: 16,
  },
  groupGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(92, 169, 144, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#5ca990',
  },
  groupGoalGroupName: {
    color: '#5ca990',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  selectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 169, 144, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5ca990',
    gap: 8,
  },
  selectionButtonActive: {
    backgroundColor: '#5ca990',
  },
  selectionButtonText: {
    color: '#5ca990',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionButtonTextActive: {
    color: '#fff',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  deleteSelectedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardWrapperSelected: {
    opacity: 0.7,
  },
});