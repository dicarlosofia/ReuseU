import Listing from "./Listing"
import { Dropdown } from "../Dropdown/Dropdown"
import { useGlobalContext } from "@/Context/GlobalContext"
import { useContext } from "react"
import { setLazyProp } from "next/dist/server/api-utils";

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
  const { filters, setListings } = useGlobalContext();
  setListings(SAMPLE_LISTINGS)

  const filteredListings = SAMPLE_LISTINGS.filter(listing => {
    if (filters.length === 0) return true;

    // check if any of the listing's tags match any of the selected filters
    const hasMatchingTag = listing.tags.some(tag => filters.includes(tag));
    
    // check if the listing's price falls within any of the selected price ranges
    const hasMatchingPriceRange = filters.some((filter: string) => {
      const priceRange = priceRanges.find(range => range.label === filter);
      if (priceRange) {
        return listing.price >= priceRange.min && listing.price < priceRange.max;
      }
      return false;
    });

    //  true if either the tags match or the price range matches
    return hasMatchingTag || hasMatchingPriceRange;
  });

  return (
    <div className="min-h-screen pt-6">
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
                tags={listing.tags}
                desc={listing.desc}
                image={listing.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}