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

import { useState } from 'react';
import { ArrowUpTrayIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { listingsApi } from '@/pages/api/listings';

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
  UserID: number;
  Images: string[];
}

export default function CreateListing({ onSubmit }: CreateListingProps) {
  
  const router = useRouter();
  const UserID = 8675309;
  // Form state management
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Available category tags for selection
  const availableTags = [
    'Electronics', 'Furniture', 'Clothing',
    'Kitchen', 'Books', 'Sports'
  ];

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
      const body = {
        Category: listingData.Category,
        Description: listingData.Description,
        Price: listingData.Price,
        SellStatus: listingData.SellStatus,
        Title: listingData.Title,
        UserID: listingData.UserID,
        Images: listingData.Images
      }
      const response = await listingsApi.create(body, "1");
      console.log(response);
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Tag selection handlers
  const chooseTag = (tag: string) => {
    setSelectedTags(prev => [...prev, tag]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Photo upload and management
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    if (currentPhotoIndex >= photos.length - 1) {
      setCurrentPhotoIndex(Math.max(0, photos.length - 2));
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert all photos to base64
    const imagePromises = photos.map(photo => fileToBase64(photo));
    const base64Images = await Promise.all(imagePromises);
    
    listingSubmit({
      Title: title,
      Description: description,
      Price: price,
      Category: selectedTags,
      UserID: UserID,
      SellStatus: 1,
      Images: base64Images
    });
  };

  // Photo carousel component for image preview
  const PhotoCarousel = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div className={`relative ${
        isFullscreen 
          ? 'h-screen w-screen flex items-center justify-center' 
          : 'h-[50vh] bg-gray-100 rounded w-[50vh]'
      }`}>
        {/* Current photo display */}
        <img
          src={URL.createObjectURL(photos[currentPhotoIndex])}
          alt={`Preview ${currentPhotoIndex + 1}`}
          className={`${
            isFullscreen 
              ? 'max-h-[90vh] max-w-[90vw]' 
              : 'w-full h-full'
          } object-contain`}
        />
        
        {/* Photo controls */}
        <div className={`absolute top-2 right-2 flex gap-2 ${isFullscreen ? 'p-4' : ''}`}>
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
                isFullscreen ? 'scale-150' : ''
              }`}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 ${
                isFullscreen ? 'scale-150' : ''
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
                  index === currentPhotoIndex ? 'ring-2 ring-white' : ''
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
          className="bg-[#2A9FD0] text-white px-4 py-2 rounded hover:bg-[#2589B4] flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-6xl font-semibold ml-4 pl-[2vh] pt-[2vh]">Create Listing</h1>
      </div>

      {showSuccess ? (
        <div className="text-center py-8">
          <div className="text-green-500 text-2xl font-semibold mb-4">Listing created successfully!</div>
          <div className="text-gray-500">Redirecting to homepage...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title and tags section */}
          <div className="flex gap-4">
            <div className="w-2/3 flex items-center gap-2">
              <label htmlFor="title" className="block text-lg mb-2">
                Listing Title:
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Default Item"
                className="w-3/5  text-black p-2.5 border rounded focus:ring-1 focus:ring-[#2A9FD0] focus:border-[#2A9FD0]"
              />
            </div>
            
            {/* Selected tags display */}
            <div className="w-1/3">
              <label className="block text-lg mb-2">
                Chosen Tags:
              </label>
              <div className="border rounded p-2 min-h-[40px]">
                {selectedTags.map((tag) => (
                  <span 
                    key={tag} 
                    onClick={() => removeTag(tag)} 
                    className="cursor-pointer inline-block bg-[#2A9FD0] text-white text-sm px-2 py-1 rounded mr-1 mb-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Available tags selection */}
            <div className="w-1/3">
              <label className="block text-lg text-black mb-2">
                Choose Tags
              </label>
              <div className="border rounded p-2 min-h-[40px]">
                {availableTags.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                  <span 
                    key={tag} 
                    onClick={() => chooseTag(tag)} 
                    className="cursor-pointer inline-block bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded mr-1 mb-1 hover:bg-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description input */}
          <div>
            <label htmlFor="description" className="block text-lg mb-2">
              Description:
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item..."
              className="w-full h-32 p-2.5 border rounded focus:ring-1 focus:ring-[#2A9FD0] focus:border-[#2A9FD0]"
            />
          </div>

          {/* Price input */}
          <div>
            <label htmlFor="price" className="block text-lg mb-2">
              Price:
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-32 p-2.5 border rounded focus:ring-1 focus:ring-[#2A9FD0] focus:border-[#2A9FD0]"
            />
          </div>

          {/* Photo upload section */}
          <div>
            <label className="block text-lg mb-2">
              Photos:
            </label>
            <div className="flex gap-4">
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
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <ArrowUpTrayIcon className="w-6 h-6" />
                  <span>Upload Photos</span>
                </label>
              </div>
              <div className="w-1/2">
                {photos.length > 0 ? (
                  <PhotoCarousel isFullscreen={isFullscreen} />
                ) : (
                  <div className="h-[50vh] bg-gray-100 rounded w-[50vh] flex items-center justify-center">
                    <span className="text-gray-400">No photos uploaded</span>
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
              className="bg-[#2A9FD0] text-white px-6 py-3 rounded-lg hover:bg-[#2589B4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
