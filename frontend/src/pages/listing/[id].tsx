import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { NextPage } from "next"
import Dashboard from "@/components/Dashboard"
import FullListing from "@/components/Listings/FullListing"
import { useApiWithAuth } from "@/lib/useApiWithAuth"

const ListingPage: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { listings } = useApiWithAuth()

  const [listing, setListing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady || !id) return

    const fetchListing = async () => {
      try {
        setIsLoading(true)
        const data = await listings.getById(id as string)
        setListing(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch listing")
        console.error("Error fetching listing:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [router.isReady, id])

  if (isLoading) {
    return (
      <div>
        <Dashboard />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Dashboard />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div>
        <Dashboard />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">Listing not found</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Dashboard />
      <FullListing
        title={listing.Title}
        price={parseFloat(listing.Price)}
        tags={listing.Category}
        desc={listing.Description}
        image={
          listing.Images?.[0] ||
          listing.base64images?.[0]?.data ||
          ""
        }
        sellerId={listing.UserID}
      />
    </div>
  )
}

export default ListingPage
