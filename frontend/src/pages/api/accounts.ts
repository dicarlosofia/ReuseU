import { API_BASE_URL, getAuthHeaders } from './config';

export interface Message {
  id?: number;
  chat_id: number;
  sender_id: number;
  content: string;
  created_at?: string;
}

export interface AccountData {
  UserID: string;
  First_Name: string;
  Last_Name: string;
  School: string;
  Username: string;
  dateTime_creation: string;
  Email: string;
  Pronouns: string;
  AboutMe: string;
}

export interface Chat {
  id?: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  created_at?: string;
  updated_at?: string;
  messages?: Message[];
}

export const accountsApi = {
  getAccount: async (accountId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch account");
    return response.json();
  },

  createAccount: async (accountData: AccountData, token: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(accountData),
    });
    if (!response.ok) throw new Error("Failed to create account");
    return response.json();
  },

  delete: async (id: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to delete listing');
    return response.json();
  },

  updateAccount: async (accountId: string, updateData: Partial<AccountData>, token: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error("Failed to update account");
    return response.json();
  },
};
