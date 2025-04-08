export const API_BASE_URL = 'http://localhost:5000/api';

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const getAuthHeaders = (token?: string) => {
  if (!token) return defaultHeaders;
  return {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`,
  };
}; 