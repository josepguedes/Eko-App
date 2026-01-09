import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'informative' | 'success' | 'critical';

interface NotificationState {
  visible: boolean;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  hideNotification: () => void;
  notification: NotificationState;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<NotificationState>({
    visible: false,
    type: 'success',
    message: '',
  });

  const [timeoutId, setTimeoutId] = useState<any>(null);

  const showNotification = (type: NotificationType, message: string, duration: number = 5000) => {
    // Validar mensagem
    if (!message || message.trim() === '') {
      console.warn('Attempted to show notification with empty message');
      return;
    }
    
    // Limpar timeout anterior se existir
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setNotification({ visible: true, type, message });

    // Auto-hide após o duration
    const newTimeoutId = setTimeout(() => {
      setNotification({ visible: false, type: 'success', message: '' });
    }, duration);

    setTimeoutId(newTimeoutId);
  };

  const hideNotification = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setNotification({ visible: false, type: 'success', message: '' });
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, notification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
