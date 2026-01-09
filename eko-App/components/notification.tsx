import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface NotificationProps {
  type: 'informative' | 'success' | 'critical';
  message: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
  icon?: any;
}

export default function Notification({ 
  type, 
  message, 
  actionText, 
  onAction, 
  onClose,
  icon 
}: NotificationProps) {
  
  // Debug log para verificar se a mensagem está chegando
  React.useEffect(() => {
    console.log('Notification rendered with message:', message);
  }, [message]);
  
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'critical':
        return 'alert-circle';
      case 'informative':
      default:
        return 'information-circle';
    }
  };

  return (
    <View style={styles.view}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon()} size={20} color="#5ca990" />
      </View>
      <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
        {message || 'Notification'}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <View style={styles.base}>
            <Text style={styles.action}>{actionText}</Text>
          </View>
        </TouchableOpacity>
      )}
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.crossButton}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: '#0a0e0d',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 56,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(92, 169, 144, 0.2)',
    borderWidth: 1,
    borderColor: '#5ca990',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  description: {
    textAlign: "left",
    flex: 1,
    color: "#fff",
    lineHeight: 20,
    fontSize: 14,
    fontWeight: '500',
    minHeight: 20,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  button: {
    flexDirection: "row",
  },
  base: {
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: "hidden",
    backgroundColor: '#5ca990',
  },
  action: {
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    lineHeight: 20,
    fontSize: 14,
  },
  crossButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});
