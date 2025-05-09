// Card component for displaying a single listing in a list
// This component expects the following props:
// - title: The title of the listing
// - price: The price of the listing
// - tags: An array of category tags for the listing
// - desc: A brief description of the listing
// - image: A signed S3 URL for the listing's thumbnail image (optional)
// - ListingID: The unique ID of the listing
// - UserID: The unique ID of the user who created the listing

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
  isFavorited: boolean;
  onFavoriteToggle: (newState: boolean) => void | Promise<void>;
}

export default function Listing({ title, price, tags, desc, image, ListingID, UserID, isFavorited, onFavoriteToggle }: ListingProps) {
  const globalChatRef = useContext(GlobalChatRefContext);
  const router = useRouter();
  const { listings, setTitle, setListings } = useGlobalContext();
  const { user } = useGlobalContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const currentUserId = user ? user.uid : "";

  // Toggle favorite status
  const onFavoriteClick = () => {
    onFavoriteToggle(!isFavorited);
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
      // Backend expects only listing_id and seller_id; buyer is inferred from JWT
      const newChat = await chatsApi.create({
        listing_id: String(ListingID),
        seller_id: String(UserID)
      }, token);
      openChat(newChat);
      // Ensure chat drawer opens immediately
      if (globalChatRef && globalChatRef.current) {
        globalChatRef.current.fetchChats();
      } else {
        // Retry if ref is not ready
        setTimeout(() => {
          if (globalChatRef && globalChatRef.current) {
            globalChatRef.current.fetchChats();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleViewProfile = async () => {
    try {
      // Fetch account by UserID (from listing)
      if (!user) {
        return;
      }
      const token = await user.getIdToken();
      let data = null;
      try {
        data = await accountsApi.getAccountByUsername(UserID, token);
        console.log(data);
      } catch (err) {
        console.error('Account not found for user:', UserID, err);
        router.push('/404'); // or show a not found page
        return;
      }
      if (data && data.Username) {
        router.push(`/profile/${data.Username}`);
      } else {
        router.push('/404');
      }
    } catch (error) {
      console.error('Error viewing profile:', error);
    }
  };

  // Main listing card layout
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);
    setReportLoading(true);
    try {
      if (!user) throw new Error('You must be logged in to report.');
      const token = await user.getIdToken();
      // @ts-ignore
      const { reportApi } = await import('@/pages/api/report');
      await reportApi.reportListing(ListingID, reportReason, reportDescription, token);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason('');
        setReportDescription('');
      }, 1800);
    } catch (err: any) {
      setReportError(err.message || 'Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      <div
        className={`group flex flex-col sm:flex-row bg-white rounded-lg shadow-sm border p-3 sm:p-4 gap-2 sm:gap-4 min-h-[120px] sm:h-[180px] relative transition-opacity duration-300 ${
          isRemoved ? 'opacity-0' : 'opacity-100'
        } cursor-pointer sm:cursor-default`}
        tabIndex={0}
        role="button"
        aria-label={`View listing: ${title}`}
        onClick={() => {
          if (window.innerWidth < 640) handleTitleClick(title);
        }}
        onKeyPress={e => {
          if (window.innerWidth < 640 && (e.key === 'Enter' || e.key === ' ')) handleTitleClick(title);
        }}
      >
      {showDeleteSuccess && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <span className="text-white font-semibold">Listing deleted successfully!</span>
        </div>
      )}
      {/* Image container */}
      <div className="w-1/4 aspect-square bg-lime-100 rounded-lg">
        {image && <img src={image} alt={title} className="text-cyan-300 w-full h-full object-cover rounded-lg" />}
      </div>

      {/* Content container - improved responsive layout */}
      <div className="flex-1 flex flex-col min-w-0 justify-between">
        <div>
          <h3
            className="text-cyan-800 text-lg font-semibold mb-1 cursor-pointer hover:underline break-words whitespace-nowrap overflow-hidden text-ellipsis max-h-[2.7em] leading-tight"
            onClick={() => handleTitleClick(title)}
            title={title}
            style={{ wordBreak: 'break-word' }}
          >
            {title}
          </h3>
          <div className="relative mb-1">
            <div
              className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-lime-200 pr-8"
              style={{ maxWidth: '100%' }}
              tabIndex={0}
              aria-label="Listing tags"
            >
              {Array.isArray(tags) && tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-lime-300 rounded text-xs text-cyan-950 whitespace-nowrap max-w-[120px] truncate"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Fade-out effect for overflow */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white via-white/80 to-transparent" />
          </div>
          <p className="text-cyan-800 text-xs md:text-sm line-clamp-2 mt-1">{desc}</p>
        </div>
        {/* Report button for all users - bottom left of content column */}
        <div className="mt-2 self-start">
          <button
            className="bg-white border border-red-300 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-100 transition-colors"
            title="Report this listing"
            type="button"
            onClick={e => {
              e.stopPropagation();
              setShowReportModal(true);
            }}
          >
            Report
          </button>
        </div>
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

    {/* Report Modal */}
    {showReportModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            onClick={() => setShowReportModal(false)}
            aria-label="Close report modal"
            type="button"
          >
            ×
          </button>
          <h2 className="text-lg font-bold text-cyan-800 mb-2">Report Listing</h2>
          {reportSuccess ? (
            <div className="text-green-700 font-semibold">Report submitted. Thank you!</div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <label className="block">
                <span className="text-cyan-900 text-sm font-medium">Reason<span className="text-red-500">*</span></span>
                <input
                  className="w-full p-2 border rounded mt-1"
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Reason for report"
                />
              </label>
              <label className="block">
                <span className="text-cyan-900 text-sm font-medium">Description (optional)</span>
                <textarea
                  className="w-full p-2 border rounded mt-1"
                  rows={3}
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  placeholder="Describe the issue (optional)"
                />
              </label>
              {reportError && <div className="text-red-600 text-xs">{reportError}</div>}
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-60"
                disabled={reportLoading || !reportReason}
              >
                {reportLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          )}
        </div>
      </div>
    )}
  </>
  );
}

