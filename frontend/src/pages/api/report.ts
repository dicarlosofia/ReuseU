// Utility functions and constants for API calls
import { API_BASE_URL, getAuthHeaders } from './config';

export interface ListingReport {
  listing_id: string;
  reason: string;
  description?: string;
}

export const reportApi = {
  // Submit a report for a listing
  reportListing: async (
    listingId: string,
    reason: string,
    description: string,
    token: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/report/listing/${listingId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reason, description }),
    });
    if (!response.ok) throw new Error('Failed to submit report');
    return response.json();
  },
  // For admins: get all listing reports from the backend
  getAllReports: async (token: string) => {
    // Make a GET request to the admin reports endpoint with the user's token
    const response = await fetch(`${API_BASE_URL}/admin/report/all`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    // If the backend says you're not an admin, throw an eerror
    if (response.status === 403) throw new Error('Admin access only');
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },
};
