import React, { useState, useEffect, useRef, useMemo } from "react";
import {View,Text,StyleSheet,Image,TouchableOpacity,ScrollView,ActivityIndicator,Modal,Pressable,TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNotification } from "@/contexts/NotificationContext";
import {getGroupById,Group,deleteUserGroup,deleteGroup,saveGroup,} from "@/models/groups";
import {getLoggedInUser,removeGroupFromUser,getAllUsers,User,} from "@/models/users";
import SegmentedControls from "@/components/groups/segmented-controls";
import { getGroupImageSource } from "@/utils/imageHelper";
import CustomTabBar from "@/components/custom-tab-bar";
import {getGroupGoals,createGroupGoal,updateGroupGoalProgress,deleteGroupGoal,GroupGoal,getGroupStatistics,} from "@/models/groupGoals";
import {getGroupMessages, sendMessage,Message,deleteGroupMessages,} from "@/models/messages";
import { PREDEFINED_TASKS, getTaskById } from "@/models/goals";
import GroupGoalCard from "@/components/groups/group-goal-card";
import GroupChatTab from "@/components/groups/GroupChatTab";
import GroupGoalsTab from "@/components/groups/GroupGoalsTab";
import GroupStatsTab from "@/components/groups/GroupStatsTab";

export default function GroupDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"chat" | "goals" | "stats">("chat");
  const [menuVisible, setMenuVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [editMaxMembersModalVisible, setEditMaxMembersModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMaxMembers, setNewMaxMembers] = useState("");
  const [memberToKick, setMemberToKick] = useState<User | null>(null);
  const [kickMemberModalVisible, setKickMemberModalVisible] = useState(false);

  // Goals states
  const [groupGoals, setGroupGoals] = useState<GroupGoal[]>([]);
  const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [userName, setUserName] = useState("");

  // Stats states
  const [statistics, setStatistics] = useState({
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    averageProgress: 0,
    totalContributions: 0,
  });

  useEffect(() => {
    loadGroupData();

    // Polling para atualizar mensagens em tempo real
    const interval = setInterval(async () => {
      if (selectedTab === "chat") {
        const msgs = await getGroupMessages(groupId);
        setMessages(msgs);
      }
    }, 2000); // Atualiza a cada 2 segundos

    return () => clearInterval(interval);
  }, [groupId, selectedTab]);

  // Scroll para o final quando as mensagens mudarem
  useEffect(() => {
    if (messages.length > 0 && selectedTab === "chat") {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages, selectedTab]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const user = await getLoggedInUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      setUserName(user.name);

      const groupData = await getGroupById(groupId);
      if (!groupData) {
        router.back();
        return;
      }
      setGroup(groupData);
      setNewGroupName(groupData.name);
      setNewMaxMembers(groupData.maxUsers.toString());

      // Carregar membros do grupo
      const allUsers = await getAllUsers();
      const members = allUsers.filter((u) => groupData.members.includes(u.id));
      setGroupMembers(members);

      // Carregar group goals
      const goals = await getGroupGoals(groupId);
      setGroupGoals(goals);

      // Carregar estatísticas
      const stats = await getGroupStatistics(groupId);
      setStatistics(stats);

      // Carregar mensagens
      const msgs = await getGroupMessages(groupId);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0] && group) {
        const asset = result.assets[0];
        let imageUri = asset.uri;

        if (asset.base64) {
          imageUri = `data:image/jpeg;base64,${asset.base64}`;
        }

        group.bannerImage = imageUri;
        await saveGroup(group);
        await loadGroupData();
        setMenuVisible(false);
      }
    } catch (error) {
      console.error("Error changing image:", error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!userId || !group) return;

    try {
      const groupName = group.name;
      await deleteUserGroup(group.id, userId);
      await removeGroupFromUser(userId, group.id);
      setLeaveModalVisible(false);
      setMenuVisible(false);
      showNotification("success", `Successfully left ${groupName}`);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error leaving group:", error);
      if (error instanceof Error) {
        showNotification("critical", error.message);
      } else {
        showNotification(
          "critical",
          "Failed to leave group. Please try again."
        );
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!userId || !group) return;

    try {
      const groupName = group.name;
      await deleteGroup(group.id, userId);
      await deleteGroupMessages(group.id); // Deletar mensagens do grupo
      setDeleteModalVisible(false);
      setMenuVisible(false);
      showNotification("success", `Successfully deleted group "${groupName}"`);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error deleting group:", error);
      if (error instanceof Error) {
        showNotification("critical", error.message);
      } else {
        showNotification(
          "critical",
          "Failed to delete group. Please try again."
        );
      }
    }
  };

  const handleEditGroupName = async () => {
    if (!group || !newGroupName.trim()) {
      showNotification("critical", "Please enter a group name");
      return;
    }

    if (newGroupName.trim().length < 3) {
      showNotification(
        "critical",
        "Group name must have at least 3 characters"
      );
      return;
    }

    try {
      const oldName = group.name;
      group.name = newGroupName.trim();
      await saveGroup(group);
      await loadGroupData();
      setEditNameModalVisible(false);
      setMenuVisible(false);
      showNotification(
        "success",
        `Group renamed from "${oldName}" to "${newGroupName.trim()}"`
      );
    } catch (error) {
      console.error("Error updating group name:", error);
      showNotification(
        "critical",
        "Failed to update group name. Please try again."
      );
    }
  };

  const handleEditMaxMembers = async () => {
    if (!group) return;
    const maxMembers = parseInt(newMaxMembers);

    if (isNaN(maxMembers) || maxMembers < 2) {
      showNotification("critical", "You must have at least 2 members minimum");
      return;
    }

    if (maxMembers > 50) {
      showNotification("critical", "Maximum limit is 50 members");
      return;
    }

    if (maxMembers < group.members.length) {
      showNotification(
        "critical",
        `Maximum number must be at least ${group.members.length} (current members)`
      );
      return;
    }

    try {
      const oldMax = group.maxUsers;
      group.maxUsers = maxMembers;
      await saveGroup(group);
      await loadGroupData();
      setEditMaxMembersModalVisible(false);
      setMenuVisible(false);
      showNotification(
        "success",
        `Max members changed from ${oldMax} to ${maxMembers}`
      );
    } catch (error) {
      console.error("Error updating max members:", error);
      showNotification(
        "critical",
        "Failed to update maximum members. Please try again."
      );
    }
  };

  const handleKickMember = async () => {
    if (!group || !memberToKick) return;

    try {
      const memberName = memberToKick.name;
      group.members = group.members.filter((id) => id !== memberToKick.id);
      await saveGroup(group);
      await removeGroupFromUser(memberToKick.id, group.id);

      await loadGroupData();
      setKickMemberModalVisible(false);
      setMemberToKick(null);
      showNotification("success", `${memberName} was removed from the group`);
    } catch (error) {
      console.error("Error kicking member:", error);
      showNotification(
        "critical",
        "Failed to remove member. Please try again."
      );
    }
  };

  // Group Goals functions
  const handleCreateGroupGoal = async () => {
    if (!selectedTaskId || !goalTarget || !userId) {
      showNotification("critical", "Please select a task and set a target");
      return;
    }

    // Verificar se já existe um goal com o mesmo taskId
    const existingGoal = groupGoals.find(
      (goal) => goal.taskId === selectedTaskId
    );
    if (existingGoal) {
      const task = getTaskById(selectedTaskId);
      showNotification(
        "critical",
        `This group already has a goal for "${task?.title}"`
      );
      return;
    }

    const target = parseFloat(goalTarget);
    if (isNaN(target) || target <= 0) {
      showNotification("critical", "Please enter a valid target value");
      return;
    }

    try {
      const task = getTaskById(selectedTaskId);
      await createGroupGoal(groupId, selectedTaskId, target, userId);
      await loadGroupData();
      setAddGoalModalVisible(false);
      setSelectedTaskId("");
      setGoalTarget("");
      showNotification(
        "success",
        `New group goal created: ${task?.title || "Goal"}!`
      );
    } catch (error) {
      console.error("Error creating group goal:", error);
      showNotification("critical", "Failed to create group goal");
    }
  };

  const handleDeleteGroupGoal = async (goalId: string) => {
    try {
      const goal = groupGoals.find((g) => g.id === goalId);
      const task = goal ? getTaskById(goal.taskId) : null;
      await deleteGroupGoal(goalId);
      await loadGroupData();
      showNotification(
        "success",
        `Group goal "${task?.title || "Goal"}" deleted successfully`
      );
    } catch (error) {
      console.error("Error deleting group goal:", error);
      showNotification("critical", "Failed to delete group goal");
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId || !userName) return;

    try {
      await sendMessage(groupId, userId, userName, messageText);
      setMessageText("");
      const msgs = await getGroupMessages(groupId);
      setMessages(msgs);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("critical", "Failed to send message");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5ca990" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const isCreator = group.createdBy === userId;

  const renderTabContent = useMemo(() => {
    switch (selectedTab) {
      case "chat":
        return (
          <GroupChatTab
            messages={messages}
            userId={userId}
            messageText={messageText}
            setMessageText={setMessageText}
            onSendMessage={handleSendMessage}
          />
        );

      case "goals":
        return (
          <GroupGoalsTab
            groupGoals={groupGoals}
            isCreator={isCreator}
            userId={userId}
            group={group}
            onCreateGoal={() => setAddGoalModalVisible(true)}
            onDeleteGoal={handleDeleteGroupGoal}
          />
        );

      case "stats":
        return (
          <GroupStatsTab
            group={group}
            statistics={statistics}
            groupMembers={groupMembers}
          />
        );

      default:
        return null;
    }
  }, [selectedTab, messages, userId, messageText, groupGoals, isCreator, group, statistics, groupMembers]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(!menuVisible)}
          style={styles.moreButton}
        >
          <Ionicons name="ellipsis-vertical" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {menuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              setMembersModalVisible(true);
            }}
          >
            <Ionicons name="people-outline" size={20} color="#fff" />
            <Text style={styles.menuItemText}>Ver Membros</Text>
          </TouchableOpacity>

          {isCreator && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setEditNameModalVisible(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.menuItemText}>Alterar Nome</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setEditMaxMembersModalVisible(true);
                }}
              >
                <Ionicons name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.menuItemText}>Alterar Max. Membros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDanger]}
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteModalVisible(true);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#e63946" />
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                  Apagar Grupo
                </Text>
              </TouchableOpacity>
            </>
          )}

          {!isCreator && (
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setMenuVisible(false);
                setLeaveModalVisible(true);
              }}
            >
              <Ionicons name="exit-outline" size={20} color="#e63946" />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                Sair do Grupo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Banner with Edit Icon */}
      <View style={styles.bannerContainer}>
        <Image
          source={getGroupImageSource(group.bannerImage)}
          style={styles.bannerImage}
        />
        {isCreator && (
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleChangeImage}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <SegmentedControls
        tabs={[
          { key: "chat", label: "Chat" },
          { key: "goals", label: "Goals" },
          { key: "stats", label: "Stats" },
        ]}
        selectedTab={selectedTab}
        onSelectTab={(tab) => setSelectedTab(tab as "chat" | "goals" | "stats")}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent}
      </ScrollView>

      {/* Modal - Leave Group */}
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
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Sair do Grupo</Text>
            <Text style={styles.modalMessage}>
              Tem a certeza que deseja sair do grupo "{group.name}"?
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
                onPress={handleLeaveGroup}
              >
                <Text style={styles.leaveButtonText}>Sair</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal - Delete Group */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Apagar Grupo</Text>
            <Text style={styles.modalMessage}>
              Tem a certeza que deseja apagar permanentemente o grupo "
              {group.name}"? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.leaveButton]}
                onPress={handleDeleteGroup}
              >
                <Text style={styles.leaveButtonText}>Apagar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal - View Members */}
      <Modal
        visible={membersModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMembersModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMembersModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Membros do Grupo</Text>
            <ScrollView style={styles.membersScroll}>
              {groupMembers
                .sort((a, b) => {
                  if (a.id === group.createdBy) return -1;
                  if (b.id === group.createdBy) return 1;
                  return 0;
                })
                .map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <Ionicons
                      name="person-circle-outline"
                      size={32}
                      color="#5ca990"
                    />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {member.id === group.createdBy && (
                        <Text style={styles.memberRole}>Criador</Text>
                      )}
                    </View>
                    {isCreator && member.id !== group.createdBy && (
                      <TouchableOpacity
                        style={styles.kickButton}
                        onPress={() => {
                          setMemberToKick(member);
                          setKickMemberModalVisible(true);
                        }}
                      >
                        <Text style={styles.kickButtonText}>Remover</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </ScrollView>
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setMembersModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal - Edit Group Name */}
      <Modal
        visible={editNameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditNameModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Alterar Nome do Grupo</Text>
            <TextInput
              style={styles.input}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Nome do grupo"
              placeholderTextColor="#999"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditNameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEditGroupName}
              >
                <Text style={styles.confirmButtonText}>Guardar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal - Edit Max Members */}
      <Modal
        visible={editMaxMembersModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditMaxMembersModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditMaxMembersModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Alterar Máximo de Membros</Text>
            <TextInput
              style={styles.input}
              value={newMaxMembers}
              onChangeText={setNewMaxMembers}
              placeholder="Número máximo"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditMaxMembersModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEditMaxMembers}
              >
                <Text style={styles.confirmButtonText}>Guardar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal - Kick Member Confirmation */}
      <Modal
        visible={kickMemberModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setKickMemberModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setKickMemberModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Remover Membro</Text>
            <Text style={styles.modalMessage}>
              Tem a certeza que deseja remover {memberToKick?.name} do grupo?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setKickMemberModalVisible(false);
                  setMemberToKick(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.leaveButton]}
                onPress={handleKickMember}
              >
                <Text style={styles.leaveButtonText}>Remover</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal - Add Group Goal */}
      <Modal
        visible={addGoalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddGoalModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAddGoalModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Create Group Goal</Text>

            <Text style={styles.inputLabel}>Select Task:</Text>
            <ScrollView
              style={styles.taskList}
              showsVerticalScrollIndicator={false}
            >
              {PREDEFINED_TASKS.map((task) => {
                const alreadyExists = groupGoals.some(
                  (goal) => goal.taskId === task.id
                );
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskItem,
                      selectedTaskId === task.id && styles.taskItemSelected,
                      alreadyExists && styles.taskItemDisabled,
                    ]}
                    onPress={() => {
                      if (!alreadyExists) {
                        setSelectedTaskId(task.id);
                        setGoalTarget(task.defaultTarget.toString());
                      }
                    }}
                    disabled={alreadyExists}
                  >
                    <View style={styles.taskItemContent}>
                      <Ionicons
                        name={task.icon as any}
                        size={24}
                        color={alreadyExists ? "#666" : "#5ca990"}
                      />
                      <View style={styles.taskItemText}>
                        <Text
                          style={[
                            styles.taskItemTitle,
                            alreadyExists && styles.taskItemTitleDisabled,
                          ]}
                        >
                          {task.title}
                        </Text>
                        <Text
                          style={[
                            styles.taskItemDesc,
                            alreadyExists && styles.taskItemDescDisabled,
                          ]}
                        >
                          {alreadyExists ? "Already in use" : task.description}
                        </Text>
                      </View>
                    </View>
                    {selectedTaskId === task.id && !alreadyExists && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#5ca990"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedTaskId && (
              <>
                <Text style={styles.inputLabel}>Target:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  placeholder="Enter target value"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAddGoalModalVisible(false);
                  setSelectedTaskId("");
                  setGoalTarget("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateGroupGoal}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Tab Bar */}
      <CustomTabBar
        activeTab="groups"
        onTabPress={(tab) => {
          if (tab !== "groups") {
            const route = tab === "index" ? "/(tabs)" : `/(tabs)/${tab}`;
            router.push(route as any);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e0d",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e0d",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  moreButton: {
    padding: 8,
  },
  menuDropdown: {
    position: "absolute",
    top: 120,
    right: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    zIndex: 100,
    elevation: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    marginTop: 4,
  },
  menuItemTextDanger: {
    color: "#e63946",
  },
  bannerContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fff",
  },
  editImageButton: {
    position: "absolute",
    bottom: 24,
    right: 28,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  leaveButton: {
    backgroundColor: "#e63946",
  },
  leaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#5ca990",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  membersScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  memberRole: {
    color: "#5ca990",
    fontSize: 12,
    marginTop: 2,
  },
  kickButton: {
    backgroundColor: "#e63946",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  kickButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  modalButtonContainer: {
    width: "100%",
    marginTop: 12,
  },
  taskList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  taskItemSelected: {
    borderColor: "#5ca990",
    backgroundColor: "rgba(92, 169, 144, 0.1)",
  },
  taskItemDisabled: {
    opacity: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  taskItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  taskItemText: {
    flex: 1,
  },
  taskItemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  taskItemTitleDisabled: {
    color: "#666",
  },
  taskItemDesc: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  taskItemDescDisabled: {
    color: "#555",
  },
  inputLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
});
