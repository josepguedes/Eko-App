// Edit profile screen allowing users to update their information

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AvatarPicker from '@/components/profile/avatar-picker';
import InputField from '@/components/profile/input-field';
import BotaoCustom from '@/components/buttons';
import { getLoggedInUser, updateUser, User } from '@/models/users';

const MASKED_PASSWORD = '******************';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Track if password was changed
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const loggedUser = await getLoggedInUser();
      if (loggedUser) {
        setUser(loggedUser);
        setName(loggedUser.name);
        setEmail(loggedUser.email);
        setAvatarUrl(loggedUser.avatarUrl);
        setPassword(MASKED_PASSWORD);
        setPhone('');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordChanged(text !== MASKED_PASSWORD && text.length > 0);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (name.trim().length < 3) {
      Alert.alert('Validation Error', 'Name must be at least 3 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email');
      return;
    }

    // Validate password only if it was changed
    if (passwordChanged && password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);

      // Prepare updates object
      const updates: Partial<Pick<User, 'email' | 'name' | 'password' | 'avatarUrl'>> = {
        name: name.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl,
      };

      // Only include password if it was changed
      if (passwordChanged) {
        updates.password = password;
      }

      console.log('Updating user with:', updates);

      // Update user using the service method
      await updateUser(user.id, updates);

      console.log('User updated successfully');

      // Navigate back immediately after successful update
      router.replace('/(tabs)/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to save profile changes');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca990" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load user data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#f5f5f5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <AvatarPicker
            avatarUrl={avatarUrl}
            userName={name}
            onAvatarChange={setAvatarUrl}
          />

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Your Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
            />

            <InputField
              label="Your Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Your Password"
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
            />

            <InputField
              label="Your Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+351976543219"
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <BotaoCustom
              titulo={saving ? 'Saving...' : 'Save'}
              onPress={handleSave}
              variante="primario"
              disabled={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e0d',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 214, 214, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f5f5f5',
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
  },
});