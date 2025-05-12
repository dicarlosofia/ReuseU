// Reusable dropdown component for selections
// This component allows users to select categories and price ranges for filtering data.
// It uses the GlobalContext to manage the filters state and provides a toggleable interface for each filter group.

import { useState } from "react";
import { useGlobalContext } from "@/Context/GlobalContext";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  BanknoteIcon,
} from "lucide-react";

// Interface for filters object
// categories: array of selected category names
// priceRanges: array of selected price range names
interface Filters {
  categories: string[];
  priceRanges: string[];
  sortByFavorites?: boolean;
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

  const priceRanges = [
    "Under $10",
    "$10 - $50",
    "$50 - $100",
    "$100 - $500",
    "Above $500",
  ];

  // Toggle a subcategory (checkbox)
  const handleSubcategoryToggle = (subcategory: string) => {
    const currentCategories = filters?.categories || [];
    if (currentCategories.includes(subcategory)) {
      setFilters({
        ...filters,
        categories: currentCategories.filter((c: string) => c !== subcategory),
      });
    } else {
      setFilters({
        ...filters,
        categories: [...currentCategories, subcategory],
      });
    }
  };

  // Toggle all subcategories for a main category
  const handleCategoryToggle = (category: CategoryGroup) => {
    const allSelected = category.subcategories.every((sub) =>
      (filters?.categories || []).includes(sub)
    );
    if (allSelected) {
      // Remove all subcategories
      setFilters({
        ...filters,
        categories: (filters?.categories || []).filter(
          (c: string) => !category.subcategories.includes(c)
        ),
      });
    } else {
      // Add any missing subcategories
      setFilters({
        ...filters,
        categories: Array.from(
          new Set([...(filters?.categories || []), ...category.subcategories])
        ),
      });
    }
  };

  const handlePriceRangeToggle = (priceRange: string) => {
    const currentPriceRanges = filters?.priceRanges || [];
    if (currentPriceRanges.includes(priceRange)) {
      setFilters({
        ...filters,
        priceRanges: currentPriceRanges.filter((p: string) => p !== priceRange),
      });
    } else {
      setFilters({
        ...filters,
        priceRanges: [...currentPriceRanges, priceRange],
      });
    }
  };

  const hasActiveFilters =
    (filters?.categories?.length || 0) > 0 ||
    (filters?.priceRanges?.length || 0) > 0;

  return (
    <div className="text-cyan-950">
      {/* Sort by Favorites section */}
      <div className="mb-4 border border-cyan-600 rounded-lg overflow-hidden">
        <label className="flex items-center space-x-2 p-3 bg-cyan-100 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters?.sortByFavorites}
            onChange={() =>
              setFilters({
                ...filters,
                sortByFavorites: !filters?.sortByFavorites,
              })
            }
            className="form-checkbox h-4 w-4 text-red-500 rounded"
          />
          <span
            className={
              filters?.sortByFavorites
                ? "text-red-600 font-semibold"
                : "text-gray-600"
            }
          >
            Sort by Favorites
          </span>
        </label>
      </div>
      {/* Categories section */}
      <div className="mb-4 border border-cyan-600 rounded-lg overflow-hidden">
        <button
          type="button"
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
              {categoryGroups.map((group) => {
                const isMainChecked =
                  filters?.categories?.includes(group.name) || false;
                return (
                  <div
                    key={group.name}
                    className="border-b border-cyan-600 last:border-0 pb-2 last:pb-0"
                  >
                    {/* Main category checkbox */}
                    <label className="flex items-center space-x-2 cursor-pointer mb-1 pl-1">
                      <input
                        type="checkbox"
                        checked={isMainChecked}
                        onChange={() => handleCategoryToggle(group.name)}
                        className="form-checkbox h-5 w-5 text-lime-800 border-lime-700 rounded shadow-sm"
                      />
                      <span
                        className={
                          isMainChecked
                            ? "text-emerald-900 font-bold"
                            : "text-gray-800 font-semibold"
                        }
                      >
                        {group.name}
                      </span>
                    </label>
                    <button
                      className="flex items-center justify-between w-full p-2 hover:bg-cyan-100 rounded-lg transition-colors"
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === group.name ? null : group.name
                        )
                      }
                    >
                      <span className="font-medium text-emerald-700">
                        {group.name}
                      </span>
                      {expandedCategory === group.name ? (
                        <ChevronUpIcon className="h-4 w-4 text-lime-700" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-lime-700" />
                      )}
                    </button>
                    {/* Subcategories */}
                    {expandedCategory === group.name && (
                      <div className="pl-4 mt-2 space-y-1">
                        {group.subcategories.map((subcategory) => (
                          <label
                            key={subcategory}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                filters?.categories?.includes(subcategory) ||
                                false
                              }
                              onChange={() => handleCategoryToggle(subcategory)}
                              className="form-checkbox h-4 w-4 text-lime-700 rounded"
                            />
                            <span
                              className={
                                filters?.categories?.includes(subcategory)
                                  ? "text-emerald-700"
                                  : "text-gray-600"
                              }
                            >
                              {subcategory}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
                <label
                  key={price}
                  className="text-lime-500 flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters?.priceRanges?.includes(price) || false}
                    onChange={() => handlePriceRangeToggle(price)}
                    className="form-checkbox h-4 w-4 text-lime-700 rounded"
                  />
                  <span
                    className={
                      filters?.priceRanges?.includes(price)
                        ? "text-emerald-700"
                        : "text-gray-600"
                    }
                  >
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
