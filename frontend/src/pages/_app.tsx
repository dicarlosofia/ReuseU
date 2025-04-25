import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalProvider } from "@/Context/GlobalContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ChatComponent from "@/components/Chat/ChatComponent";

export default function App({ Component, pageProps, router }: AppProps) {
  const isPublic = router.pathname === '/login' || router.pathname === '/signup';

  return (
    <GlobalProvider>
      {isPublic ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Navbar />
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
      <ChatComponent listingId="global-chat" listingTitle="ReuseU" />
    </GlobalProvider>
  );
}
