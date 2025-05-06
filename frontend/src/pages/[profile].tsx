import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { accountsApi, AccountData } from "@/pages/api/accounts";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const PublicProfile: React.FC = () => {
  const router = useRouter();
  const { profile: profileParam } = router.query;
  const [profileData, setProfileData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileParam || typeof profileParam !== "string") return;
      setLoading(true);
      setError(null);
      try {
        // Only use getAccount (works for both userId and username)
        let data: AccountData | null = null;
        try {
          data = await accountsApi.getAccount(profileParam, "");
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
  }, [profileParam, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg text-gray-500">Loading profile...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }
  if (!profileData) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <div className="flex items-center mb-6">
        <UserCircleIcon className="h-20 w-20 text-gray-300 mr-6" />
        <div>
          <h2 className="text-2xl font-bold mb-1">{profileData.Username}</h2>
          <p className="text-gray-600">{profileData.First_Name} {profileData.Last_Name}</p>
          <p className="text-sm text-gray-400">{profileData.Email}</p>
        </div>
      </div>
      <div className="mb-4">
        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
          {profileData.Pronouns}
        </span>
        <span className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2">
          {profileData.School}
        </span>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">About Me</h3>
        <p className="text-gray-700 whitespace-pre-line">{profileData.AboutMe}</p>
      </div>
      <div className="flex items-center">
        <StarIconSolid className="h-6 w-6 text-yellow-400 mr-1" />
        <span className="text-gray-600">Member since {profileData.dateTime_creation ? new Date(profileData.dateTime_creation).toLocaleDateString() : "N/A"}</span>
      </div>
      {/* No edit profile button here */}
    </div>
  );
};

export default PublicProfile;
