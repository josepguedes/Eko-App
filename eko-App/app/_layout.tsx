import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotificationProvider } from '@/contexts/NotificationContext';
import GlobalNotification from '@/components/global-notification';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NotificationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="create-group" options={{ headerShown: false }} />
          <Stack.Screen name="add-goal" options={{ headerShown: false }} />
          <Stack.Screen name="group-details" options={{ headerShown: false }} />
          <Stack.Screen name="group-page" options={{ headerShown: false }} />
          <Stack.Screen name="create-goals" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: false }} />
          <Stack.Screen name="support" options={{ headerShown: false }} />
        </Stack>
        <GlobalNotification />
        <StatusBar style="auto" />
      </ThemeProvider>
    </NotificationProvider>
  );
}
