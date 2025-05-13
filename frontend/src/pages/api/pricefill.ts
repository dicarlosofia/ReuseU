import { API_BASE_URL, getAuthHeaders } from './config'
import type { PriceFillRequest, PriceRange } from '@/components/Listings/CreateListing'

//feature for estimating price
export const pricefillApi = {
  getPriceRange: async (
    input: PriceFillRequest,
    token?: string
  ): Promise<PriceRange> => {
    const headers = getAuthHeaders(token)
    headers['Content-Type'] = 'application/json'

    //we use a post
    const response = await fetch(
      `${API_BASE_URL}/ai_price_fill/`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      }
    )

    if (!response.ok) {
      // try to read JSON error message
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || `Failed: ${response.status}`)
    }

    return response.json() as Promise<PriceRange>
  },
}