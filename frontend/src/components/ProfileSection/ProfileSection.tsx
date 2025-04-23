import React, { useState } from "react";
import { UserCircleIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import EditProfileModal from "./EditProfileModal";

// Props interface for the ProfileSection component
interface ProfileProps {
  username: string;
  rating: number;
  name: string;
  email: string;
  pronouns: string;
  aboutMe: string;
  itemsSold: number;
  itemsBought: number;
}

// Data structure for editable profile information
interface ProfileData {
  username: string;
  name: string;
  email: string;
  pronouns: string;
  aboutMe: string;
}

const ProfileSection: React.FC<ProfileProps> = ({
  username,
  rating,
  name,
  email,
  pronouns,
  aboutMe,
  itemsSold,
  itemsBought,
}) => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username,
    name,
    email,
    pronouns,
    aboutMe,
  });

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Open edit profile modal
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  // Save profile changes
  const handleSaveProfile = (newData: ProfileData) => {
    setProfileData(newData);
    setIsEditModalOpen(false);
    // TODO: Add API call to save profile changes
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      if (i <= rating) {
        stars.push(
          <StarIconSolid key={i} className="w-6 h-6 text-yellow-400" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
        );
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-2 text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  // Main profile layout with recycling-themed green design
  return (
    <div className="flex justify-center min-h-screen bg-green-50">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-8 items-start w-full max-w-5xl mx-auto p-6">
        {/* Profile Header with recycling icon */}
        <div className="col-span-full bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h1 className="text-2xl font-bold text-green-800">User Profile</h1>
          </div>
          
          {/* Star Rating */}
          <div className="mb-4">
            {renderStars(rating)}
          </div>
        </div>
        
        {/* Left column - Profile picture and basic info */}
        <div className="col-span-full md:col-span-3 bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="bg-green-100 rounded-full p-2">
                <UserCircleIcon className="w-32 h-32 text-green-700" />
              </div>
              <div className="absolute bottom-0 right-0 bg-green-600 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold text-gray-800">{profileData.username}</span>
            
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-800">{itemsSold}</div>
                <div className="text-sm text-green-700">Items Recycled</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-800">{itemsBought}</div>
                <div className="text-sm text-green-700">Items Acquired</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Detailed profile information */}
        <div className="col-span-full md:col-span-5 bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Full Name</span>
              <span className="text-lg text-gray-800">{profileData.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email Address</span>
              <span className="text-lg text-gray-800">{profileData.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Pronouns</span>
              <span className="text-lg text-gray-800">{profileData.pronouns}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">About Me</span>
              <p className="text-lg text-gray-800 whitespace-pre-wrap">{profileData.aboutMe}</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="col-span-full flex justify-end gap-4">
          <button 
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 shadow-sm"
          >
            Back
          </button>
          <button 
            onClick={handleEditClick}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit profile modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={profileData}
      />
    </div>
  );
};

export default ProfileSection;