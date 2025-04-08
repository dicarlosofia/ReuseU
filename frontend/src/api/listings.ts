import { API_BASE_URL, getAuthHeaders } from './config';

export interface Listing {
  id?: string;
  title: string;
  price: number;
  description: string;
  desc?: string; // For backward compatibility with sample data
  category: string[];
  image?: string;
  seller_id: string;
  created_at?: string;
  updated_at?: string;
}

export const listingsApi = {
  // Get all listings with optional filters
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/listings`);
    if (!response.ok) throw new Error('Failed to fetch listings');
    return response.json();
  },

  // Get a single listing by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch listing');
    return response.json();
  },

  // Create a new listing
  create: async (listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(listing),
    });
    if (!response.ok) throw new Error('Failed to create listing');
    return response.json();
  },

  // Update an existing listing
  update: async (id: string, listing: Partial<Listing>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(listing),
    });
    if (!response.ok) throw new Error('Failed to update listing');
    return response.json();
  },

  // Delete a listing
  delete: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete listing');
    return response.json();
  },

  // Get listings by user ID
  getByUserId: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/listings/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user listings');
    return response.json();
  },

  // // Update a review
  // updateReview: async (reviewId: string, review: Partial<Review>, token: string) => {
  //   const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
  //     method: 'PUT',
  //     headers: getAuthHeaders(token),
  //     body: JSON.stringify(review),
  //   });
}; 