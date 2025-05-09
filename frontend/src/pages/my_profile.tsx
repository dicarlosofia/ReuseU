import React from "react";
import Dashboard from "@/components/Dashboard";
import ProfileSection from "@/components/ProfileSection/ProfileSection";

const MyProfilePage: React.FC = () => {
  return (
    <>
      <Dashboard />
      <main className="min-h-screen bg-cyan-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <ProfileSection />
        </div>
      </main>
    </>
  );
};

export default MyProfilePage;
