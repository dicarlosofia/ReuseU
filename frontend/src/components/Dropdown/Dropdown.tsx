import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext";
import { ChevronDownIcon, ChevronUpIcon, TagIcon, BanknoteIcon } from "lucide-react";

interface Filters {
  categories: string[];
  priceRanges: string[];
}

interface CategoryGroup {
  name: string;
  subcategories: string[];
}

export function Dropdown() {
  const { filters, setFilters } = useGlobalContext();
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Main categories with their subcategories
  const categoryGroups: CategoryGroup[] = [
    {
      name: "Electronics",
      subcategories: ["Laptops", "Phones", "Tablets", "TVs"]
    },
    {
      name: "Furniture",
      subcategories: ["Tables", "Chairs", "Desks", "Beds", "Storage"]
    },
    {
      name: "Clothing",
      subcategories: ["Tops", "Bottoms", "Dresses", "Shirts"]
    },
    {
      name: "Home & Kitchen",
      subcategories: ["Appliances", "Cookware", "Dinnerware", "Utensils"]
    },
    {
      name: "Arts & Crafts",
      subcategories: ["Art", "Crafts", "Books"]
    },
    {
      name: "Other",
      subcategories: ["Other"]
    }
  ];

  const priceRanges = [
    "Under $10",
    "$10 - $50",
    "$50 - $100",
    "$100 - $500",
    "Above $500"
  ];

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters?.categories || [];
    if (currentCategories.includes(category)) {
      setFilters({
        ...filters,
        categories: currentCategories.filter((c: string) => c !== category)
      });
    } else {
      setFilters({
        ...filters,
        categories: [...currentCategories, category]
      });
    }
  };

  const handlePriceRangeToggle = (priceRange: string) => {
    const currentPriceRanges = filters?.priceRanges || [];
    if (currentPriceRanges.includes(priceRange)) {
      setFilters({
        ...filters,
        priceRanges: currentPriceRanges.filter((p: string) => p !== priceRange)
      });
    } else {
      setFilters({
        ...filters,
        priceRanges: [...currentPriceRanges, priceRange]
      });
    }
  };

  const hasActiveFilters = (filters?.categories?.length || 0) > 0 || (filters?.priceRanges?.length || 0) > 0;

  return (
    <div className="text-cyan-950">
      {/* Categories section */}
      <div className="mb-4 border border-cyan-600 rounded-lg overflow-hidden">
        <button
          className="flex items-center justify-between w-full p-3 bg-cyan-100 hover:bg-cyan-200 transition-colors"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        >
          <span className="text-cyan-800 font-medium flex items-center">
            <TagIcon className="h-4 w-4 mr-2 text-lime-700" />
            Categories
          </span>
          {isCategoryOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-lime-700" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-lime-700" />
          )}
        </button>

        {isCategoryOpen && (
          <div className="p-3">
            <div className="space-y-2">
              {categoryGroups.map((group) => (
                <div key={group.name} className="border-b border-cyan-600 last:border-0 pb-2 last:pb-0">
                  <button
                    className="flex items-center justify-between w-full p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                    onClick={() => setExpandedCategory(expandedCategory === group.name ? null : group.name)}
                  >
                    <span className="font-medium text-emerald-700">{group.name}</span>
                    {expandedCategory === group.name ? (
                      <ChevronUpIcon className="h-4 w-4 text-lime-700" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-lime-700" />
                    )}
                  </button>
                  
                  {expandedCategory === group.name && (
                    <div className="pl-4 mt-2 space-y-1">
                      {group.subcategories.map((subcategory) => (
                        <label key={subcategory} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters?.categories?.includes(subcategory) || false}
                            onChange={() => handleCategoryToggle(subcategory)}
                            className="form-checkbox h-4 w-4 text-lime-700 rounded"
                          />
                          <span className={filters?.categories?.includes(subcategory) ? "text-emerald-700" : "text-gray-600"}>
                            {subcategory}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price ranges section */}
      <div className="mb-4 border border-cyan-600 rounded-lg overflow-hidden">
        <button
          className="flex items-center justify-between w-full p-3 bg-cyan-100 hover:bg-cyan-200 transition-colors"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
        >
          <span className="text-cyan-800 font-medium flex items-center">
            <BanknoteIcon className="h-4 w-4 mr-2 text-lime-700" />
            Price Range
          </span>
          {isPriceOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-lime-700" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-lime-700" />
          )}
        </button>

        {isPriceOpen && (
          <div className="p-3">
            <div className="space-y-2">
              {priceRanges.map((price) => (
                <label key={price} className="text-lime-500 flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters?.priceRanges?.includes(price) || false}
                    onChange={() => handlePriceRangeToggle(price)}
                    className="form-checkbox h-4 w-4 text-lime-700 rounded"
                  />
                  <span className={filters?.priceRanges?.includes(price) ? "text-emerald-700" : "text-gray-600"}>
                    {price}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset filters button */}
      {hasActiveFilters && (
        <button
          className="w-full p-2 bg-lime-700 hover:bg-lime-500 text-white rounded-md transition-colors text-sm font-medium"
          onClick={() => setFilters({ categories: [], priceRanges: [] })}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
