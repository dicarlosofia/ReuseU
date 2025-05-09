/**
 * Create Listing Component
 *
 * This component provides a form for users to create new listings.
 * Features include:
 * - Title input
 * - Description input
 * - Price input
 * - Category tag selection
 * - Photo upload with preview carousel
 * - Fullscreen photo viewing
 * - Form validation
 * - Back navigation
 *
 * The component handles the creation of new listings and uploads them to the server.
 */

// Form for users to create a new listing
import React, { useState , useMemo} from "react";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { listingsApi } from "@/pages/api/listings";
import { useGlobalContext } from "@/Context/GlobalContext";
import { useEffect, useRef } from 'react';        
import { pricefillApi } from '@/pages/api/pricefill';
console.log('💡 pricefillApi is:', pricefillApi)
console.log('💡 listingsApi is:', listingsApi)

// Props interface for the CreateListing component
interface CreateListingProps {
  onSubmit?: (listingData: ListingData) => void;
  tags?: string[];
}

// Data structure for a new listing
export interface ListingData {
  Category: string[];
  Description: string;
  Price: string;
  SellStatus: number;
  Title: string;
  UserID: string;
  Images: string[];
}

//required data to create a price fill request
export interface PriceFillRequest {
  category: string
  name: string
  description?: string
}

//required data to get the price range
export interface PriceRange {
  minPrice: number
  maxPrice: number
}

