import axios from 'axios';

export interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  icon?: string;
  children: Category[];
}

const API_BASE_URL = 'http://localhost:8000';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/`);
    // Ensure the response data is an array
    const categories = Array.isArray(response.data) ? response.data : [];
    // Ensure each category has a children array
    return categories.map(category => ({
      ...category,
      children: Array.isArray(category.children) ? category.children : []
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};