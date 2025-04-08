import { useState } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import FullListing from "./FullListing";
import { FullListingProps } from "./FullListing";
import { useGlobalContext } from "@/Context/GlobalContext";
import { useRouter } from "next/router";


export interface ListingProps {
  title: string;
  price: number;
  tags: string[];
  desc: string;
  image?: string;
}

export default function Listing({ title, price, tags, desc, image }: ListingProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const router = useRouter()

  const {listings, setTitle} = useGlobalContext()

  const onFavoriteClick = () => {
    
    setIsFavorited(!isFavorited);
  }

  const handleTitleClick = (title : string) => {
    setTitle(title)
    router.push("/listing")
}

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
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-100 rounded text-sm text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 flex-grow">{desc}</p>
      </div>

      {/* Price and favorite section */}
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