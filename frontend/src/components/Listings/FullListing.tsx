import { useGlobalContext } from "@/Context/GlobalContext";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/router";

export const SAMPLE_LISTINGS = [
    {
      title: "Air Force 1s",
      price: 20.00,
      tags: ["Clothing", "Shoes"],
      desc: "These are cool!",
      image: "https://m.media-amazon.com/images/I/81uiWMk9dnL._AC_SX695_.jpg"
    },
    {
      title: "Dell Laptop",
      price: 200.00,
      tags: ["Electronic", "Device"],
      desc: "Super fast, 5 years old...",
      image: ""
    },
    {
      title: "Chess Set",
      price: 50.00,
      tags: ["Furniture", "New"],
      desc: "Made of wood!",
      image: ""
    },
    {
      title: "Pet Rock",
      price: 1.69,
      tags: ["Furniture"],
      desc: "",
      image: ""
    }
  ];


  export interface FullListingProps {
    title: string;
  }

  export default function FullListing() {
   
    const router = useRouter()

    const handleBackClick = () => {
      router.back()
  }

    // find listing
    const {title, listings} = useGlobalContext()
    console.log(title, listings)
    const  listing = listings.find(
        (item) => item.title === title
    )

    if (!listing) 
    {
        return (
            <div className="text-center text-lg font-bold mt-10">
                Listing not found!
            </div>
        );
    }

    return (

      <div className="flex items-start max-w-7xl mx-auto p-4 mt-10">
        {/* Back Button on the Left */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4 h-fit cursor-pointer"
                onClick={handleBackClick}>
          Back
        </button>
      
        {/* Main Container */}
        <div className="flex flex-col border rounded-md shadow-md w-full p-4">
          {/* Top Content: Image + Text Side by Side */}
          <div className="flex">
            {/* Left Half - Image */}
            <div className="w-1/2">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full rounded-md"
              />
              <div className="flex justify-between mt-2">
                <ChevronLeftIcon className="w-10 h-10" />
                <ChevronRightIcon className="w-10 h-10"/>
              </div>
            </div>
      
            {/* Right Half - Title, Price, Desc */}
            <div className="w-1/2 pl-4 flex flex-col justify-start">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-lg mt-2">${listing.price}</p>
              <p className="mt-4">{listing.desc}</p>
            </div>
          </div>
      
          {/* Bottom Centered Button */}
          <div className="mt-6 flex justify-center">
            <button className="bg-green-500 text-white px-4 py-2 rounded-md">
              Message Seller
            </button>
          </div>
        </div>
      </div>
    );
  };