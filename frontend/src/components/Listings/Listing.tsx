import { useState, useRef, useContext } from "react";
import { HeartIcon as HeartOutline, TrashIcon, UserIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { listingsApi } from "@/pages/api/listings";
import { useGlobalContext } from "@/Context/GlobalContext";
import { chatsApi } from "@/pages/api/chats";
import { useChat } from '@/Context/ChatContext';
import { GlobalChatRefContext } from '@/pages/_app';
import { accountsApi } from "@/pages/api/accounts";

/**
 * Listing Component
 * 
 * This component displays a single listing item in a card format.
 * Features include:
 * - Thumbnail image
 * - Title (clickable to view full listing)
 * - Category tags
 * - Description preview
 * - Price display
 * - Favorite button
 * - Delete button (only for user's own listings)
 * - Profile and message buttons (for other users' listings)
 * 
 * The component is used in the listings grid on the homepage.
 */

// Props interface for the Listing component
export interface ListingProps {
  title: string;
  price: number;
  tags: string[];
  desc: string;
  image?: string; // signed S3 URL
  ListingID: string;
  UserID: string;
}

export default function Listing({ title, price, tags, desc, image, ListingID, UserID }: ListingProps) {
  const globalChatRef = useContext(GlobalChatRefContext);
  const router = useRouter();
  const { listings, setTitle, setListings } = useGlobalContext();
  const { user } = useGlobalContext();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const currentUserId = user ? user.uid : "";

  // Toggle favorite status
  const onFavoriteClick = () => {
    setIsFavorited(!isFavorited);
  };

  // Handle title click to navigate to full listing page
  const handleTitleClick = (title: string) => {
    setTitle(title);
    router.push(`/listing/${ListingID}`);
  };

  // Handle delete listing
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (!user) {
        console.error('User not authenticated');
        setIsDeleting(false);
        return;
      }
      const token = await user.getIdToken();
      await listingsApi.delete(ListingID, token);
      setShowDeleteSuccess(true);
      setTimeout(() => {
        setShowDeleteSuccess(false);
        setIsRemoved(true);
        setTimeout(() => {
          setListings(listings.filter((listing: any) => listing.ListingID !== ListingID));
        }, 300);
      }, 2000);
    } catch (error) {
      console.error('Error deleting listing:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const { openChat } = useChat();

  const handleStartChat = async () => {
    try {
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      const token = await user.getIdToken();
      const newChat = await chatsApi.create({
        listing_id: String(ListingID),
        buyer_id: String(currentUserId),
        seller_id: String(UserID)
      }, token);
      openChat(newChat);
      if (globalChatRef && globalChatRef.current) {
        globalChatRef.current.fetchChats();
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleViewProfile = async () => {
    try {
      // Fetch account by UserID (from listing)
      if(!user){
        return;
      }
      const token = await user.getIdToken();
      const data = await accountsApi.getAccount(UserID, token);
      console.log(data);
      if (data && data.Username) {
        router.push(`/profile/${data.Username}`);
      } else {
        alert("Profile not found");
      }
    } catch (e) {
      alert("Profile not found");
    }
  };


  // Main listing card layout
  return (
    <div className={`flex flex-row bg-white rounded-lg shadow-sm border p-4 gap-4 h-[180px] relative transition-opacity duration-300 ${
      isRemoved ? 'opacity-0' : 'opacity-100'
    }`}>
      {showDeleteSuccess && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <span className="text-white font-semibold">Listing deleted successfully!</span>
        </div>
      )}

      {/* Image container */}
      <div className="w-1/4 aspect-square bg-lime-100 rounded-lg">
        {image && <img src={image} alt={title} className="text-cyan-300 w-full h-full object-cover rounded-lg" />}
      </div>

      {/* Content container */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3
          className="text-cyan-800 text-lg font-semibold line-clamp-1 mb-2 cursor-pointer hover:underline"
          onClick={() => handleTitleClick(title)}
        >
          {title}
        </h3>

        {/* Tags display */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Array.isArray(tags) && tags.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-lime-300 rounded text-sm text-cyan-950">
              {tag}
            </span>
          ))}
        </div>

        {/* Description preview */}
        <p className="text-cyan-800 text-sm line-clamp-2 flex-grow">{desc}</p>
      </div>

      {/* Price and buttons section */}
      <div className="w-20 flex flex-col items-end justify-between">
        <div className="text-lime-700 text-lg font-bold">${price.toFixed(2)}</div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={onFavoriteClick}
            className="text-cyan-800 p-1.5 hover:bg-cyan-100 rounded-full transition-colors"
          >
            {isFavorited ? (
              <HeartSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartOutline className="w-5 h-5" />
            )}
          </button>
          {UserID !== currentUserId && (
            <>
              <button
                onClick={handleViewProfile}
                className="p-1.5 hover:bg-cyan-100 rounded-full transition-colors"
                title="View Profile"
              >
                <UserIcon className="w-5 h-5 text-cyan-800" />
              </button>
              <button
                onClick={handleStartChat}
                className="p-1.5 hover:bg-cyan-100 rounded-full transition-colors"
                title="Message Seller"
              >
                <ChatBubbleLeftIcon className="w-5 h-5 text-cyan-800" />
              </button>
            </>
          )}
          {UserID === currentUserId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-1.5 rounded-full transition-colors ${
                isDeleting 
                  ? 'bg-cyan-100 cursor-not-allowed' 
                  : 'hover:bg-red-100 text-red-500'
              }`}
              title="Delete listing"
            >
              {isDeleting ? (
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <TrashIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
