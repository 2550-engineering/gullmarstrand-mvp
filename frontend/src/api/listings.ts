import axios from 'axios';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: 'new' | 'like_new' | 'good' | 'used' | 'needs_repair';
  category_id: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const getListings = async (): Promise<Listing[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/listings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};