import { API_BASE_URL, getAuthHeaders } from './config';

/*
This file contains the API for the reviews.
It is used to connect to the backend API.
*/

export interface Review {
  id?: number;
  listing_id: number;
  reviewer_id: number;
  rating: number;
  comment: string;
  created_at?: string;
  updated_at?: string;
}

export const reviewsApi = {
  // Get all reviews for a listing
  getByListingId: async (listingId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${listingId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  // Get all reviews by a user
  getByUserId: async (userId: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch user reviews');
    return response.json();
  },

  // Create a new review
  create: async (review: Omit<Review, 'id' | 'created_at' | 'updated_at'>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(review),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  },

  // Update a review
  update: async (id: number, review: Partial<Review>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(review),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
  },

  // Delete a review
  delete: async (id: number, token: string) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return response.json();
  },
}; 