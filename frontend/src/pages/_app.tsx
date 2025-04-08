import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalProvider } from "@/Context/GlobalContext";
import ChatComponent from "@/components/Chat/ChatComponent";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalProvider>
      <Component {...pageProps} />
      <ChatComponent listingId="global-chat" listingTitle="ReuseU" />
    </GlobalProvider>
  );
}
