// Main dashboard for logged-in users
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useGlobalContext } from '@/Context/GlobalContext';
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog8ToothIcon,
  PlusCircleIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { RecycleIcon } from "lucide-react";
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const router = useRouter();
  const { logout, searchQuery, setSearchQuery } = useGlobalContext();
  const [showSettings, setShowSettings] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  // Navigation helpers
  const handleReuseClick = () => router.push('/');
  const handleMakeAListingClick = () => router.push('/create');
  const handleUserCircleClick = () => router.push('/my_profile');
  const handleCogClick = () => setShowSettings(!showSettings);
  const handleLogout = () => {
    logout();
    setShowSettings(false);
    router.push('/login');
  };
  // SOFIA ADDITION
  const handleAboutUs = () => router.push('/abt_us')

  // --- Search ---
  // Keep localSearch in sync with global searchQuery
  React.useEffect(() => {
    setLocalSearch(searchQuery || "");
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (router.pathname !== "/") {
      router.push("/");
    }
    // If already on homepage, ListingsHomepage will react to global searchQuery
  };


  return (
    <div className="flex items-center fixed top-0 left-0 w-full h-16 bg-lime-800 text-white shadow-md z-50">
      {/* Logo / Home */}
      <div className="pl-5 h-full flex items-center">
        <div
          className="cursor-pointer flex items-center font-bold text-xl rounded-lg px-4 py-2 bg-cyan-950 hover:bg-lime-500 transition-colors"
          onClick={handleReuseClick}
        >
          <RecycleIcon className="mr-2 h-5 w-5" />
          <span>ReuseU</span>
        </div>
      </div>

      {/* Search bar */}
      <form className="relative w-3/4 pl-5 flex-grow mx-4" onSubmit={handleSearch}>
        <div className="relative flex items-center">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-cyan-950 focus:outline-none focus:ring-2 focus:ring-cyan-600 placeholder-gray-500"
            type="text"
            placeholder="Search for a listing..."
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            aria-label="Search for a listing"
          />
          <button type="submit" className="absolute left-3 h-5 w-5 text-lime-800 bg-transparent border-none p-0 cursor-pointer">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Create listing */}
      <div className="px-2 h-full flex items-center">
        <button
          className="flex items-center justify-center bg-lime-900 hover:bg-lime-500 text-white rounded-full p-2 transition-colors"
          onClick={handleMakeAListingClick}
          title="Create New Listing"
        >
          <PlusCircleIcon className="h-8 w-8" />
        </button>
      </div>

      {/* Profile */}
      <div className="px-2 h-full flex items-center">
        <button
          className="flex items-center justify-center hover:bg-lime-900 rounded-full p-2 transition-colors"
          onClick={handleUserCircleClick}
          title="Profile"
        >
          <UserCircleIcon className="h-8 w-8" />
        </button>
      </div>

      {/* Settings */}
      <div className="px-5 h-full flex items-center relative">
        <button
          className="flex items-center justify-center hover:bg-lime-900 rounded-full p-2 transition-colors"
          onClick={handleCogClick}
          title="Settings"
        >
          <Cog8ToothIcon className="h-8 w-8" />
        </button>

        {/* Dropdown */}
        {showSettings && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2 text-gray-700" />
              Log Out
            </button>
            {/* Button to take the user to the About Us page */}
            <button
              onClick={handleAboutUs}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-700" />
              About Us
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
