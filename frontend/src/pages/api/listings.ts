import { API_BASE_URL, getAuthHeaders } from './config'
import { ListingData } from '@/components/Listings/CreateListing'

export interface Listing {
  ListingID?: string
  Title: string
  Description: string
  Price: string
  Category: string[]
  Images?: string[]
  base64images?: { data: string; key?: string }[]
  UserID: string
  SellStatus: number
  CreateTime?: string
}

export const listingsApi = {
  // Get all listings with optional auth
  getAll: async (token?: string) => {
    try {
      console.log('Fetching listings with token:', token ? 'present' : 'not present')
      const response = await fetch(`${API_BASE_URL}/listings/`, {
        headers: getAuthHeaders(token),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch listings:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Successfully fetched listings:', data.length)
      return data
    } catch (error) {
      console.error('Error in getAll:', error)
      throw error
    }
  },

  // Get a single listing by ID
  getById: async (id: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch listing')
    const data = response.json();
    console.log(data);
    return data;
  },

  // Create a new listing
  create: async (listing: ListingData, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(listing),
    })
    if (!response.ok) throw new Error('Failed to create listing')
    return response.json()
  },

  // Update an existing listing
  update: async (id: string, listing: Partial<Listing>, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(listing),
    })
    if (!response.ok) throw new Error('Failed to update listing')
    return response.json()
  },

  // Delete a listing
  delete: async (id: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to delete listing')
    return response.json()
  },

  // Get listings by user ID
  getByUserId: async (userId: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/user/${userId}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch user listings')
    return response.json()
  },
}
