/**
 * Dropdown Component
 * 
 * This component provides a collapsible filter menu for listings.
 * Features include:
 * - Expandable category sections
 * - Price range filters
 * - Category-specific filters
 * - Checkbox selection for multiple filters
 * - Animated transitions
 * 
 * The component is used in the listings page sidebar for filtering items.
 */

import { useState } from 'react';
import { useGlobalContext } from '@/Context/GlobalContext';

// Props interface for the Dropdown component
interface Props {
  onCategorySelect?: (category: string) => void;
}

// Price range structure for filtering
interface PriceRange {
  min: number;
  max: number;
  label: string;
}

export const Dropdown: React.FC<Props> = ({ onCategorySelect }) => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const { filters, setFilters } = useGlobalContext();

  // Toggle category expansion
  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  // Handle filter selection/deselection
  const handleFilterChange = (item: string, isChecked: boolean) => {
    if (isChecked) {
      setFilters((prev: string[]) => [...prev, item]);
    } else {
      setFilters((prev: string[]) => prev.filter(filter => filter !== item));
    }
  };

  // Price range options for filtering
  const priceRanges: PriceRange[] = [
    { min: 0, max: 10, label: "Under $10" },
    { min: 10, max: 50, label: "$10 - $50" },
    { min: 50, max: 100, label: "$50 - $100" },
    { min: 100, max: 500, label: "$100 - $500" },
    { min: 500, max: Infinity, label: "Above $500" }
  ];

  // Category definitions with their respective items
  const categories = [
    { 
      name: 'Price', 
      items: priceRanges.map(range => range.label),
      type: 'price' as const
    },
    { 
      name: 'Kitchen', 
      items: ["Cookware", "Appliances", "Utensils", "Storage", "Dinnerware"],
      type: 'category' as const
    },
    { 
      name: 'Furniture', 
      items: ["Chairs", "Tables", "Beds", "Desks", "Storage"],
      type: 'category' as const
    },
    { 
      name: 'Electronics', 
      items: ["Laptops", "Phones", "Tablets", "TVs", "Audio"],
      type: 'category' as const
    },
    { 
      name: 'Clothing', 
      items: ["Shirts", "Tops", "Bottoms", "Dresses", "Accessories"],
      type: 'category' as const
    },
    { 
      name: 'Miscellaneous', 
      items: ["Books", "Toys", "Art", "Crafts", "Other"],
      type: 'category' as const
    }
  ];

  // Main dropdown menu layout
  return (
    <div className="h-full flex flex-col gap-6 py-4">
      {categories.map((category, index) => (
        <div key={index} className="px-4">
          {/* Category header with toggle button */}
          <div 
            onClick={() => toggleCategory(index)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
            <span className="text-lg font-medium">{category.name}</span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${
                expandedCategories.includes(index) ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {/* Category items with checkboxes */}
          <div 
            className={`pl-6 mt-2 overflow-hidden transition-all duration-200 ${
              expandedCategories.includes(index) 
                ? 'max-h-[500px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
          >
            {category.items.map((item, idx) => (
              <div key={idx} className="py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.includes(item)}
                    onChange={(e) => handleFilterChange(item, e.target.checked)}
                    className="rounded border-gray-300 text-[#2A9FD0] focus:ring-[#2A9FD0]" 
                  />
                  <span className="text-gray-700">{item}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}