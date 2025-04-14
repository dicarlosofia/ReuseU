/**
 * Listings Homepage Component
 * 
 * This is the main listings page that displays all available items for reuse.
 * Features include:
 * - Grid display of listings with images, titles, prices, and descriptions
 * - Filter sidebar with category and price range filters
 * - "Show My Listings" toggle to view only user's own listings
 * - Infinite scroll with "Load More" functionality
 * - Responsive grid layout
 */

import Listing from "./Listing"
import { Dropdown } from "../Dropdown/Dropdown"
import { useGlobalContext } from "@/Context/GlobalContext"
import { useContext, useEffect, useState } from "react"
import { listingsApi, Listing as ListingType } from "@/pages/api/listings";

// Price range options for filtering
interface PriceRange {
  min: number;
  max: number;
  label: string;
}

const priceRanges: PriceRange[] = [
  { min: 0, max: 10, label: "Under $10" },
  { min: 10, max: 50, label: "$10 - $50" },
  { min: 50, max: 100, label: "$50 - $100" },
  { min: 100, max: 500, label: "$100 - $500" },
  { min: 500, max: Infinity, label: "Above $500" }
];

export default function ListingsHomepage() {
  const { filters, setListings, listings } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedListings, setDisplayedListings] = useState<ListingType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMyListings, setShowMyListings] = useState(false);
  const itemsPerPage = 25;
  const currentUserId = 8675309; // Set the user ID

  // Fetch all listings on component mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const data = await listingsApi.getAll();
        console.log(data);
        setListings(data);
        setDisplayedListings(data.slice(0, itemsPerPage));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
        console.error('Error fetching listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Load more listings when "Load More" button is clicked
  const loadMore = () => {
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * itemsPerPage;
    const newListings = listings.slice(startIndex, endIndex);
    setDisplayedListings(newListings);
    setCurrentPage(nextPage);
  };

  // Filter listings based on selected filters and "Show My Listings" toggle
  const filteredListings = (showMyListings ? listings : displayedListings).filter((listing: ListingType) => {
    // First filter by user if showMyListings is true
    if (showMyListings) {
      if (String(listing.UserID) !== String(currentUserId)) {
        return false;
      }
    }

    // Then apply category and price filters
    if (filters.length === 0) return true;
    const hasMatchingCategory = listing.Category.some((category: string) => filters.includes(category));
    const hasMatchingPriceRange = filters.some((filter: string) => {
      const priceRange = priceRanges.find(range => range.label === filter);
      if (priceRange) {
        return parseFloat(listing.Price) >= priceRange.min && parseFloat(listing.Price) < priceRange.max;
      }
      return false;
    });

    return hasMatchingCategory || hasMatchingPriceRange;
  });

  // Only show load more button if we're not showing my listings
  const showLoadMore = !showMyListings && displayedListings.length < listings.length;

  // Loading state
  if (isLoading) {
    return <div className="min-h-screen pt-6 flex justify-center items-center">Loading...</div>;
  }

  // Error state
  if (error) {
    return <div className="min-h-screen pt-6 flex justify-center items-center text-red-500">Error: {error}</div>;
  }

  // No listings found state
  if (filteredListings.length === 0) {
    return (
      <div className="min-h-screen pt-6">
        <div className="flex gap-8">
          {/* Filter sidebar */}
          <div className="w-64 shrink-0 pl-2">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)]">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold text-center">Filters</h2>
              </div>
              <div className="p-4 h-full">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMyListings}
                      onChange={() => setShowMyListings(!showMyListings)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="text-gray-700 font-medium">Show My Listings</span>
                  </label>
                </div>
                <Dropdown />
              </div>
            </div>
          </div>
          <div className="flex-1 py-2 pr-4 max-w-[1400px] flex items-center justify-center">
            <p className="text-gray-500 text-lg">No listings found matching your filters</p>
          </div>
        </div>
      </div>
    );
  }

  // Main listings grid view
  return (
    <div className="min-h-screen pt-6">
      <div className="flex gap-8">
        {/* Filter sidebar */}
        <div className="w-64 shrink-0 pl-2">
          <div className="sticky top-24 bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)]">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-center">Filters</h2>
            </div>
            <div className="p-4">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMyListings}
                    onChange={() => setShowMyListings(!showMyListings)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-700 font-medium">Show My Listings</span>
                </label>
              </div>
              <Dropdown />
            </div>
          </div>
        </div>

        {/* Main content - listings grid */}
        <div className="flex-1 py-2 pr-4 max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredListings.map((listing: ListingType) => (
              <Listing
                key={listing.ListingID}
                title={listing.Title}
                price={parseFloat(listing.Price)}
                tags={listing.Category || []}
                desc={listing.Description}
                image={listing.Images?.[0] || ""}
                ListingID={listing.ListingID || ''}
              />
            ))}
          </div>
          {/* Load more button */}
          {showLoadMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}