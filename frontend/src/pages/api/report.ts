import { API_BASE_URL, getAuthHeaders } from './config';

export interface ListingReport {
  listing_id: string;
  reason: string;
  description?: string;
}

export const reportApi = {
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
};
