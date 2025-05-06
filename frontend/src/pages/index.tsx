import { Geist } from "next/font/google";
import { useRouter } from "next/router";
import Dashboard from "@/components/Dashboard";
import ListingsHomepage from "@/components/Listings/ListingsHomepage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();

  return (
    <main className={`${geistSans.variable} font-sans min-h-screen bg-cyan-600`}>
      <Dashboard />
      <div className="container mx-auto px-4 pt-16">
        <ListingsHomepage/>
      </div>
    </main>
  );
}
