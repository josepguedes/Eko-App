import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getLoggedInUser, logoutUser, User } from '@/models/users';
import BotaoCustom from '@/components/buttons';
import { useRouter } from 'expo-router';

export default function Main() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const loggedUser = await getLoggedInUser();
      setUser(loggedUser);
    } catch (error) {
      console.error('Erro ao carregar utilizador:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await logoutUser(user.id);
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#51c284" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nenhum utilizador logado</Text>
        <BotaoCustom
          titulo="Ir para Login"
          navegarPara="/login"
          variante="primario"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.greeting}>Olá {user.name}!</Text>
        <Text style={styles.loginInfo}>
          Está logado com a conta:
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.userId}>ID do utilizador: {user.id}</Text>
      </View>

      <BotaoCustom
        titulo="Terminar Sessão"
        onPress={handleLogout}
        variante="secundario"
        style={styles.logoutButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  loginInfo: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: '#666',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#51c284',
    marginBottom: 12,
  },
  userId: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#999',
  },
  logoutButton: {
    width: '100%',
    maxWidth: 300,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    marginBottom: 20,
  },
});