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
  Pronouns: string;
  AboutMe: string;
  /**
   * Lowercase email field for backend compatibility. Not required for frontend use,
   * but must be included in payloads sent to backend.
   */
  email?: string;
  Favorites?: string[];
}


export const accountsApi = {
  getAccount: async (accountId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch account");
    return response.json();
  },
  // Explicit username-based lookup (calls same endpoint, but clearer intent)
  getAccountByUsername: async (username: string, token: string) => {
    return accountsApi.getAccount(username, token);
  },

  /**
   * Get the user's favorites list
   */
  getFavorites: async (accountId: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/favorites`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch favorites");
    return response.json();
  },

  /**
   * Update the user's favorites list
   */
  updateFavorites: async (accountId: string, favorites: string[], token: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/favorites`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ Favorites: favorites }),
    });
    if (!response.ok) throw new Error("Failed to update favorites");
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

  updatePfp: async (accountId: string, dataBytes: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/pfp`,
      {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ data_bytes: dataBytes }),
      }
    );
  
    if (!response.ok) throw new Error('Failed to update profile picture');
    return response.json();
  },

  getPfp: async (accountId: string, token?: string): Promise<Blob> => {
    const url = `${API_BASE_URL}/accounts/${accountId}/pfp`;
    console.log("[accountsApi.getPfp] →", url);
  
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...getAuthHeaders(token),
        Accept: "application/octet-stream",
      },
    });
  
    console.log("[accountsApi.getPfp] ← status", response.status);
  
    if (!response.ok) {
      // try to parse JSON error payload
      let errBody: any;
      try {
        errBody = await response.json();
        console.error("[accountsApi.getPfp] error body:", errBody);
      } catch {
        const text = await response.text();
        console.error("[accountsApi.getPfp] non-JSON body:", text);
      }
      throw new Error(
        errBody?.error || errBody?.message || `HTTP ${response.status}`
      );
    }
  
    return response.blob();
  },
};
