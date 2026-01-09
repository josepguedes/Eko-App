import React, { useState, useEffect } from "react";
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BotaoCustom from "@/components/buttons";
import { useNotification } from "@/contexts/NotificationContext";
import { createGroup } from "@/models/groups";
import { getLoggedInUser, addGroupToUser } from "@/models/users";

export default function CreateGroup() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [maxUsers, setMaxUsers] = useState(50);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Modals
  const [showMaxUsersModal, setShowMaxUsersModal] = useState(false);
  const [tempMaxUsers, setTempMaxUsers] = useState("50");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getLoggedInUser();
      console.log("User carregado:", user);
      if (!user) {
        Alert.alert("Error", "You must be logged in to create a group");
        router.back();
        return;
      }
      setUserId(user.id);
    } catch (error) {
      console.error("Erro ao carregar utilizador:", error);
      Alert.alert("Error", "Failed to load user data");
      router.back();
    }
  };

  const handleCreate = async () => {
    console.log("=== CRIAR GRUPO ===");
    console.log("userId:", userId);
    console.log("groupName:", groupName);
    console.log("description:", description);
    console.log("maxUsers:", maxUsers);
    console.log("bannerImage:", bannerImage);

    if (!userId) {
      Alert.alert("Error", "User not identified");
      return;
    }

    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter the group name");
      return;
    }

    if (groupName.trim().length < 3) {
      Alert.alert("Error", "Group name must have at least 3 characters");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (maxUsers < 2) {
      Alert.alert("Error", "You must have at least 2 members minimum");
      return;
    }
    
    if (maxUsers > 50) {
      Alert.alert("Error", "Maximum limit is 50 members");
      return;
    }

    setLoading(true);
    try {
      console.log("A criar grupo...");
      const newGroup = await createGroup(
        groupName,
        description,
        userId,
        bannerImage,
        maxUsers
      );
      console.log("Grupo criado:", newGroup);

      console.log("A adicionar grupo ao utilizador...");
      await addGroupToUser(userId, newGroup.id);
      console.log("Grupo adicionado ao utilizador");

      // Show success notification
      showNotification('success', `Group "${newGroup.name}" created successfully!`);
      
      // Navegar para a página do grupo criado após a notificação
      console.log("A ir para a página do grupo...");
      setTimeout(() => {
        router.replace(`/group-page?id=${newGroup.id}`);
      }, 1500);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      if (error instanceof Error) {
        console.error("Mensagem de erro:", error.message);
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to create group. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Solicitar permissões
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to the photo gallery to select an image.'
        );
        return;
      }

      // Abrir o seletor de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true, // Obter base64 da imagem
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Converter para base64 data URI para persistir após refresh
        const asset = result.assets[0];
        let imageUri = asset.uri;
        
        // Se temos base64, usar esse formato (melhor para web)
        if (asset.base64) {
          imageUri = `data:image/jpeg;base64,${asset.base64}`;
        }
        
        console.log('Imagem selecionada:', imageUri.substring(0, 50) + '...');
        setBannerImage(imageUri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Error', 'Could not select the image. Please try again.');
    }
  };

  const handleMaxUsersConfirm = () => {
    const num = parseInt(tempMaxUsers);
    if (isNaN(num) || num < 2) {
      Alert.alert("Error", "You must have at least 2 members minimum");
      return;
    }
    if (num > 1000) {
      Alert.alert("Error", "Maximum number of members cannot exceed 1000");
      return;
    }
    setMaxUsers(num);
    setShowMaxUsersModal(false);
  };

  if (!userId) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#5ca990" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Banner Image</Text>
          {bannerImage && (
            <Text style={{ color: '#5ca990', fontSize: 12, marginBottom: 5 }}>
              ✓ Imagem selecionada
            </Text>
          )}
          <TouchableOpacity
            style={styles.bannerContainer}
            onPress={handleImagePick}
          >
            {bannerImage ? (
              <View style={styles.bannerPreviewContainer}>
                <Image 
                  source={{ uri: bannerImage }} 
                  style={styles.bannerPreview}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Erro ao carregar imagem:', error);
                    Alert.alert('Erro', 'Não foi possível carregar a imagem.');
                    setBannerImage(null);
                  }}
                />
                <View style={styles.bannerOverlay}>
                  <Ionicons name="images" size={24} color="#fff" />
                  <Text style={styles.bannerOverlayText}>Tocar para alterar</Text>
                </View>
              </View>
            ) : (
              <View style={styles.bannerPlaceholder}>
                <View style={styles.addIconContainer}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
                <Text style={styles.bannerText}>Adicionar imagem do banner</Text>
                <Text style={styles.bannerSubtext}>Recomendado: 16:9</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Group Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Insert your group name"
            placeholderTextColor="#666"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Insert a description"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Max Users */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Max Users</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              setTempMaxUsers(maxUsers.toString());
              setShowMaxUsersModal(true);
            }}
          >
            <Text style={styles.selectorText}>{maxUsers} users</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <BotaoCustom
            titulo={loading ? "A criar..." : "Create"}
            onPress={handleCreate}
            variante="primario"
            style={styles.createButton}
          />
        </View>
      </ScrollView>

      {/* Max Users Modal */}
      <Modal
        visible={showMaxUsersModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMaxUsersModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMaxUsersModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Maximum Number of Members</Text>
            <Text style={styles.modalSubtitle}>Minimum 2 members</Text>
            <TextInput
              style={styles.modalInput}
              value={tempMaxUsers}
              onChangeText={setTempMaxUsers}
              keyboardType="number-pad"
              placeholder="50"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowMaxUsersModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleMaxUsersConfirm}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
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
    backgroundColor: "#0a0e0d",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  bannerContainer: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
    overflow: "hidden",
  },
  bannerPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    gap: 8,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  addIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#5ca990",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  bannerSubtext: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  bannerPreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  halfFormGroup: {
    flex: 1,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  selectorText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  createButton: {
    width: 200,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
  },
  modalButtonConfirm: {
    backgroundColor: "#5ca990",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});