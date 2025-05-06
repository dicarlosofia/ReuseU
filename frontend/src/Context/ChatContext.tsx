import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Chat } from '@/pages/api/chats';

interface ChatContextType {
  currentChat: Chat | null;
  openChat: (chat: Chat) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  currentChat: null,
  openChat: () => {},
  closeChat: () => {}
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  const openChat = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const closeChat = () => {
    setCurrentChat(null);
  };

  return (
    <ChatContext.Provider value={{ currentChat, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
