// services/category.js
const API_BASE = 'http://localhost:5000/api';

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.data || data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};