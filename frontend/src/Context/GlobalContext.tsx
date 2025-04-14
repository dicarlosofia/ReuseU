import { createContext, useContext, useState } from 'react'
import Listing from '@/components/Listings/Listing'

const GlobalContext = createContext<any>(null)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<Array<string>>([])
  const [title, setTitle] = useState<string>('')
  // const [listing, setListing] = useState<string>('')
  const [listings, setListings] = useState<Array<any>>([])

  return (
    <GlobalContext.Provider value={{ filters, setFilters, title, setTitle, listings, setListings}}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)