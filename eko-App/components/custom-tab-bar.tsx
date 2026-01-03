import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, usePathname } from 'expo-router';

interface CustomTabBarProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export default function CustomTabBar({ activeTab, onTabPress }: CustomTabBarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();

  const routes = [
    { name: 'index', path: '/', title: 'Home', icon: require('@/assets/images/Home.png') },
    { name: 'groups', path: '/groups', title: 'Groups', icon: require('@/assets/images/groups.png') },
    { name: 'record', path: '/record', title: 'Record', icon: require('@/assets/images/Record.png') },
    { name: 'stats', path: '/stats', title: 'Stats', icon: require('@/assets/images/Stats.png') },
    { name: 'profile', path: '/profile', title: 'Profile', icon: require('@/assets/images/User.png') },
  ];

  return (
    <View style={styles.bottomNavbar}>
      <BlurView intensity={100} tint="dark" style={styles.blurview}>
        <View style={styles.view} />
      </BlurView>
      <View style={[styles.view2, styles.view2FlexBox]}>
        <View style={[styles.bottomNavbar2, styles.view2FlexBox]}>
          <View style={styles.frameParent}>
            {routes.map((route) => {
              const isFocused = activeTab ? activeTab === route.name : (pathname === route.path || pathname.startsWith(`/${route.name}`));

              const onPress = () => {
                if (onTabPress) {
                  onTabPress(route.name);
                } else {
                  router.push(route.path as any);
                }
              };

              return (
                <Pressable
                  key={route.name}
                  style={[
                    styles.parentFlexBox,
                    isFocused && styles.communityParent,
                  ]}
                  onPress={onPress}>
                  <View style={styles.homeLayout}>
                    <Image
                      source={route.icon}
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
                    {route.title}
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

const styles = StyleSheet.create({
  bottomNavbar: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    height: Platform.OS === 'ios' ? 88 : 72,
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
