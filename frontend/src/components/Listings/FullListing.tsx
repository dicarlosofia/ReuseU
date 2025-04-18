/**
 * Full Listing Component
 * 
 * This component displays the complete details of a single listing.
 * Features include:
 * - Large product image with navigation arrows
 * - Detailed product information (title, price, description)
 * - Back button to return to listings
 * - Message seller button
 * - Delete button (only for user's own listings)
 * 
 * The component is used on the individual listing page.
 */

import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/16/solid";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/router";
import { listingsApi } from "@/pages/api/listings";
import { useState } from "react";

// Props interface for the FullListing component
export interface FullListingProps {
  title: string;
  price: number;
  tags: string[];
  desc: string;
  image: string;
  sellerId: string;
  listingId?: string;
}

export default function FullListing({ title, price, tags, desc, image, sellerId, listingId }: FullListingProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const currentUserId = 8675309; // This should come from your auth context

  // Handle back button click to return to previous page
  const handleBackClick = () => {
    router.back();
  };

  // Handle delete listing
  const handleDelete = async () => {
    if (!listingId) return;
    try {
      setIsDeleting(true);
      await listingsApi.delete(listingId, "1"); // Add auth token
      setShowDeleteSuccess(true);
      // Wait for the success message to show
      setTimeout(() => {
        setShowDeleteSuccess(false);
        // Add fade-out animation
        setIsRemoved(true);
        // Redirect after animation
        setTimeout(() => {
          router.push('/');
        }, 300); // Match this with the CSS transition duration
      }, 1500);
    } catch (error) {
      console.error('Error deleting listing:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Main listing details layout
  return (
    <div className={`flex items-start max-w-7xl mx-auto p-4 mt-10 transition-opacity duration-300 ${
      isRemoved ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Back button */}
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4 h-fit cursor-pointer"
        onClick={handleBackClick}
      >
        Back
      </button>
    
      {/* Main content container */}
      <div className="flex-1">
        {/* Product image and details side by side */}
        <div className="flex">
          {/* Image section with navigation */}
          <div className="w-1/2">
            <img
              src={image}
              alt={title}
              className="w-full rounded-md"
            />
            <div className="flex justify-between mt-2">
              <ChevronLeftIcon className="w-10 h-10" />
              <ChevronRightIcon className="w-10 h-10"/>
            </div>
          </div>
    
          {/* Product information */}
          <div className="w-1/2 pl-4 flex flex-col justify-start">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-lg mt-2">${price.toFixed(2)}</p>
            <p className="mt-4">{desc}</p>
          </div>
        </div>
    
        {/* Buttons section */}
        <div className="mt-6 flex justify-center gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-md">
            Message Seller
          </button>
          {String(sellerId) === String(currentUserId) && listingId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                isDeleting 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5" />
                  Delete Listing
                </>
              )}
            </button>
          )}
        </div>
        {showDeleteSuccess && (
          <div className="mt-4 text-center">
            <div className="text-green-500 text-lg font-semibold">Listing deleted successfully!</div>
            <div className="text-gray-500">Redirecting to homepage...</div>
          </div>
        )}
      </div>
    </div>
  );
}