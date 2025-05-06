import { Geist } from "next/font/google";
import { useRouter } from "next/router";
import Dashboard from "@/components/Dashboard";
import CreateListing from "@/components/Listings/CreateListing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Create() {
  const router = useRouter();

  const handleSubmit = async (listingData: any) => {
    // TODO: Handle the submission to backend
    console.log('Submitting listing:', listingData);
    // After successful submission, redirect to home
    router.push('/');
  };

  return (
    <main className={`${geistSans.variable} font-sans min-h-screen bg-cyan-600`}>
      <Dashboard />
      <div className="pt-16">
        <CreateListing onSubmit={handleSubmit} />
      </div>
    </main>
  );
} 