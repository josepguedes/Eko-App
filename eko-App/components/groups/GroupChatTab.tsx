import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '@/models/messages';

interface GroupChatTabProps {
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: () => void;
  userId: string | null;
}

export default function GroupChatTab({
  messages,
  messageText,
  setMessageText,
  onSendMessage,
  userId,
}: GroupChatTabProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.chatWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={64} color="#5ca990" />
            <Text style={styles.emptyChatText}>No messages yet</Text>
            <Text style={styles.emptyChatSubtext}>Be the first to send a message!</Text>
          </View>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === userId;
            const time = new Date(message.timestamp).toLocaleTimeString('pt-PT', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            return (
              <View 
                key={message.id} 
                style={[styles.messageContainer, isOwn && styles.ownMessage]}
              >
                {!isOwn && (
                  <View style={styles.userIconContainer}>
                    <Ionicons name="person-circle-outline" size={32} color="#5ca990" />
                  </View>
                )}
                <View style={[styles.messageBubble, isOwn && styles.ownMessageBubble]}>
                  {!isOwn && <Text style={styles.messageUsername}>{message.userName}</Text>}
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.messageTime}>{time}</Text>
                </View>
                {isOwn && (
                  <View style={styles.userIconContainer}>
                    <Ionicons name="person-circle-outline" size={32} color="#5ca990" />
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
      
      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={onSendMessage}
          disabled={!messageText.trim()}
        >
          <Ionicons name="send" size={20} color={messageText.trim() ? "#fff" : "#666"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatWrapper: {
    flex: 1,
    position: 'relative',
  },
  chatContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyChatSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ownMessage: {
    flexDirection: 'row-reverse',
  },
  userIconContainer: {
    marginHorizontal: 8,
  },
  messageBubble: {
    backgroundColor: '#5ca990',
    borderRadius: 16,
    padding: 12,
    maxWidth: '70%',
  },
  ownMessageBubble: {
    backgroundColor: '#3d8f7d',
  },
  messageUsername: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    color: '#e0e0e0',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  messageInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0a0e0d',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5ca990',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(92, 169, 144, 0.3)',
  },
});