export default function CreateListing({ onSubmit }: CreateListingProps) {
  const router = useRouter();
  // Form state management
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useGlobalContext();
  const [showSuccess, setShowSuccess] = useState(false);



  /* ───────────────────────── price suggestion logic ────────── */

  //setprice suggesting
  const [priceSuggestion, setPriceSuggestion] = useState<PriceRange | null>(null);
  const lastPayloadRef = useRef<PriceFillRequest | null>(null);
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  //the debouncer code to prevent api spamming for price
  const debouncedFetchPrice = useMemo(
    () =>
      debounce(async (payload: PriceFillRequest) => {
        try {
          const token = await user!.getIdToken();
          const range = await pricefillApi.getPriceRange(payload, token);
          setPriceSuggestion(range);
        } catch (e) {
          console.error('Failed to fetch price range', e);
        }
      }, 500), //one second timer..waiting for typing to finish
    [user]
  );

  useEffect(() => {
    if (!user) return;
    if (!title.trim() || selectedTags.length === 0) return;

    // we enforce pricefill format
    const payload: PriceFillRequest = {
      category: selectedTags[0],
      name: title.trim(),
    };
    if (description.trim()) payload.description = description.trim();

    if (JSON.stringify(payload) === JSON.stringify(lastPayloadRef.current)) return;
    lastPayloadRef.current = payload;

    debouncedFetchPrice(payload);

  }, [title, selectedTags, description, user, debouncedFetchPrice]);

/* ─────────────────────────────────────────────────────────── */

  const UserID = user ? user.uid : "";
  // Available categories and subcategories for selection (synced with Dropdown)
  const categoryGroups = [
    {
      name: "Electronics",
      subcategories: ["Laptops", "Phones", "Tablets", "TVs"],
    },
    {
      name: "Furniture",
      subcategories: ["Tables", "Chairs", "Desks", "Beds", "Storage"],
    },
    {
      name: "Clothing",
      subcategories: ["Tops", "Bottoms", "Dresses", "Shirts"],
    },
    {
      name: "Home & Kitchen",
      subcategories: ["Appliances", "Cookware", "Dinnerware", "Utensils"],
    },
    {
      name: "Arts & Crafts",
      subcategories: ["Art", "Crafts", "Books"],
    },
    {
      name: "Other",
      subcategories: ["Other"],
    },
  ];
  // Flatten all subcategories for dropdown options
  const availableTags = categoryGroups.flatMap((group) => group.subcategories);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string); // base64 string
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  // Submit new listing to the server
  const listingSubmit = async (listingData: ListingData) => {
    setIsLoading(true);
    try {
      console.log("Starting listing submission...");
      console.log("Listing data:", listingData);
      if (!UserID) {
        console.error("no userID bruh");
      }
      const body = {
        Category: listingData.Category,
        Description: listingData.Description,
        Price: listingData.Price,
        SellStatus: listingData.SellStatus,
        Title: listingData.Title,
        UserID: UserID,
        Images: listingData.Images,
      };

      if (!user) {
        return false;
      }
      const token = await user.getIdToken();
      const response = await listingsApi.create(body, token);
      console.log("Server response:", response);

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error creating listing:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Tag selection handlers
  const chooseTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  // Photo upload and management
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (currentPhotoIndex >= photos.length - 1) {
      setCurrentPhotoIndex(Math.max(0, photos.length - 2));
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      console.error("No user ID found");
      return;
    }

    try {
      const base64ImagesWithPrefix = await Promise.all(
        photos.map(fileToBase64)
      );

      // Remove "data:image/jpeg;base64," from the front if needed
      const cleanBase64Images = base64ImagesWithPrefix.map((img) => {
        const base64Index = img.indexOf("base64,");
        return base64Index !== -1 ? img.substring(base64Index + 7) : img;
      });

      // Convert images to required dictionary format: { filename: base64 }
      const imagesDict: Record<string, string> = {};
      photos.forEach((file, i) => {
        imagesDict[file.name || `image${i}.jpg`] = cleanBase64Images[i];
      });

      // Validate required fields
      if (
        !title ||
        !description ||
        !price ||
        !selectedTags.length ||
        !Object.keys(imagesDict).length
      ) {
        alert("All fields and at least one image are required.");
        return;
      }

      const listingData: ListingData = {
        Title: title,
        Description: description,
        Price: price,
        Category: selectedTags,
        UserID: user.uid,
        SellStatus: 1,
        Images: imagesDict as any, // backend expects dict, not array
      };

      listingSubmit(listingData);
    } catch (error) {
      console.error("Error preparing listing data:", error);
    }
  };

  // Photo carousel component for image preview
  const PhotoCarousel = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
      }`}
    >
      <div
        className={`relative ${
          isFullscreen
            ? "h-screen w-screen flex items-center justify-center"
            : "h-[50vh] bg-cyan-100 rounded w-[50vh]"
        }`}
      >
        {/* Current photo display */}
        <img
          src={URL.createObjectURL(photos[currentPhotoIndex])}
          alt={`Preview ${currentPhotoIndex + 1}`}
          className={`${
            isFullscreen ? "max-h-[90vh] max-w-[90vw]" : "w-full h-full"
          } object-contain`}
        />

        {/* Photo controls */}
        <div
          className={`absolute top-2 right-2 flex gap-2 ${
            isFullscreen ? "p-4" : ""
          }`}
        >
          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>

          {/* Remove photo button */}
          <button
            type="button"
            onClick={() => removePhoto(currentPhotoIndex)}
            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Photo navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 ${
                isFullscreen ? "scale-150" : ""
              }`}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 ${
                isFullscreen ? "scale-150" : ""
              }`}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Thumbnail strip in fullscreen mode */}
        {isFullscreen && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto p-2 bg-black/50 rounded-lg">
            {photos.map((photo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentPhotoIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 ${
                  index === currentPhotoIndex ? "ring-2 ring-white" : ""
                }`}
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Main form layout
  return (
    <div className="max-w-7xl mx-auto p-6 mt-[calc(100vh/16)] bg-white rounded-lg shadow-sm">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="bg-lime-800 text-white px-4 py-2 rounded hover:bg-cyan-600 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-cyan-800 text-6xl font-semibold ml-4 pl-[2vh] pt-[2vh]">
          Create Listing
        </h1>
      </div>

      {showSuccess ? (
        <div className="text-center py-8">
          <div className="text-green-500 text-2xl font-semibold mb-4">
            Listing created successfully!
          </div>
          <div className="text-gray-500">Redirecting to homepage...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label htmlFor="title" className="text-cyan-800 block text-lg mb-2">
              Listing Title:
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Default Item"
              className="w-full text-cyan-800 p-2.5 border rounded focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600"
            />
          </div>

          {/* Tag selection dropdown */}
          <div>
            <label className="block text-cyan-950 font-semibold mb-2">
              Categories/Tags
            </label>
            <div className="flex flex-row flex-wrap gap-2 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-lime-100 text-cyan-950 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-red-600 hover:text-red-800"
                    onClick={() => removeTag(tag)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <select
              className="w-full border border-gray-300 rounded-md p-2"
              value=""
              onChange={(e) => {
                chooseTag(e.target.value);
              }}
            >
              <option value="" disabled>
                Add a tag...
              </option>
              {categoryGroups.map((group) => (
                <optgroup key={group.name} label={group.name}>
                  {group.subcategories.map((sub) => (
                    <option
                      key={sub}
                      value={sub}
                      disabled={selectedTags.includes(sub)}
                    >
                      {sub}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Description input */}
          <div>
            <label
              htmlFor="description"
              className="text-cyan-800 block text-lg mb-2"
            >
              Description:
            </label>
            <textarea
              className="border rounded px-3 py-2 w-full mb-4 truncate-description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              style={{
                maxWidth: "100%",
                minHeight: "48px",
                overflow: "hidden",
                resize: "vertical",
              }}
            />
          </div>

          {/* Price input */}
          <div>
            <label htmlFor="price" className="text-cyan-800 block text-lg mb-2">
              Price:
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="text-cyan-800 w-32 p-2.5 border rounded focus:ring-1 focus:ring-[#2A9FD0] focus:border-[#2A9FD0]"
            />
          </div>

           {/* Model‑suggested price range */}
           <div>
            <label className="text-cyan-800 block text-lg mb-2">
              Model‑Suggested Price&nbsp;(optional):
            </label>

            {priceSuggestion ? (
              <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
                Suggested range:&nbsp;
                <strong>{`$${priceSuggestion.minPrice.toFixed(2)}`}</strong>
                &nbsp;–&nbsp;
                <strong>{`$${priceSuggestion.maxPrice.toFixed(2)}`}</strong>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-gray-500">
                Enter a title and choose a category to see a suggested price range.
              </div>
            )}
            

          </div>

           {/* Model‑suggested price range */}
           <div>
            <label className="text-cyan-800 block text-lg mb-2">
              Model‑Suggested Price&nbsp;(optional):
            </label>

            {priceSuggestion ? (
              <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4 text-yellow-800">
                Suggested range:&nbsp;
                <strong>{`$${priceSuggestion.minPrice.toFixed(2)}`}</strong>
                &nbsp;–&nbsp;
                <strong>{`$${priceSuggestion.maxPrice.toFixed(2)}`}</strong>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 text-gray-500">
                Enter a title and choose a category to see a suggested price range.
              </div>
            )}
            

          </div>

          {/* Photo upload section */}
          <div>
            <label className="text-cyan-800 block text-lg mb-2">Photos:</label>
            <div className="flex flex-wrap gap-2 mb-4 max-w-full overflow-hidden">
              <div className="w-1/2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="text-cyan-800 flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-cyan-50"
                >
                  <ArrowUpTrayIcon className="w-6 h-6" />
                  <span>Upload Photos</span>
                </label>
              </div>
              <div className="w-1/2">
                {photos.length > 0 ? (
                  <PhotoCarousel isFullscreen={isFullscreen} />
                ) : (
                  <div className="h-[50vh] bg-lime-100 rounded w-[50vh] flex items-center justify-center">
                    <span className="text-lime-500">No photos uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-lime-800 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </button>
          </div>
        </form>
      )}
      
    </div>
  );
}
