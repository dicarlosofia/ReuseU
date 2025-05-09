// Main chat UI component for user messaging
// This component handles user chat interactions, including fetching chats, 
// opening and closing chats, sending messages, and updating the chat UI state.

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import { ReviewModal } from '../ReviewModal';
import { reviewsApi } from '@/pages/api/reviews';
import { ChevronDownIcon, UserCircleIcon, ArrowLeftIcon, XMarkIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
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
  pending?: boolean;
}

// Minimal message shape for adapting
interface MinimalMessage {
  content: string;
  sender_id: string;
  created_at: string;
}

// IMPORTANT: The backend WebSocket server runs on port 5001. Set NEXT_PUBLIC_SOCKET_URL in your environment if deploying elsewhere.
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

const ChatComponent = forwardRef<{ fetchChats: () => void }, ChatComponentProps>(
  ({ listingId }, ref) => {
    const { user, account } = useGlobalContext();
    const router = useRouter();

    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [adaptedMessages, setAdaptedMessages] = useState<AdaptedMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChats, setLoadingChats] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const [listingTitle, setListingTitle] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Transaction and review state
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [transactionComplete, setTransactionComplete] = useState(false);
    const [reviewLeft, setReviewLeft] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    // Seller detection state
    const [sellerUsername, setSellerUsername] = useState<string | null>(null);
    const [isSeller, setIsSeller] = useState<boolean>(false);
    // Track listing SellStatus for chat
    const [listingSellStatus, setListingSellStatus] = useState<number | null>(null);
    // Add UID debug
    const userUID = user?.uid;

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

    // Fetch user's chats from backend
    const fetchChats = useCallback(async () => {
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
              setChats((prevChats: Chat[]) => prevChats.map((c: Chat) => c.id === chat.id ? { ...c, title: listing.Title } : c));
            }
            // Set seller username from listing
            if (listing && listing.UserID) {
              setSellerUsername(listing.UserID);
              setIsSeller(userUID === listing.UserID);
            } else {
              setSellerUsername(null);
              setIsSeller(false);
            }
            // Track SellStatus
            if (listing && typeof listing.SellStatus === 'number') {
              setListingSellStatus(listing.SellStatus);
            } else {
              setListingSellStatus(null);
            }
          } catch (e) {
            setListingTitle('');
            setSellerUsername(null);
            setIsSeller(false);
          }
        } else {
          setListingTitle('');
          setSellerUsername(null);
          setIsSeller(false);
        }
        const token = await user.getIdToken();
        const full = await chatsApi.getById(chat.id, token);
        setSelectedChat(chat);
        setIsCollapsed(false);
        setIsMinimized(false);
        if (user?.uid && full.messages) {
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
          setAdaptedMessages(adapted); // This will replace all messages, dropping any pending ones
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
      setIsCollapsed(true);
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
        // Optimistically update the UI

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
      if (isMinimized) setIsMinimized(false);
    };

    // Toggle minimize/maximize chat window
    const toggleMinimize = () => {
      setIsMinimized(prev => !prev);
    };

    // Determine header title
    const headerTitle = selectedChat && listingTitle
      ? `Chat about ${listingTitle}`
      : 'Chats';

    useImperativeHandle(ref, () => ({ fetchChats }));

    // WebSocket connection and listeners
    useEffect(() => {
      if (!socketRef.current && user) {
        user.getIdToken().then(token => {
          socketRef.current = io(SOCKET_URL + '/chat', { 
            transports: ['websocket'], 
            auth: { token }
          });
          
          const socket = socketRef.current;
          const onReceiveMessage = (data: { message: string; sender: string; timestamp?: string }) => {
            const formattedTimestamp = formatTimestamp(data.timestamp || new Date().toISOString());
            const incoming = {
              text: data.message,
              sender: data.sender === user?.uid ? 'user' : 'other' as 'user' | 'other',
              timestamp: formattedTimestamp,
            };
          
            setAdaptedMessages(prev => {
              // Check if this is a pending message that can be confirmed
              const pendingIndex = prev.findIndex(
                m => m.pending && m.text === incoming.text && m.sender === incoming.sender
              );
              
              if (pendingIndex !== -1) {
                // Replace pending message with confirmed one
                const updated = [...prev];
                updated[pendingIndex] = {
                  ...incoming,
                  pending: false // Remove pending status
                };
                return updated;
              }
          
              // Check for duplicates (same content, sender and within 2 seconds)
              const isDuplicate = prev.some(
                m => m.text === incoming.text && 
                     m.sender === incoming.sender && 
                     Math.abs(new Date(m.timestamp).getTime() - new Date(incoming.timestamp).getTime()) < 2000
              );
              
              return isDuplicate ? prev : [...prev, incoming];
            });
          };
          socket.on('receive_message', onReceiveMessage);
        });
      }
    }, [user]);

    // Clean up socket connection on unmount
    useEffect(() => {
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, []);

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

    // Count total unread messages across all chats
    const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

    return (
      <>
        {/* Floating chat button (collapsed) */}
        {isCollapsed && (
          <button
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-cyan-500 shadow-xl flex items-center justify-center hover:bg-cyan-700 transition-colors duration-300"
            onClick={toggleCollapse}
            aria-label="Open chat"
          >
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-white" />
            {totalUnread > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {totalUnread}
              </div>
            )}
          </button>
        )}

        {/* Chat drawer (expanded) */}
        {!isCollapsed && (
          <div
            className={`fixed bottom-0 right-0 z-50 flex flex-col shadow-xl bg-white transition-all duration-300 ease-in-out rounded-t-lg
                      ${isMinimized 
                        ? 'w-64 h-12' 
                        : selectedChat 
                          ? 'w-96 md:w-96 h-[500px]' 
                          : 'w-80 md:w-80 h-96'}`}
          >
            {/* Header */}
            <div 
              className="sticky top-0 bg-cyan-900 text-white p-3 rounded-t-lg flex justify-between items-center shadow-md cursor-pointer"
              onClick={isMinimized ? toggleMinimize : undefined}
            >
              <div className="flex items-center space-x-2 truncate">
                {selectedChat && !isMinimized && (
                  <ArrowLeftIcon
                    className="h-5 w-5 cursor-pointer hover:text-cyan-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeChat();
                    }}
                  />
                )}
                <h2 className="text-base font-semibold truncate">{headerTitle}</h2>
              </div>
              <div className="flex items-center space-x-1">
                {!isMinimized && (
                  <div 
                    className="p-1 hover:bg-cyan-800 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMinimize();
                    }}
                  >
                    <ChevronDownIcon className="h-5 w-5 cursor-pointer" />
                  </div>
                )}
                <div 
                  className="p-1 hover:bg-cyan-800 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    isMinimized ? setIsCollapsed(true) : toggleCollapse();
                  }}
                >
                  <XMarkIcon className="h-5 w-5 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Chat body - only show if not minimized */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-cyan-50">
                {!selectedChat ? (
                  loadingChats ? (
                    <div className="flex items-center justify-center h-32">
                      <svg className="animate-spin h-8 w-8 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="max-h-full overflow-y-auto overflow-x-hidden divide-y divide-cyan-100">
                      {chats.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                          No chats available
                        </div>
                      ) : (
                        chats.map((chat: Chat) => (
                          <button
                            key={chat.id}
                            onClick={() => openChat(chat)}
                            className="w-full p-3 flex items-center justify-between hover:bg-cyan-100 rounded transition-colors duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <UserCircleIcon className="h-8 w-8 text-gray-400" />
                              <div className="text-left">
                                <div className="text-cyan-800 font-medium truncate">{chat.participant.name}</div>
                                <div className="text-sm text-gray-500 truncate">{chat.title}</div>
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
                        ))
                      )}
                    </div>
                  )
                ) : (
                  <>
                    <div className="h-[380px] overflow-y-auto p-2" id="chat-messages-container">
                      {adaptedMessages.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                          Start a conversation
                        </div>
                      ) : (
                        adaptedMessages.map((message: AdaptedMessage, i: number) => (
                          <div key={i} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg shadow-sm max-w-[80%] ${
                              message.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-white text-cyan-950 border border-cyan-100'
                            }`}>
                              {message.text}
                              <span className="text-xs block mt-1 opacity-70">{message.timestamp}</span>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    {/* Transaction and review flow */}
                    {/* Only the seller can mark as complete */}
                    {/* Debug info for button visibility */}

                    {!transactionComplete && selectedChat && isSeller && listingSellStatus !== 0 && (
                      <div className="flex justify-center my-3">
                        <button
                          className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
                          onClick={() => setTransactionModalOpen(true)}
                        >
                          Finished transaction? Click here
                        </button>
                      </div>
                    )}
                    {/* Transaction completion modal */}
                    {transactionModalOpen && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                          <h2 className="text-xl font-semibold mb-4 text-cyan-900">Confirm Transaction Completion</h2>
                          <p className="mb-3 text-cyan-800">Please confirm you have completed the transaction for this listing.</p>
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                              onClick={() => setTransactionModalOpen(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
                              onClick={async () => {
                                setTransactionModalOpen(false);
                                // Mark the listing as sold in the backend
                                try {
                                  if (selectedChat?.listing_id && user) {
                                    const token = await user.getIdToken();
                                    const resp = await (await import('@/pages/api/listings')).listingsApi.updateSellStatus(String(selectedChat.listing_id), 0, token); // 0 = sold
                                    setTransactionComplete(true);
                                    setListingSellStatus(0);
                                    setReviewError('SellStatus update successful: ' + JSON.stringify(resp));
                                    console.log('SellStatus update response:', resp);
                                  }
                                } catch (e: any) {
                                  setTransactionComplete(false);
                                  setReviewError('SellStatus update failed: ' + (e?.message || String(e)));
                                  console.error('SellStatus update error:', e);
                                }
                              }}
                            >
                              Mark as Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Show review button for buyer after transaction complete */}
                    {transactionComplete && !reviewLeft && user && selectedChat && !isSeller && (
                      <div className="flex justify-center my-3">
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          onClick={() => setReviewModalOpen(true)}
                        >
                          Leave a Review
                        </button>
                      </div>
                    )}
                    {/* Review modal */}
                    <ReviewModal
                      isOpen={reviewModalOpen}
                      onClose={() => setReviewModalOpen(false)}
                      onSubmit={async (rating, comment) => {
                        setReviewError(null);
                        if (!user || !selectedChat) return;
                        try {
                          const token = await user.getIdToken();
                          await reviewsApi.create({
                            listing_id: Number(selectedChat.listing_id),
                            reviewer_id: Number(user.uid),
                            rating,
                            comment,
                          }, token);
                          setReviewLeft(true);
                          setReviewModalOpen(false);
                        } catch (e: any) {
                          setReviewError(e.message || 'Failed to submit review');
                        }
                      }}
                    />
                    {reviewError && <div className="text-red-500 text-center mt-2">{reviewError}</div>}

                    {/* Message input */}
                    <form
                      className="text-cyan-700 flex items-center gap-2 p-2 border-t border-cyan-100 bg-white"
                      onSubmit={(e: React.FormEvent) => handleSendMessage(selectedChat?.id || '', e)}
                    >
                      <input
                        type="text"
                        className="bg-cyan-50 border-cyan-200 flex-1 rounded-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="bg-cyan-600 text-white rounded-full px-3 py-2 hover:bg-cyan-700 transition-colors duration-200">
                        Send
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </>
    );
  }
);

ChatComponent.displayName = 'ChatComponent';

export default ChatComponent;