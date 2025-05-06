import React, { useState, useEffect } from "react";
import { UserCircleIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/Context/GlobalContext";
import { accountsApi } from "@/pages/api/accounts";
import EditProfileModal from "./EditProfileModal";

interface ProfileData {
  username: string;
  name: string;
  email: string;
  pronouns: string;
  aboutMe: string;
}

const ProfileSection: React.FC = () => {
  const router = useRouter();
  const { user, account } = useGlobalContext();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (account) {
        setProfileData({
          username: account.Username,
          name: `${account.First_Name} ${account.Last_Name}`,
          email: account.email || "",
          pronouns: account.Pronouns || "",
          aboutMe: account.AboutMe || "",
        });
        setLoading(false);
        return;
      }

      if (user) {
        try {
          const res = await fetch(`/api/accounts/${user.uid}`);
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          setProfileData({
            username: data.Username,
            name: `${data.First_Name} ${data.Last_Name}`,
            email: data.email || "",
            pronouns: data.Pronouns || "",
            aboutMe: data.AboutMe || "",
          });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [account, user]);

  const handleBack = () => {
    router.back();
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (newData: ProfileData) => {
    try {
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken();

      // Split full name into first and last
      const [firstName, ...lastNameParts] = newData.name.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';

      await accountsApi.updateAccount(user.uid, {
        Username: newData.username,
        email: newData.email,
        Pronouns: newData.pronouns,
        AboutMe: newData.aboutMe,
        First_Name: firstName,
        Last_Name: lastName,
      }, token);

      // Update local profileData immediately
      setProfileData(newData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        i <= rating ? (
          <StarIconSolid key={i} className="w-6 h-6 text-yellow-400" />
        ) : (
          <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
        )
      );
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-2 text-cyan-950">({rating}/5)</span>
      </div>
    );
  };

  if (loading || !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-cyan-600">
        <p className="text-lime-800 font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-cyan-600">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-8 items-start w-full max-w-5xl mx-auto p-6">
        {/* Profile Header */}
        <div className="col-span-full bg-white rounded-lg shadow-md p-6 border-l-4 border-lime-500">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h1 className="text-2xl font-bold text-lime-800">User Profile</h1>
          </div>
          <div className="mb-4">
            {renderStars(5)}
          </div>
        </div>

        {/* Profile Left */}
        <div className="col-span-full md:col-span-3 bg-white rounded-lg shadow-md p-6 border-t-4 border-lime-500">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="bg-lime-200 rounded-full p-2">
                <UserCircleIcon className="w-32 h-32 text-lime-600" />
              </div>
            </div>
            <span className="text-xl font-bold text-cyan-950">{profileData.username}</span>
          </div>
        </div>

        {/* Profile Right */}
        <div className="col-span-full md:col-span-5 bg-white rounded-lg shadow-md p-6 border-t-4 border-lime-500">
          <h2 className="text-xl font-semibold text-lime-800 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Full Name</span>
              <span className="text-lg text-cyan-950">{profileData.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email Address</span>
              <span className="text-lg text-cyan-950">{profileData.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Pronouns</span>
              <span className="text-lg text-cyan-950">{profileData.pronouns}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">About Me</span>
              <p className="text-lg text-cyan-950 whitespace-pre-wrap">{profileData.aboutMe}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="col-span-full flex justify-end gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-cyan-950 bg-cyan-100 rounded-md hover:bg-gray-200 transition-colors duration-200 shadow-sm"
          >
            Back
          </button>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 text-sm font-medium text-white bg-lime-500 rounded-md hover:bg-lime-800 transition-colors duration-200 shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {profileData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={profileData}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
};

export default ProfileSection;
