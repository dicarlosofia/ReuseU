import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalProvider } from "@/Context/GlobalContext";
import { ChatProvider } from "@/Context/ChatContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ChatComponent from "@/components/Chat/ChatComponent";
import React, { useRef, createContext } from "react";
import { useGlobalContext } from '@/Context/GlobalContext';

// Context to provide global chat ref
export const GlobalChatRefContext = createContext<React.RefObject<{ fetchChats: () => void } | null> | null>(null);

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

function InnerApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPublic = ['/login', '/signup', '/forgot'].includes(router.pathname);
  const chatRef = useRef<{ fetchChats: () => void } | null>(null);
  const { user, loading } = useGlobalContext();
  console.log('isPublic', isPublic, 'user', user, 'loading', loading);

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
        <ChatComponent ref={chatRef} listingId="global-chat" listingTitle="ReuseU" />
      )}
    </GlobalChatRefContext.Provider>
  );
}

