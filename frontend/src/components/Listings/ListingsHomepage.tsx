import { useState, useEffect } from 'react';
import Listing from "./Listing"
import { Dropdown } from "../Dropdown/Dropdown"
import { useGlobalContext } from "@/Context/GlobalContext"
import { listingsApi, Listing as ListingType } from "@/api/listings"
import { reviewsApi } from "@/api/reviews";

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

const SAMPLE_LISTINGS = [
  {
    title: "Air Force 1s",
    price: 20.00,
    tags: ["Clothing", "Shoes"],
    desc: "These are cool!",
    image: ""
  },
  {
    title: "Dell Laptop",
    price: 200.00,
    tags: ["Electronics", "Laptops"],
    desc: "Super fast, 5 years old...",
    image: ""
  },
  {
    title: "Chess Set",
    price: 50.00,
    tags: ["Furniture", "Tables"],
    desc: "Made of wood!",
    image: ""
  },
  {
    title: "Pet Rock",
    price: 1.69,
    tags: ["Miscellaneous", "Other"],
    desc: "",
    image: ""
  }
];

export default function ListingsHomepage() {
  const { filters } = useGlobalContext();
  const [listings, setListings] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await listingsApi.getAll();
        console.log(data);
        const newListings = data.listings;
        setListings(newListings)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // Fallback to sample data if API fails
        setListings(SAMPLE_LISTINGS as unknown as ListingType[]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const getListing = async () => {
    const listing = await listingsApi.getById("listing1");
    console.log(listing);
    return listing;
  }

  const filteredListings = Array.isArray(listings) ? listings.filter(listing => {
    if (filters.length === 0) return true;

    // Check if any of the listing's tags match any of the selected filters
    const hasMatchingTag = listing.category.some(tag => filters.includes(tag));
    
    // Check if the listing's price falls within any of the selected price ranges
    const hasMatchingPriceRange = filters.some((filter: string) => {
      const priceRange = priceRanges.find(range => range.label === filter);
      if (priceRange) {
        return listing.price >= priceRange.min && listing.price < priceRange.max;
      }
      return false;
    });

    // Return true if either the tags match or the price range matches
    return hasMatchingTag || hasMatchingPriceRange;
  }) : [];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen pt-6">
      <button onClick={getListing}>Get Listing</button>
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0 pl-2">
          <div className="sticky top-24 bg-white rounded-lg shadow-sm h-[calc(100vh-8rem)]">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-center">Filters</h2>
            </div>
            <div className="p-4 h-full">
              <Dropdown />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 py-2 pr-4 max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredListings.map((listing, index) => (
              <Listing
                key={index}
                title={listing.title}
                price={listing.price}
                tags={listing.category}
                desc={listing.description || listing.desc || "" }
                image={listing.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}