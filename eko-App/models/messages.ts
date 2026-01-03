import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

const MESSAGES_KEY = 'group_messages';

// Get all messages
export async function getAllMessages(): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_KEY);
    if (!data) return [];
    
    const messages = JSON.parse(data);
    return messages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}

// Get messages for a specific group
export async function getGroupMessages(groupId: string): Promise<Message[]> {
  const allMessages = await getAllMessages();
  return allMessages
    .filter(msg => msg.groupId === groupId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// Send a new message
export async function sendMessage(
  groupId: string,
  userId: string,
  userName: string,
  text: string
): Promise<Message> {
  const allMessages = await getAllMessages();
  
  const newMessage: Message = {
    id: Date.now().toString(),
    groupId,
    userId,
    userName,
    text: text.trim(),
    timestamp: new Date(),
  };
  
  allMessages.push(newMessage);
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
  
  return newMessage;
}

// Delete all messages for a group (when group is deleted)
export async function deleteGroupMessages(groupId: string): Promise<void> {
  const allMessages = await getAllMessages();
  const filteredMessages = allMessages.filter(m => m.groupId !== groupId);
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
}

// Delete a specific message
export async function deleteMessage(messageId: string): Promise<void> {
  const allMessages = await getAllMessages();
  const filteredMessages = allMessages.filter(m => m.id !== messageId);
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
}
