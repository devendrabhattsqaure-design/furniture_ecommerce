const API_BASE = 'http://localhost:5000/api';

export const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch product');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};