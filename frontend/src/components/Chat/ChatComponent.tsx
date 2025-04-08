import { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, ChevronDownIcon, UserCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useGlobalContext } from '@/Context/GlobalContext';

interface ChatComponentProps {
  listingId?: string;
  listingTitle?: string;
}

interface Message {
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

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

  const openChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsMinimized(false);
    setIsCollapsed(false);
    setChats(chats.map(c => ({
      ...c,
      unreadCount: c.id === chat.id ? 0 : c.unreadCount
    })));
  };

  const closeChat = () => {
    setIsMinimized(true);
    setSelectedChat(null);
    setIsCollapsed(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {!isMinimized && selectedChat ? (
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
                      <div className="text-sm text-gray-500">
                        {chat.messages[chat.messages.length - 1]?.text || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-500">{chat.lastMessageTime}</div>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                        {chat.unreadCount}
                      </span>
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