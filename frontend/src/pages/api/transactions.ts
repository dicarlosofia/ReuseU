import { API_BASE_URL, getAuthHeaders } from './config';

/*
This file contains the API for the transactions.
It is used to connect to the backend API.
*/

export interface Transaction {
  id?: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export const transactionsApi = {
  // Get all transactions for a user
  getByUserId: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/transactions/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  // Get a single transaction
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  },

  // Create a new transaction
  create: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  // Update transaction status
  updateStatus: async (id: number, status: Transaction['status']) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update transaction status');
    return response.json();
  },

  // Get transactions by listing ID
  getByListingId: async (listingId: number) => {
    const response = await fetch(`${API_BASE_URL}/transactions/listing/${listingId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch listing transactions');
    return response.json();
  },
}; 