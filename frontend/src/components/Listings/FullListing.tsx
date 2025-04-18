/**
 * Full Listing Component
 * 
 * This component displays the complete details of a single listing.
 * Features include:
 * - Large product image with navigation arrows and image counter
 * - Detailed product information (title, price, description)
 * - Tag pills for categorization
 * - Back button to return to listings
 * - Message seller button
 * - Recycling-inspired design with leaf motifs and eco-friendly color palette
 * - Smooth animations for transitions and interactions
 * 
 * The component is used on the individual listing page.
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ChevronLeft, ChevronRight, ArrowLeft, MessageCircle, Leaf } from "lucide-react";

// Props interface for the FullListing component
export interface FullListingProps {
  title: string;
  price: number;
  tags: string[];
  desc: string;
  image: string;
  sellerId: string;
  // For demo purposes - in a real app you'd likely fetch these from an API
  additionalImages?: string[];
}

export default function FullListing({ 
  title, 
  price, 
  tags, 
  desc, 
  image, 
  sellerId,
  additionalImages = [] 
}: FullListingProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Combine main image with additional images
  const allImages = [image, ...(additionalImages || [])];
  
  // Handle back button click to return to previous page
  const handleBackClick = () => {
    router.back();
  };
  
  // Navigation for image carousel
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };
  
  // Animation effect on component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Function to handle messaging the seller
  const handleMessageSeller = () => {
    // Logic to initiate messaging with seller
    console.log(`Messaging seller with ID: ${sellerId}`);
  };

  return (
    <div className={`max-w-7xl pt-[20vh] mx-auto p-6 transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Back button with animation */}
      <button 
        className="flex items-center text-emerald-700 hover:text-emerald-500 mb-6 group transition-all duration-300"
        onClick={handleBackClick}
      >
        <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">Back to Listings</span>
      </button>
    
      {/* Main content container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100">
        <div className="lg:flex">
          {/* Image section with navigation */}
          <div className="lg:w-1/2 relative bg-emerald-50">
            <div className="relative h-96 lg:h-full overflow-hidden">
              <img
                src={allImages[currentImageIndex]}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              
              {/* Image navigation */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
                <button 
                  onClick={handlePrevImage}
                  className="bg-white/90 hover:bg-emerald-500 hover:text-white rounded-full p-2 shadow-md transition-colors duration-300"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
                
                <button 
                  onClick={handleNextImage}
                  className="bg-white/90 hover:bg-emerald-500 hover:text-white rounded-full p-2 shadow-md transition-colors duration-300"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
    
          {/* Product information */}
          <div className="lg:w-1/2 p-6 lg:p-8">
            <div className="flex items-center mb-4">
              <Leaf className="text-emerald-500 w-5 h-5 mr-2" />
              <span className="text-sm font-medium text-emerald-500">Recycled Item</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-emerald-600">${price.toFixed(2)}</span>
              <div className="ml-4 bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
                Available Now
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 hover:bg-emerald-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* Description with stylized first letter */}
            <div className="prose mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="text-emerald-600 text-xl font-serif">{desc.charAt(0)}</span>
                {desc.slice(1)}
              </p>
            </div>
            
            {/* Recycling impact information */}
            <div className="bg-emerald-50 rounded-lg p-4 mb-6 border-l-4 border-emerald-500">
              <h3 className="text-sm font-medium text-emerald-800 mb-1">Environmental Impact</h3>
              <p className="text-xs text-emerald-700">
                By purchasing this recycled item, you're helping reduce waste and supporting sustainable practices.
              </p>
            </div>
            
            {/* Call to action */}
            <div className="mt-6">
              <button 
                onClick={handleMessageSeller}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Message Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}