export const API_BASE_URL = 'http://127.0.0.1:5000/api';

/*
This file contains the configuration for the API.
It is used to connect to the backend API.
*/

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