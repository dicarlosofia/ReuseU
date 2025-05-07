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

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef, RefObject } from 'react';
import { ChevronDownIcon, UserCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { useGlobalContext } from '@/Context/GlobalContext';
import { chatsApi, Message as ApiMessage } from '@/pages/api/chats';
import { io, Socket } from 'socket.io-client';

// Matches backend response shape
export interface ApiChat {
  id: string;
  listing_id: string;
  other_user: {
    username: string;
    avatar?: string;
  } | null;
  last_message?: {
    text: string;
    timestamp: string;
  } | null;
}

// Props for component initialization
interface ChatComponentProps {
  listingId?: string;
}

// Local UI chat structure
interface Chat {
  id: string;
  listing_id: string;
  participant: {
    name: string;
    avatar?: string;
    id: string;
  };
  unreadCount: number;
  title: string;
  lastMessageTime: string;
}

// Adapted message shape
interface AdaptedMessage {
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

// Minimal message shape for adapting
interface MinimalMessage {
  content: string;
  sender_id: string;
  created_at: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const ChatComponent = forwardRef<{ fetchChats: () => void }, ChatComponentProps>(
  ({ listingId }, ref) => {
    const { user, account } = useGlobalContext();
    const router = useRouter();

    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [adaptedMessages, setAdaptedMessages] = useState<AdaptedMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const [listingTitle, setListingTitle] = useState<string>('');

    // Fetch user's chats from backend
    const fetchChats = useCallback(async () => {
      console.log('[ChatComponent] fetchChats called');
      if (!user?.uid || !account?.Username) return;
      setLoadingChats(true);
      try {
        const token = await user.getIdToken();
        const { chats: apiChats }: { chats: ApiChat[] } = await chatsApi.getByUserId(token);
        // Dedupe by id
        const unique = apiChats.filter((c, i, a) => a.findIndex(x => x.id === c.id) === i);
        const initialChats = unique.map(c => ({
          id: c.id,
          listing_id: c.listing_id,
          participant: {
            name: c.other_user?.username || 'Unknown',
            avatar: c.other_user?.avatar,
            id: '',
          },
          unreadCount: 0,
          lastMessageTime: c.last_message?.timestamp ? formatTimestamp(c.last_message.timestamp) : '',
          title: '', // will be set after fetching listing title
        }));
        setChats(initialChats);
        // Fetch listing titles for each chat
        await Promise.all(initialChats.map(async (chat) => {
          if (chat.listing_id) {
            try {
              const listing = await (await import('@/pages/api/listings')).listingsApi.getById(chat.listing_id, token);
              if (listing && listing.Title) {
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title: listing.Title } : c));
              }
            } catch {}
          }
        }));
      } catch (error) {
        console.error('Failed to fetch chats', error);
      } finally {
        setLoadingChats(false);
      }
    }, [listingId, user, account]);

    // Open a specific chat and load its messages
    const openChat = useCallback(async (chat: Chat) => {
      try {
        if (!user) {
          console.error('User not authenticated');
          return;
        }
        // Fetch the listing title by listing_id if present
        if (chat.listing_id) {
          try {
            const token = await user.getIdToken();
            const listing = await (await import('@/pages/api/listings')).listingsApi.getById(chat.listing_id, token);
            if (listing && listing.Title) {
              setListingTitle(listing.Title);
              // Update chat preview title in chats list
              setChats(prevChats => prevChats.map(c =>
                c.id === chat.id ? { ...c, title: listing.Title } : c
              ));
            }
          } catch (e) {
            setListingTitle('');
          }
        } else {
          setListingTitle('');
        }
        const token = await user.getIdToken();
        const full = await chatsApi.getById(chat.id, token);
        setSelectedChat(chat);
        setIsCollapsed(false);
        if (user?.uid && full.messages) {
          // Map backend fields to expected format for adaptMessage
          type BackendMessage = {
            id: string;
            sender_id: string;
            message: string;
            timestamp: string;
            read: boolean;
          };
          const adapted = (full.messages as BackendMessage[])
            .map((m) => adaptMessage({
              content: m.message,
              sender_id: m.sender_id,
              created_at: m.timestamp,
            }, user.uid))
            .filter((m: AdaptedMessage | null): m is AdaptedMessage => m !== null);
          setAdaptedMessages(adapted);
        }
        // Join websocket room for this chat
        if (socketRef.current && chat.id) {
          socketRef.current.emit('join', { room: chat.id });
        }
      } catch (error) {
        console.error('Failed to open chat', error);
      }
    }, [user]);

    // Close current chat view
    const closeChat = useCallback(() => {
      if (selectedChat && socketRef.current) {
        socketRef.current.emit('leave', { room: selectedChat.id });
      }
      setSelectedChat(null);
      setAdaptedMessages([]);
    }, [selectedChat]);


    // Send a new message
    const handleSendMessage = useCallback(async (chatId: string, e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !user?.uid) return;
      try {
        if (!user) {
          console.error('User not authenticated');
          return;
        }
        // Send via websocket
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            room: chatId,
            message: newMessage,
            sender: user.uid,
          });
        }
        // Still persist to backend for durability
        const token = await user.getIdToken();
        await chatsApi.sendMessage({
          chat_id: chatId,
          sender_id: user.uid,
          content: newMessage,
        }, chatId, token);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }, [newMessage, user]);


    // Toggle collapse/expand of chat body
    const toggleCollapse = () => {
      setIsCollapsed(prev => !prev);
    };

    // Determine header title
    const headerTitle = selectedChat && listingTitle
      ? `Chat about ${listingTitle}`
      : 'Chats';


    // Format timestamps as YYYY-MM-DD HH:mm
    const formatTimestamp = (ts: string) => {
      const date = new Date(ts);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    };

    // Convert API message to UI message
    const adaptMessage = (msg: MinimalMessage, currentUserId: string): AdaptedMessage | null => {
      if (!msg) return null;
      return {
        text: msg.content,
        sender: msg.sender_id === currentUserId ? 'user' : 'other',
        timestamp: formatTimestamp(msg.created_at),
      };
    };


    useImperativeHandle(ref, () => ({ fetchChats }));

    // WebSocket connection and listeners
    useEffect(() => {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL + '/chat', { transports: ['websocket'], 
          auth: {
            token: user?.getIdToken(),  // Firebase ID token
          },
        });
      }
      const socket = socketRef.current;
      const onReceiveMessage = (data: { message: string; sender: string; timestamp?: string }) => {
        setAdaptedMessages(prev => [
          ...prev,
          {
            text: data.message,
            sender: data.sender === user?.uid ? 'user' : 'other',
            timestamp: formatTimestamp(data.timestamp || new Date().toISOString()),
          },
        ]);
      };
      socket.on('receive_message', onReceiveMessage);
      return () => {
        socket.off('receive_message', onReceiveMessage);
      };
    }, [user?.uid]);

    // Clean up socket connection on unmount
    useEffect(() => {
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, []);

    // Reference for autoscroll
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Always load chats on mount and when user/account changes
    useEffect(() => {
      if (user?.uid && account?.Username) {
        fetchChats();
      }
    }, [user, account, fetchChats]);

    // Scroll to bottom when a chat is opened or messages change
    useEffect(() => {
      if (selectedChat && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [selectedChat, adaptedMessages]);

    return (
      <div className="fixed bottom-4 right-4 z-50 w-96">
        {/* Chat header */}
        <div className="bg-cyan-950 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
          <div className="flex items-center">
            {selectedChat && (
              <ArrowLeftIcon
                className="h-6 w-6 mr-2 cursor-pointer"
                onClick={closeChat}
              />
            )}
            <ChevronDownIcon
              className={`h-6 w-6 cursor-pointer transform transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              onClick={toggleCollapse}
            />
          </div>
        </div>

        {/* Chat body */}
        {!isCollapsed && (
          <div className="bg-white rounded-b-lg border">
            {!selectedChat ? (
              loadingChats ? (
                /* Loading spinner */
                <div className="flex items-center justify-center h-32">
                  <svg className="animate-spin h-8 w-8 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : (
                /* Chats list */
                <div className="max-h-96 overflow-y-auto">
                  {chats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => openChat(chat)}
                      className="w-full p-3 flex items-center justify-between hover:bg-cyan-100 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        <div className="text-left">
                          <div className="text-cyan-800 font-medium">{chat.participant.name}</div>
                          <div className="text-sm text-gray-500">{chat.title}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{chat.lastMessageTime}</div>
                        {chat.unreadCount > 0 && (
                          <div className="mt-1 bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              /* Selected chat view */
              <>
                <div className="h-72 overflow-y-auto p-4" id="chat-messages-container">
                  {adaptedMessages.map((message, i) => (
                    <div key={i} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded-lg ${
                        message.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-cyan-950'
                      }`}>
                        {message.text}
                        <span className="text-xs block mt-1">{message.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  {/* 🔻 THIS is the scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
                {/* Message input */}
                <form
                  className="text-cyan-700 flex items-center gap-2 p-4 border-t bg-cyan-50 rounded-b-lg"
                  onSubmit={(e: React.FormEvent) => handleSendMessage(selectedChat.id, e)}
                >
                  <input
                    type="text"
                    className="bg-white border-cyan-800 flex-1 rounded border px-3 py-2"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage((e.target as HTMLInputElement).value)}
                    autoFocus
                  />
                  <button type="submit" className="bg-cyan-600 text-white rounded px-4 py-2">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

ChatComponent.displayName = 'ChatComponent';

export default ChatComponent;
