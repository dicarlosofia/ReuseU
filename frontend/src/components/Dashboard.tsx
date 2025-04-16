/**
 * Dashboard Component
 * 
 * This is the main navigation bar component that appears at the top of every page.
 * It includes:
 * - Logo/Home button (ReuseU)
 * - Search bar for listings
 * - Create listing button
 * - Profile button
 * - Settings button
 * 
 * The component handles navigation between different sections of the application.
 */

import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, UserCircleIcon, Cog8ToothIcon, BuildingStorefrontIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/16/solid";
import { useGlobalContext } from '@/Context/GlobalContext';
import { useState } from 'react';

export default function Dashboard() {
    const router = useRouter();
    const { logout } = useGlobalContext();
    const [showSettings, setShowSettings] = useState(false);

    // Navigate to home page
    const handleReuseClick = () => {
        router.push('/');
    }

    // Navigate to create listing page
    const handleMakeAListingClick = () => {
        router.push('/create');
    }

    // Navigate to user profile page
    const handleUserCircleClick = () => {
        router.push('/profile');
    }

    // Handle settings button click
    const handleCogClick = () => {
        setShowSettings(!showSettings);
    }

    // Handle logout
    const handleLogout = () => {
        logout();
        setShowSettings(false);
        router.push('/login');
    }

    // Main navigation bar layout with all interactive elements
    return (
        <div className="flex items-center fixed top-0 left-0 w-full h-1/16 bg-[#5E8D66] z-50">
            {/* Logo/Home button */}
            <div className="pl-5 h-full flex items-center">
                <div 
                className="cursor-pointer outline-solid rounded-lg h-3/4 w-full pt-[10px] bg-[#3E4F44]"
                onClick={handleReuseClick}>ReuseU</div>
            </div>
            {/* Search bar */}
            <div className="relative w-3/4 pl-5 flex-grow">
                <input 
                className="text-black w-full pl-5 pr-10 rounded-lg bg-white focus:border-indigo-600"
                type="text" 
                placeholder="Search for a Listing"/>
                <MagnifyingGlassIcon className="right-3 top-[2px] flex items-center absolute h-5 w-5 outline-offset-[-2px] [outline-right:none] [outline-top:none] [outline-bottom:none] outline outline-2" />
            </div>
            {/* Create listing button */}
            <div className="pl-5 p-2 pr-0 h-full flex items-center">
                <BuildingStorefrontIcon
                className="bg-[#3E4F44] cursor-pointer right-3 top-[2px] flex items-center h-full w-12 outline-solid rounded-lg"
                onClick={handleMakeAListingClick} />
            </div>
            {/* Profile button */}
            <div className="pl-5 h-full flex items-center">
                <UserCircleIcon 
                className="cursor-pointer right-3 top-[2px] flex items-center h-full w-10"
                onClick={handleUserCircleClick} />
            </div>
            {/* Settings button with dropdown */}
            <div className="pl-5 pr-5 h-full flex items-center relative">
                <Cog8ToothIcon 
                className="cursor-pointer right-3 top-[2px] flex items-center h-full w-10"
                onClick={handleCogClick} />
                
                {/* Settings dropdown menu */}
                {showSettings && (
                    <div className="absolute right-5 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-2" />
                                Log Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
  