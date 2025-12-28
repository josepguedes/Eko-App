import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BotaoCustom from "@/components/buttons";
import { createGroup } from "@/models/groups";
import { getLoggedInUser, addGroupToUser } from "@/models/users";

export default function CreateGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [maxUsers, setMaxUsers] = useState(50);
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Modals
  const [showMaxUsersModal, setShowMaxUsersModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [tempMaxUsers, setTempMaxUsers] = useState("50");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getLoggedInUser();
      console.log("User carregado:", user);
      if (!user) {
        Alert.alert("Erro", "Deve estar logado para criar um grupo");
        router.back();
        return;
      }
      setUserId(user.id);
    } catch (error) {
      console.error("Erro ao carregar utilizador:", error);
      Alert.alert("Erro", "Erro ao carregar dados do utilizador");
      router.back();
    }
  };

  const handleCreate = async () => {
    console.log("=== CRIAR GRUPO ===");
    console.log("userId:", userId);
    console.log("groupName:", groupName);
    console.log("description:", description);
    console.log("maxUsers:", maxUsers);
    console.log("visibility:", visibility);
    console.log("bannerImage:", bannerImage);

    if (!userId) {
      Alert.alert("Erro", "Utilizador não identificado");
      return;
    }

    if (!groupName.trim()) {
      Alert.alert("Erro", "Por favor, insira o nome do grupo");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Erro", "Por favor, insira uma descrição");
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
        maxUsers,
        visibility
      );
      console.log("Grupo criado:", newGroup);

      console.log("A adicionar grupo ao utilizador...");
      await addGroupToUser(userId, newGroup.id);
      console.log("Grupo adicionado ao utilizador");

      // Navegar imediatamente de volta
      console.log("A voltar para a página de grupos...");
      router.replace('/(tabs)/groups');
      
      // Mostrar mensagem de sucesso
      Alert.alert("Sucesso", "Grupo criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      if (error instanceof Error) {
        console.error("Mensagem de erro:", error.message);
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Erro ao criar grupo. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      "Info",
      "Por agora será usada uma imagem padrão. Funcionalidade de escolha de imagem será implementada em breve."
    );
  };

  const handleMaxUsersConfirm = () => {
    const num = parseInt(tempMaxUsers);
    if (num >= 2) {
      setMaxUsers(num);
      setShowMaxUsersModal(false);
    } else {
      Alert.alert("Erro", "O número mínimo de membros é 2");
    }
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

      <View style={styles.content}>
        {/* Banner Image */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Banner Image</Text>
          <TouchableOpacity
            style={styles.bannerContainer}
            onPress={handleImagePick}
          >
            <View style={styles.bannerPlaceholder}>
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={32} color="#fff" />
              </View>
              <Text style={styles.bannerText}>Imagem padrão será usada</Text>
            </View>
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

        {/* Max Users & Visibility */}
        <View style={styles.row}>
          <View style={styles.halfFormGroup}>
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

          <View style={styles.halfFormGroup}>
            <Text style={styles.label}>Group Visibility</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowVisibilityModal(true)}
            >
              <Text style={styles.selectorText}>{visibility}</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
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
      </View>

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
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Número máximo de membros</Text>
            <Text style={styles.modalSubtitle}>Mínimo 2 membros</Text>
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
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleMaxUsersConfirm}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Visibility Modal */}
      <Modal
        visible={showVisibilityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVisibilityModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowVisibilityModal(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Visibilidade do Grupo</Text>
            <TouchableOpacity
              style={styles.visibilityOption}
              onPress={() => {
                setVisibility("Public");
                setShowVisibilityModal(false);
              }}
            >
              <Text style={styles.visibilityText}>Público</Text>
              {visibility === "Public" && (
                <Ionicons name="checkmark" size={24} color="#5ca990" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.visibilityOption}
              onPress={() => {
                setVisibility("Private");
                setShowVisibilityModal(false);
              }}
            >
              <Text style={styles.visibilityText}>Privado</Text>
              {visibility === "Private" && (
                <Ionicons name="checkmark" size={24} color="#5ca990" />
              )}
            </TouchableOpacity>
          </View>
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
    fontSize: 12,
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
  visibilityOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  visibilityText: {
    color: "#fff",
    fontSize: 16,
  },
});