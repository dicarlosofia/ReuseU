import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalProvider } from "@/Context/GlobalContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ChatComponent from "@/components/Chat/ChatComponent";

export default function App({ Component, pageProps, router }: AppProps) {
  // Don't protect the login and signup pages
  if (router.pathname === '/login' || router.pathname === '/signup') {
    return (
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    );
  }

  return (
    <GlobalProvider>
      <ProtectedRoute>
        <Navbar />
        <Component {...pageProps} />
      </ProtectedRoute>
      <ChatComponent listingId="global-chat" listingTitle="ReuseU" />
    </GlobalProvider>
  );
}