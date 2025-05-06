import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { accountsApi, AccountData } from "@/pages/api/accounts";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useGlobalContext } from "@/Context/GlobalContext";
import Dashboard from "@/components/Dashboard";

const PublicProfile: React.FC = () => {
  const router = useRouter();
  const { profile: profileParam } = router.query;
  const { user } = useGlobalContext();
  const [profileData, setProfileData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileParam || typeof profileParam !== "string") return;
      setLoading(true);
      setError(null);
      try {
        let token = "";
        if (user) {
          token = await user.getIdToken();
        }
        let data: AccountData | null = null;  
        try {
          data = await accountsApi.getAccount(profileParam, token);
          console.log("[profile].tsx loaded for:", profileParam, data);
          if (data && data.Username && data.Username !== profileParam) {
            // Redirect to canonical username URL
            router.replace(`/profile/${data.Username}`);
            return;
          }
        } catch {
          data = null;
        }
        if (!data) throw new Error("Profile not found");
        setProfileData(data);
      } catch (err: any) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileParam, user, router]);

  if (loading) {
    return (
      <>
        <Dashboard />
        <div className="flex justify-center items-center min-h-[60vh] bg-cyan-600">
          <span className="text-lg text-gray-500">Loading profile...</span>
        </div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Dashboard />
        <div className="flex justify-center items-center min-h-[60vh] bg-cyan-600">
          <span className="text-lg text-red-500">{error}</span>
        </div>
      </>
    );
  }
  if (!profileData) {
    return null;
  }

  return (
    <>
      <Dashboard />
      <main className="min-h-screen bg-cyan-600 pt-8 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-7 gap-8 items-start">
          {/* Profile Left */}
          <div className="md:col-span-2 flex flex-col items-center bg-white rounded-lg shadow-md p-8 border-t-4 border-lime-500">
            <div className="flex flex-col items-center mb-4">
              <UserCircleIcon className="w-32 h-32 text-lime-600 mb-2" />
              <span className="text-xl font-bold text-cyan-950">{profileData.Username}</span>
            </div>
            <div className="text-center">
              <span className="block text-gray-600 text-lg font-semibold mb-1">{profileData.First_Name} {profileData.Last_Name}</span>
              <span className="block text-gray-400 text-sm mb-2">{profileData.email}</span>
              <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
                {profileData.Pronouns}
              </span>
              <span className="inline-block bg-blue-100 rounded-full px-3 py-1 text-xs font-semibold text-blue-700 mr-2 mb-2">
                {profileData.School}
              </span>
            </div>
          </div>

          {/* Profile Right */}
          <div className="md:col-span-5 bg-white rounded-lg shadow-md p-8 border-t-4 border-lime-500">
            <h2 className="text-2xl font-semibold text-lime-800 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-950 mb-2">About Me</h3>
                <p className="text-gray-700 whitespace-pre-line">{profileData.AboutMe}</p>
              </div>
              <div className="flex items-center mt-6">
                <StarIconSolid className="h-6 w-6 text-yellow-400 mr-1" />
                <span className="text-gray-600">Member since {profileData.dateTime_creation ? new Date(profileData.dateTime_creation).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PublicProfile;
