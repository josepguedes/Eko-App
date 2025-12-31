import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNotification } from '@/contexts/NotificationContext';
import Notification from './notification';

export default function GlobalNotification() {
  const { notification, hideNotification } = useNotification();

  if (!notification.visible) {
    return null;
  }

  return (
    <View style={styles.container}>
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
    top: 60,
    right: 16,
    maxWidth: 350,
    zIndex: 9999,
  },
});
