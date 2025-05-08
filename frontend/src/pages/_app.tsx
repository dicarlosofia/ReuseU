import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalProvider } from "@/Context/GlobalContext";
import { ChatProvider } from "@/Context/ChatContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
// Import the main chat component for global chat features
import ChatComponent from "@/components/Chat/ChatComponent";
import React, { useRef, createContext } from "react"; // React hooks and context for app-wide state
import { useGlobalContext } from '@/Context/GlobalContext'; // Custom global context for user/session

// Context to provide global chat ref
// This context provides a ref to the chat component, so any part of the app can trigger chat actions
export const GlobalChatRefContext = createContext<React.RefObject<{ fetchChats: () => void } | null> | null>(null);

// Custom App component wraps every page with providers for global state and chat
export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <GlobalProvider>
      <ChatProvider>
        <InnerApp Component={Component} pageProps={pageProps} router={router} />
      </ChatProvider>
    </GlobalProvider>
  );
}

import { useRouter } from 'next/router';

// InnerApp handles routing and decides what to show based on auth and route
function InnerApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // These routes don't require authentication
  const isPublic = ['/login', '/signup', '/forgot'].includes(router.pathname);
  // This ref lets us call chat methods from anywhere in the app
  const chatRef = useRef<{ fetchChats: () => void } | null>(null);
  // Grab user and loading state from our global context
  const { user, loading } = useGlobalContext();
  console.log('isPublic', isPublic, 'user', user, 'loading', loading);

  // Don't render anything until we know if the user is logged in
  if (loading) {
    // Optionally, return a spinner or skeleton loader here
    return null;
  }

  return (
    <GlobalChatRefContext.Provider value={chatRef}>
      {isPublic ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Navbar />
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
      {/* Only show ChatComponent if user is signed in */}
      {!isPublic && user && (
        <ChatComponent ref={chatRef} listingId="global-chat"/>
      )}
    </GlobalChatRefContext.Provider>
  );
}

