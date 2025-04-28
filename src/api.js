import axios from 'axios';

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies
});

export const login = async (name, email) => {
  try {
    const response = await api.post('/auth/login', { name, email });
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const getBreeds = async () => {
  try {
    const response = await api.get('/dogs/breeds');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch breeds:', error);
    throw error;
  }
};

export const searchDogs = async (params) => {
  try {
    console.log('searchDogs API call with params:', params);
    const response = await api.get('/dogs/search', { params });
    console.log('searchDogs API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to search dogs:', error);
    throw error;
  }
};

export const getDogDetails = async (ids) => {
  try {
    const response = await api.post('/dogs', ids);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dog details:', error);
    throw error;
  }
};

export const getMatch = async (ids) => {
  try {
    const response = await api.post('/dogs/match', ids);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch your match', error);
    throw error;
  }
};
export const generateMatch = async (favoriteDogIds) => {
  try {
    const response = await api.post('/dogs/match', favoriteDogIds);
    return response.data;
  } catch (error) {
    console.error('Failed to generate match:', error);
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    // Check if the 'fetch-access-token' cookie exists
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const token = localStorage.getItem("user");
    if (!token) {
      throw new Error('Authentication token not found');
    }
    console.log(token);
    // Optionally, make a request to verify the token with the server
    
    return true;
  } catch (error) {
    console.error('Authentication check failed:', error);
    throw error;
  }
};
