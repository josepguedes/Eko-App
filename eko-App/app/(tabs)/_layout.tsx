import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Image, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { getLoggedInUser } from '@/models/users';
import { initializeDefaultUsers } from '@/models/users';


function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  initializeDefaultUsers();
  return (
    <View style={styles.bottomNavbar}>
      <BlurView intensity={100} tint="dark" style={styles.blurview}>
        <View style={styles.view} />
      </BlurView>
      <View style={[styles.view2, styles.view2FlexBox]}>
        <View style={[styles.bottomNavbar2, styles.view2FlexBox]}>
          <View style={styles.frameParent}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel ?? options.title ?? route.name;
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              // Mapear nomes para títulos corretos
              const titles: Record<string, string> = {
                index: 'Home',
                groups: 'Groups',
                record: 'Record',
                stats: 'Stats',
                profile: 'Profile',
              };

              // Mapear ícones PNG para cada rota
              const iconImages: Record<string, any> = {
                index: require('@/assets/images/Home.png'),
                groups: require('@/assets/images/groups.png'),
                record: require('@/assets/images/Record.png'),
                stats: require('@/assets/images/Stats.png'),
                profile: require('@/assets/images/User.png'),
              };

              return (
                <Pressable
                  key={route.key}
                  style={[
                    styles.parentFlexBox,
                    isFocused && styles.communityParent,
                  ]}
                  onPress={onPress}>
                  <View style={styles.homeLayout}>
                    <Image
                      source={iconImages[route.name]}
                      style={[
                        styles.tabIcon,
                        { tintColor: isFocused ? '#5ca990' : '#f5f5f5' }
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.time3,
                      isFocused && styles.time2,
                    ]}>
                    {titles[route.name]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      
      const user = await getLoggedInUser();
      if (!user) {
        // Nenhum utilizador logado, redirecionar para login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#51c284" />
        <Text style={{ color: '#f5f5f5', marginTop: 10 }}>A verificar autenticação...</Text>
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="groups" />
      <Tabs.Screen name="record" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="create-goals" />
      <Tabs.Screen name="create-group" />
      <Tabs.Screen name="group-page" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNavbar: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 88 : 72,
    marginBottom: Platform.OS === 'android' ? 8 : 0,
  },
  view2FlexBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  parentFlexBox: {
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  homeLayout: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurview: {
    opacity: 0.7,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  view: {
    backgroundColor: '#1a1a1a',
    height: '100%',
    width: '100%',
  },
  view2: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    width: '100%',
    flex: 1,
  },
  bottomNavbar2: {
    width: '100%',
    maxWidth: 360,
  },
  frameParent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0,
    alignItems: 'center',
    width: '100%',
  },
  time: {
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    color: '#f5f5f5',
  },
  communityParent: {
    borderStyle: 'solid',
    borderColor: '#5ca990',
    borderBottomWidth: 1.5,
  },
  time2: {
    color: '#5ca990',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
  },
  time3: {
    color: '#f5f5f5',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});
