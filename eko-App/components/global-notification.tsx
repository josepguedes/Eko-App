import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '@/contexts/NotificationContext';
import Notification from './notification';

export default function GlobalNotification() {
  const { notification, hideNotification } = useNotification();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (notification.visible) {
      console.log('GlobalNotification: showing notification', {
        type: notification.type,
        message: notification.message,
        visible: notification.visible
      });
    }
  }, [notification]);

  if (!notification.visible) {
    return null;
  }

  return (
    <View 
      style={[
        styles.container, 
        { top: Math.max(insets.top + 10, 60) }
      ]} 
      pointerEvents="box-none"
    >
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={hideNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999999,
    elevation: 9999999,
    alignItems: 'center',
  },
});
