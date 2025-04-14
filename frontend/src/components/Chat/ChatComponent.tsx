/**
 * Chat Component
 * 
 * This is a floating chat interface component that allows users to:
 * - View their active chats
 * - Open and close individual chat windows
 * - Send and receive messages
 * - See unread message counts
 * - Collapse/expand the chat interface
 * 
 * The component can be initialized with a specific listing to start a new chat.
 * It includes real-time message updates and a simulated response system.
 */

import { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, ChevronDownIcon, UserCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useGlobalContext } from '@/Context/GlobalContext';

// Props for initializing chat with a specific listing
interface ChatComponentProps {
  listingId?: string;
  listingTitle?: string;
}

// Structure for individual messages
interface Message {
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

// Structure for chat conversations
interface Chat {
  id: string;
  title: string;
  participant: {
    name: string;
    avatar?: string;
  };
  messages: Message[];
  isMinimized: boolean;
  unreadCount: number;
  lastMessageTime: string;
}

const ChatComponent = ({ listingId, listingTitle }: ChatComponentProps) => {
  const { user } = useGlobalContext();
  // Initialize with sample chats for demonstration
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Chat about Vintage Chair',
      participant: {
        name: 'John Doe',
      },
      messages: [
        {
          text: 'Hi! Is this chair still available?',
          sender: 'other',
          timestamp: '10:30 AM'
        },
        {
          text: 'Yes, it is! Would you like to arrange a pickup?',
          sender: 'user',
          timestamp: '10:32 AM'
        }
      ],
      isMinimized: true,
      unreadCount: 0,
      lastMessageTime: '10:32 AM'
    },
    {
      id: '2',
      title: 'Chat about Bookshelf',
      participant: {
        name: 'Jane Smith',
      },
      messages: [
        {
          text: 'Hello! I\'m interested in the bookshelf',
          sender: 'other',
          timestamp: 'Yesterday'
        }
      ],
      isMinimized: true,
      unreadCount: 1,
      lastMessageTime: 'Yesterday'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize new chat when listing details are provided
  useEffect(() => {
    if (listingId && listingTitle) {
      setChats(prevChats => {
        if (!prevChats.some(chat => chat.id === listingId)) {
          return [...prevChats, {
            id: listingId,
            title: `Chat about ${listingTitle}`,
            participant: {
              name: 'New User',
            },
            messages: [],
            isMinimized: true,
            unreadCount: 0,
            lastMessageTime: 'Just now'
          }];
        }
        return prevChats;
      });
    }
  }, [listingId, listingTitle]);

  // Handle sending a new message
  const handleSendMessage = (chatId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add user's message
      setChats(chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, { 
              text: newMessage, 
              sender: 'user',
              timestamp 
            }],
            lastMessageTime: timestamp,
            unreadCount: chat.isMinimized ? chat.unreadCount + 1 : 0
          };
        }
        return chat;
      }));
      setNewMessage('');

      // Simulate a response after 1 second
      setTimeout(() => {
        const responseTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChats(chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, { 
                text: 'Thank you for your message! This is a simulated response.', 
                sender: 'other',
                timestamp: responseTimestamp 
              }],
              lastMessageTime: responseTimestamp,
              unreadCount: chat.isMinimized ? chat.unreadCount + 1 : 0
            };
          }
          return chat;
        }));
      }, 1000);
    }
  };

  // Open a specific chat window
  const openChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsMinimized(false);
    setIsCollapsed(false);
    setChats(chats.map(c => ({
      ...c,
      unreadCount: c.id === chat.id ? 0 : c.unreadCount
    })));
  };

  // Close the current chat window
  const closeChat = () => {
    setIsMinimized(true);
    setSelectedChat(null);
    setIsCollapsed(false);
  };

  // Toggle chat interface collapse/expand
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Main chat interface render
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {!isMinimized && selectedChat ? (
        // Individual chat window
        <div className="w-80 bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <button 
                onClick={closeChat}
                className="hover:bg-blue-700 p-1 rounded"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <UserCircleIcon className="h-6 w-6" />
              <span>{selectedChat.participant.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleCollapse} className="hover:bg-blue-700 p-1 rounded">
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <>
              {/* Message history */}
              <div className="h-96 overflow-y-auto p-4">
                {selectedChat.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input form */}
              <form onSubmit={(e) => handleSendMessage(selectedChat.id, e)} className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        // Chat list view
        <div className="w-80 bg-white rounded-lg shadow-xl">
          <div className="p-3 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">My Chats</h3>
            <button onClick={toggleCollapse} className="hover:bg-blue-700 p-1 rounded">
              <ChevronDownIcon className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {!isCollapsed && (
            <div className="max-h-96 overflow-y-auto">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-100 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium">{chat.participant.name}</div>
                      <div className="text-sm text-gray-500">{chat.title}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{chat.lastMessageTime}</div>
                    {chat.unreadCount > 0 && (
                      <div className="mt-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatComponent;