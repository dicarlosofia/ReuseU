/**
 * Listings Homepage Component
 *
 * This is the main listings page that displays all available items for reuse.
 * Features include:
 * - Grid display of listings with images, titles, prices, and descriptions
 * - Filter sidebar with category and price range filters
 * - "Show My Listings" toggle to view only user's own listings
 * - Load More functionality
 * - Responsive grid layout
 *
 * Updated with recycling/green theme
 */

import Listing from "./Listing";
import { Dropdown } from "../Dropdown/Dropdown";
import { useGlobalContext } from "@/Context/GlobalContext";
// Homepage for browsing all listings
import React, { useEffect, useState } from "react";

// Import API for fetching listings data
import { listingsApi, Listing as ListingType } from "@/pages/api/listings";
import { FilterIcon, UserIcon } from "lucide-react";

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
  { min: 500, max: Infinity, label: "Above $500" },
];

export default function ListingsHomepage() {
  const {
    filters,
    setListings,
    listings,
    user,
    setFilters,
    searchQuery,
    setSearchQuery,
  } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMyListings, setShowMyListings] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const itemsPerPage = 25;
  const currentUserId = user ? user.uid : "";

  // Fetch all listings and favorites on component mount
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for user to be available if we're logged in
        if (user) {
          try {
            // Add a small delay to allow token to be ready
            await new Promise((resolve) => setTimeout(resolve, 500));
            const token = await user.getIdToken();
            console.log("Got token, fetching listings...");
            const data = await listingsApi.getAll(token);
            let favs: string[] = [];
            try {
              const favResp = await import("@/pages/api/accounts").then((mod) =>
                mod.accountsApi.getFavorites(user.uid, token)
              );
              favs = favResp.Favorites || [];
            } catch (favErr) {
              favs = [];
            }
            if (!isMounted) return;
            if (Array.isArray(data)) {
              setListings(data);
            } else {
              setListings([]);
            }
            setFavorites(favs);
          } catch (tokenError) {
            console.error("Error getting token:", tokenError);
            // If token fetch fails, try without token
            const data = await listingsApi.getAll();
            if (!isMounted) return;
            if (Array.isArray(data)) {
              setListings(data);
            } else {
              setListings([]);
            }
            setFavorites([]);
          }
        } else {
          // If not logged in, fetch without token
          const data = await listingsApi.getAll();
          if (!isMounted) return;
          if (Array.isArray(data)) {
            setListings(data);
          } else {
            setListings([]);
          }
          setFavorites([]);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching listings:", err);
          // Don't show error for 401s during initial load
          if (err instanceof Error && err.message.includes("401")) {
            console.log("Ignoring 401 during initial load");
            return;
          }
          setError(
            err instanceof Error ? err.message : "Failed to fetch listings"
          );

          // Retry logic for initial fetch
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying fetch (${retryCount}/${maxRetries})...`);
            setTimeout(fetchListings, 1000 * retryCount); // Exponential backoff
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Add a small initial delay before first fetch
    setTimeout(fetchListings, 1000);

    return () => {
      isMounted = false;
    };
  }, [user, setListings]);

  // Load more listings
  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Filtering logic
  let filteredListings = listings.filter((listing: ListingType) => {
    // Hide sold items
    if (listing.SellStatus === 0) return false;
    // Filter by "My Listings"
    if (showMyListings && String(listing.UserID) !== currentUserId) {
      return false;
    }

    // Filter by categories (strict AND logic)
    if (filters?.categories && filters.categories.length > 0) {
      // All selected categories must be present in the listing.Category
      if (
        !filters.categories.every((cat: string) =>
          listing.Category.includes(cat)
        )
      ) {
        return false;
      }
    }

    // Filter by price ranges
    if (filters?.priceRanges && filters.priceRanges.length > 0) {
      const price = parseFloat(listing.Price);
      const matchesPrice = priceRanges.some((range) => {
        return (
          filters.priceRanges.includes(range.label) &&
          price >= range.min &&
          price < range.max
        );
      });
      if (!matchesPrice) return false;
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      const inTitle = listing.Title?.toLowerCase().includes(q);
      const inDesc = listing.Description?.toLowerCase().includes(q);
      const inCategory = listing.Category?.some((cat: string) =>
        cat.toLowerCase().includes(q)
      );
      if (!inTitle && !inDesc && !inCategory) return false;
    }

    return true;
  });

  // Sort by favorites if enabled
  if (filters?.sortByFavorites) {
    filteredListings = [...filteredListings].sort((a, b) => {
      const aFav = favorites.includes(String(a.ListingID));
      const bFav = favorites.includes(String(b.ListingID));
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1;
    });
  }

  // Only apply pagination if we're not showing user's listings
  const displayedListings = showMyListings
    ? filteredListings
    : filteredListings.slice(0, currentPage * itemsPerPage);

  const showLoadMore =
    !showMyListings && displayedListings.length < filteredListings.length;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center bg-cyan-100">
        <div className="flex flex-col items-center text-lime-800">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-lime-500 border-t-lime-800"></div>
          <p className="text-lime-800 mt-4 font-medium">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex justify-center items-center bg-cyan-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-red-500 max-w-md text-center">
          <p className="text-xl font-medium">Error</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <div className="min-h-screen pt-10 bg-cyan-100">
        <div className="flex gap-8 max-w-7xl mx-auto px-4">
          <div className="w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm overflow-hidden border border-cyan-600">
              <div className="p-4 border-b bg-lime-800 text-white">
                <h2 className="text-xl font-semibold text-center flex items-center justify-center">
                  <FilterIcon className="w-5 h-5 mr-2" />
                  Filters
                </h2>
              </div>
              <div className="p-4 h-full">
                <div className="mb-4 p-3 bg-lime-500 rounded-lg border border-cyan-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showMyListings}
                      onChange={() => setShowMyListings(!showMyListings)}
                      className="form-checkbox h-5 w-5 text-lime-700 rounded"
                    />
                    <span className="text-cyan-800 font-medium flex items-center">
                      <UserIcon className="w-4 h-4 mr-1" />
                      Show My Listings
                    </span>
                  </label>
                </div>
                <Dropdown />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">
                No listings found matching your filters
              </p>
              <button
                onClick={() => setFilters({ categories: [], priceRanges: [] })}
                className="mt-4 px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 rounded-lg bg-cyan-100">
      <div className="flex gap-8 max-w-7xl mx-auto px-4">
        <div className="w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-lg shadow-sm overflow-hidden border border-cyan-600">
            <div className="p-4 border-b bg-lime-800 text-white">
              <h2 className="text-xl font-semibold text-center flex items-center justify-center">
                <FilterIcon className="w-5 h-5 mr-2" />
                Filters
              </h2>
            </div>
            <div className="p-4 h-full">
              <div className="mb-4 p-3 bg-cyan-100 rounded-lg border border-cyan-600">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMyListings}
                    onChange={() => {
                      setShowMyListings(!showMyListings);
                      setCurrentPage(1); // Reset pagination when toggling
                    }}
                    className="form-checkbox h-5 w-5 text-lime-700 rounded"
                  />
                  <span className="text-cyan-800 font-medium flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Show My Listings
                  </span>
                </label>
              </div>
              <Dropdown />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/*
              Listing receives UserID and ListingID from each listing.
              The Listing component is responsible for fetching the username using UserID
              and routing to /profile/{username} when the profile button is clicked.
            */}
            {displayedListings.map((listing) => (
              <Listing
                key={listing.ListingID}
                title={listing.Title}
                price={parseFloat(listing.Price)}
                tags={listing.Category}
                desc={listing.Description}
                image={listing.CoverImageUrl || "/placeholder.jpg"}
                ListingID={listing.ListingID || ""}
                UserID={listing.UserID}
                isFavorited={favorites.includes(listing.ListingID)}
                onFavoriteToggle={async (newState: boolean) => {
                  if (!user) return;
                  const token = await user.getIdToken();
                  let updatedFavorites: string[];
                  if (newState) {
                    updatedFavorites = [...favorites, listing.ListingID];
                  } else {
                    updatedFavorites = favorites.filter(
                      (id) => id !== listing.ListingID
                    );
                  }
                  setFavorites(updatedFavorites);
                  await import("@/pages/api/accounts").then((mod) =>
                    mod.accountsApi.updateFavorites(
                      user.uid,
                      updatedFavorites,
                      token
                    )
                  );
                }}
              />
            ))}
          </div>

          {showLoadMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-lime-800 text-white rounded-lg hover:bg-lime-800 transition-colors"
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
