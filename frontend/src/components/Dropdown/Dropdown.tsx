import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext";
import { ChevronDownIcon, ChevronUpIcon, TagIcon, BanknoteIcon } from "lucide-react";

export function Dropdown() {
  const { filters, setFilters } = useGlobalContext();
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  const categories = [
    "Electronics", 
    "Furniture", 
    "Clothing", 
    "Books", 
    "Home Decor", 
    "Kitchen", 
    "Sports", 
    "Toys"
  ];

  const priceRanges = [
    "Under $10",
    "$10 - $50",
    "$50 - $100",
    "$100 - $500",
    "Above $500"
  ];

  const handleFilterToggle = (filter) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter(f => f !== filter));
    } else {
      setFilters([...filters, filter]);
    }
  };

  return (
    <div className="text-gray-700">
      {/* Categories section */}
      <div className="mb-4 border border-emerald-100 rounded-lg overflow-hidden">
        <button
          className="flex items-center justify-between w-full p-3 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        >
          <span className="font-medium flex items-center">
            <TagIcon className="h-4 w-4 mr-2 text-emerald-600" />
            Categories
          </span>
          {isCategoryOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-emerald-600" />
          )}
        </button>

        {isCategoryOpen && (
          <div className="p-3">
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.includes(category)}
                    onChange={() => handleFilterToggle(category)}
                    className="form-checkbox h-4 w-4 text-emerald-600 rounded"
                  />
                  <span className={filters.includes(category) ? "text-emerald-700" : "text-gray-600"}>
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price ranges section */}
      <div className="mb-4 border border-emerald-100 rounded-lg overflow-hidden">
        <button
          className="flex items-center justify-between w-full p-3 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
        >
          <span className="font-medium flex items-center">
            <BanknoteIcon className="h-4 w-4 mr-2 text-emerald-600" />
            Price Range
          </span>
          {isPriceOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-emerald-600" />
          )}
        </button>

        {isPriceOpen && (
          <div className="p-3">
            <div className="space-y-2">
              {priceRanges.map((price) => (
                <label key={price} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.includes(price)}
                    onChange={() => handleFilterToggle(price)}
                    className="form-checkbox h-4 w-4 text-emerald-600 rounded"
                  />
                  <span className={filters.includes(price) ? "text-emerald-700" : "text-gray-600"}>
                    {price}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset filters button */}
      {filters.length > 0 && (
        <button
          className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors text-sm font-medium"
          onClick={() => setFilters([])}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
