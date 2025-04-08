import { useState } from 'react';
import { ArrowUpTrayIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { listingsApi } from '@/api/listings';
interface CreateListingProps {
  onSubmit?: (listingData: ListingData) => void;
  tags?: string[];
}

interface ListingData {
  title: string;
  description: string;
  price: string;
  photos: File[];
  tags: string[];
}

export default function CreateListing({ onSubmit }: CreateListingProps) {
  const router = useRouter();
  const createListing = async () => {
    const listingData = {
      title: title,
      description: description,
      price: Number(price),
      category: selectedTags,
      seller_id: "user123", // TODO: Replace with actual user ID
      image: photos[0] ? URL.createObjectURL(photos[0]) : ""
    }
    const response = await listingsApi.create(listingData, "dummy-token"); // TODO: Replace with actual token
    console.log(response);
  }
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Todo: Get available tags from the database
  const availableTags = [
    'Electronics', 'Furniture', 'Clothing',
    'Kitchen', 'Books', 'Sports'
  ];

  const handleBack = () => {
    router.back();
  };

  const listingSubmit = () => {
    console.log(createListing());
  }

  const chooseTag = (tag: string) => {
    setSelectedTags(prev => [...prev, tag]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Handle photo upload
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(createListing());
  };

  const PhotoCarousel = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div className={`relative ${
        isFullscreen 
          ? 'h-screen w-screen flex items-center justify-center' 
          : 'h-[50vh] bg-gray-100 rounded w-[50vh]'
      }`}>
        {/* Current Photo */}
        <img
          src={URL.createObjectURL(photos[currentPhotoIndex])}
          alt={`Preview ${currentPhotoIndex + 1}`}
          className={`${
            isFullscreen 
              ? 'max-h-[90vh] max-w-[90vw]' 
              : 'w-full h-full'
          } object-contain`}
        />
        
        {/* Controls Container - Always Visible */}
        <div className={`absolute top-2 right-2 flex gap-2 ${isFullscreen ? 'p-4' : ''}`}>
          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
          </button>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removePhoto(currentPhotoIndex)}
            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Arrows */}
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

        {/* Thumbnails - Only show in fullscreen */}
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Input and Tags Section */}
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
          
          {/* Selected Tags */}
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

          {/* Available Tags */}
          <div className="w-1/3">
            <label className="block text-lg text-black mb-2">
              Choose Tags
            </label>
            <div className="border rounded p-2 min-h-[40px]">
              {availableTags.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                <span 
                  key={tag} 
                  onClick={() => chooseTag(tag)} 
                  className="cursor-pointer inline-block bg-[#2A9FD0] text-white text-sm px-2 py-1 rounded mr-1 mb-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div>
          <label className="block text-lg mb-2">
            Upload Photos:
          </label>
          <div className="flex gap-4 h-[50vh] w-full">
            <div className="border-2 border-dashed rounded p-6 text-center bg-gray-50 w-1/4 h-1/2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400" />
              </label>
            </div>

            {/* Photo Preview Carousel */}
            {photos.length > 0 && (
              <div className="flex-1 relative pl-[5vh]">
                <PhotoCarousel isFullscreen={isFullscreen} />
                
                {/* Thumbnail Strip - Only show when not fullscreen */}
                {!isFullscreen && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative w-20 h-20 flex-shrink-0 ${
                          index === currentPhotoIndex ? 'ring-2 ring-[#2A9FD0]' : ''
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
            )}
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-lg mb-2">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mention brand/quality/condition/size or any technical specifications if needed"
            className="w-full text-black p-2.5 border rounded h-24 focus:ring-1 focus:ring-[#2A9FD0] focus:border-[#2A9FD0]"
          />
        </div>

        {/* Price Input */}
        <div>
          <label htmlFor="price" className="block text-lg mb-2">
            Price:
          </label>
          <div className="w-48">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="text"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="00.00"
                className="w-full text-black p-2.5 pl-7 border rounded focus:ring-1 focus:ring-[#2A9FD0] focus:border-[#2A9FD0]"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Based on other listings we recommend a price of $40.00 for this item
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#2A9FD0] text-white px-8 py-2.5 rounded text-lg font-medium hover:bg-[#2589B4] transition-colors"
          >
            SUBMIT
          </button>
        </div>
      </form>

      {/* Fullscreen Overlay Exit Button */}
      {isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
