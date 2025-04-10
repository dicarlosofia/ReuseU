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
 * 
 * The component is used in the listings grid on the homepage.
 */

import { useState } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import FullListing from "./FullListing";
import { FullListingProps } from "./FullListing";
import { useGlobalContext } from "@/Context/GlobalContext";
import { useRouter } from "next/router";

// Props interface for the Listing component
export interface ListingProps {
  title: string;
  price: number;
  tags: string[];
  desc: string;
  image?: string;
  ListingID: string;
}

export default function Listing({ title, price, tags, desc, image, ListingID }: ListingProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const router = useRouter();
  const { listings, setTitle } = useGlobalContext();

  // Toggle favorite status
  const onFavoriteClick = () => {
    setIsFavorited(!isFavorited);
  }

  // Handle title click to navigate to full listing page
  const handleTitleClick = (title: string) => {
    setTitle(title);
    console.log(ListingID);
    router.push(`/listing/${ListingID}`);
  }

  // Main listing card layout
  return (
    <div className="flex flex-row bg-white rounded-lg shadow-sm border p-4 gap-4 h-[180px]">
      {/* Image container */}
      <div className="w-1/4 aspect-square bg-gray-100 rounded-lg">
        {image && <img src={image} alt={title} className="w-full h-full object-cover rounded-lg" />}
      </div>

      {/* Content container */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="text-lg font-semibold line-clamp-1 mb-2 cursor-pointer hover:underline"
            onClick={() => handleTitleClick(title)}>
              {title}
        </h3>
        
        {/* Tags display */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-100 rounded text-sm text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        {/* Description preview */}
        <p className="text-gray-600 text-sm line-clamp-2 flex-grow">{desc}</p>
      </div>

      {/* Price and favorite button section */}
      <div className="w-20 flex flex-col items-end justify-between">
        <div className="text-lg font-bold">${price.toFixed(2)}</div>
        <button 
          onClick={onFavoriteClick}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isFavorited ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartOutline className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}