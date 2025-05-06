import { API_BASE_URL, getAuthHeaders } from './config';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at?: string;
  updated_at?: string;
  messages?: Message[];
}

export const chatsApi = {
  // Get all chats for the authenticated user (JWT required)
  getByUserId: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/chats/user`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  },

  // Get a single chat with messages
  getById: async (chatId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch chat');
    return response.json();
  },

  // Create a new chat
  create: async (chat: Omit<Chat, 'id' | 'created_at' | 'updated_at' | 'messages'>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chats/start`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(chat),
    });
    if (!response.ok) throw new Error('Failed to create chat');
    return response.json();
  },

  // Send a message in a chat
  sendMessage: async (message: Omit<Message, 'id' | 'created_at'>, chatId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  // Get messages for a chat
  getMessages: async (chatId: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  // Delete a chat by id
  deleteChatById: async (chatId: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete chat');
    return response.json();
  },
}; 