import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNotification } from '@/contexts/NotificationContext';
import { getGroupById, Group, deleteUserGroup, deleteGroup, saveGroup } from '@/models/groups';
import { getLoggedInUser, removeGroupFromUser, getAllUsers, User } from '@/models/users';
import SegmentedControls from '@/components/groups/segmented-controls';
import { getGroupImageSource } from '@/utils/imageHelper';

export default function GroupDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'chat' | 'goals' | 'stats'>('chat');
  const [menuVisible, setMenuVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [editMaxMembersModalVisible, setEditMaxMembersModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMaxMembers, setNewMaxMembers] = useState('');

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const user = await getLoggedInUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserId(user.id);

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
      const members = allUsers.filter(u => groupData.members.includes(u.id));
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group:', error);
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
      console.error('Error changing image:', error);
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
      showNotification('success', `Successfully left ${groupName}`);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('Error leaving group:', error);
      if (error instanceof Error) {
        showNotification('critical', error.message);
      } else {
        showNotification('critical', 'Failed to leave group. Please try again.');
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!userId || !group) return;

    try {
      const groupName = group.name;
      await deleteGroup(group.id, userId);
      setDeleteModalVisible(false);
      setMenuVisible(false);
      showNotification('success', `Successfully deleted group "${groupName}"`);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error instanceof Error) {
        showNotification('critical', error.message);
      } else {
        showNotification('critical', 'Failed to delete group. Please try again.');
      }
    }
  };

  const handleEditGroupName = async () => {
    if (!group || !newGroupName.trim()) {
      showNotification('critical', 'Please enter a group name');
      return;
    }

    if (newGroupName.trim().length < 3) {
      showNotification('critical', 'Group name must have at least 3 characters');
      return;
    }

    try {
      group.name = newGroupName.trim();
      await saveGroup(group);
      await loadGroupData();
      setEditNameModalVisible(false);
      setMenuVisible(false);
      showNotification('success', `Group name changed to "${newGroupName.trim()}"`);
    } catch (error) {
      console.error('Error updating group name:', error);
      showNotification('critical', 'Failed to update group name. Please try again.');
    }
  };

  const handleEditMaxMembers = async () => {
    if (!group) return;
    const maxMembers = parseInt(newMaxMembers);

    if (isNaN(maxMembers) || maxMembers < 2) {
      showNotification('critical', 'You must have at least 2 members minimum');
      return;
    }

    if (maxMembers < group.members.length) {
      showNotification('critical', `Maximum number must be at least ${group.members.length} (current members)`);
      return;
    }

    try {
      group.maxUsers = maxMembers;
      await saveGroup(group);
      await loadGroupData();
      setEditMaxMembersModalVisible(false);
      setMenuVisible(false);
      showNotification('success', `Maximum members changed to ${maxMembers}`);
    } catch (error) {
      console.error('Error updating max members:', error);
      showNotification('critical', 'Failed to update maximum members. Please try again.');
    }
  };

  const handleKickMember = async (member: User) => {
    if (!group) return;

    try {
      const memberName = member.name;
      group.members = group.members.filter(id => id !== member.id);
      await saveGroup(group);
      await removeGroupFromUser(member.id, group.id);
      
      await loadGroupData();
      setMenuVisible(false);
      showNotification('success', `${memberName} was removed from the group`);
    } catch (error) {
      console.error('Error kicking member:', error);
      showNotification('critical', 'Failed to remove member. Please try again.');
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

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'chat':
        return (
          <View style={styles.chatContainer}>
            <View style={styles.systemMessageContainer}>
              <View style={styles.systemMessage}>
                <Text style={styles.systemMessageText}>Joseph created the group</Text>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>Today</Text>
                </View>
              </View>
            </View>

            <View style={styles.messageContainer}>
              <View style={styles.userIconContainer}>
                <Ionicons name="person-circle-outline" size={32} color="#5ca990" />
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.messageUsername}>Joseph</Text>
                <Text style={styles.messageText}>
                  Hi! I need help before I go on a trip
                </Text>
                <Text style={styles.messageTime}>7:00</Text>
              </View>
            </View>

            <View style={styles.messageContainer}>
              <View style={styles.userIconContainer}>
                <Ionicons name="person-circle-outline" size={32} color="#5ca990" />
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.messageUsername}>someone</Text>
                <Text style={styles.messageText}>
                  Remember this is for other people!
                </Text>
                <Text style={styles.messageTime}>7:05</Text>
              </View>
            </View>

            <View style={[styles.messageContainer, styles.ownMessage]}>
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  Yes private there is for other purposes!
                </Text>
                <Text style={styles.messageTime}>7:06</Text>
              </View>
              <View style={styles.userIconContainer}>
                <Ionicons name="person-circle-outline" size={32} color="#5ca990" />
              </View>
            </View>
          </View>
        );

      case 'goals':
        return (
          <View style={styles.contentSection}>
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color="#5ca990" />
              <Text style={styles.emptyStateText}>Sem objetivos de grupo ainda</Text>
              <Text style={styles.emptyStateSubtext}>
                Os objetivos do grupo aparecerão aqui
              </Text>
            </View>
          </View>
        );

      case 'stats':
        return (
          <View style={styles.contentSection}>
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={64} color="#5ca990" />
              <Text style={styles.emptyStateText}>Sem estatísticas disponíveis</Text>
              <Text style={styles.emptyStateSubtext}>
                As estatísticas do grupo aparecerão aqui
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
                <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Apagar Grupo</Text>
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
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Sair do Grupo</Text>
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
          <TouchableOpacity style={styles.editImageButton} onPress={handleChangeImage}>
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <SegmentedControls
        tabs={[
          { key: 'chat', label: 'Chat' },
          { key: 'goals', label: 'Goals' },
          { key: 'stats', label: 'Stats' },
        ]}
        selectedTab={selectedTab}
        onSelectTab={(tab) => setSelectedTab(tab as 'chat' | 'goals' | 'stats')}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
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
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
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
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Apagar Grupo</Text>
            <Text style={styles.modalMessage}>
              Tem a certeza que deseja apagar permanentemente o grupo "{group.name}"? Esta ação não pode ser desfeita.
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
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
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
                    <Ionicons name="person-circle-outline" size={32} color="#5ca990" />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {member.id === group.createdBy && (
                        <Text style={styles.memberRole}>Criador</Text>
                      )}
                    </View>
                    {isCreator && member.id !== group.createdBy && (
                      <TouchableOpacity
                        style={styles.kickButton}
                        onPress={() => handleKickMember(member)}
                      >
                        <Ionicons name="close-circle" size={24} color="#e63946" />
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
                <Text style={styles.cancelButtonText}>Fechar</Text>
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
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
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
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e0d',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  moreButton: {
    padding: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    zIndex: 1000,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 4,
  },
  menuItemTextDanger: {
    color: '#e63946',
  },
  bannerContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 24,
    right: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContainer: {
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  contentSection: {
    paddingVertical: 16,
  },
  systemMessageContainer: {
    marginBottom: 16,
  },
  systemMessage: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  systemMessageText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 6,
  },
  dayBadge: {
    backgroundColor: '#5ca990',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ownMessage: {
    flexDirection: 'row-reverse',
  },
  userIconContainer: {
    marginHorizontal: 8,
  },
  messageBubble: {
    backgroundColor: '#5ca990',
    borderRadius: 16,
    padding: 12,
    maxWidth: '70%',
  },
  messageUsername: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    color: '#e0e0e0',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#ccc',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#e63946',
  },
  leaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#5ca990',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  membersScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  memberRole: {
    color: '#5ca990',
    fontSize: 12,
    marginTop: 2,
  },
  kickButton: {
    padding: 4,
  },
  modalButtonContainer: {
    width: '100%',
    marginTop: 12,
  },
});