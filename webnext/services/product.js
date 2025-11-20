const API_BASE = 'http://localhost:5000/api';

export const fetchProducts = async (filters = {}) => {
  try {
    const { category_id, min_price, max_price, search, page = 1, limit = 100 } = filters;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category_id && { category_id }),
      ...(min_price && { min_price: min_price.toString() }),
      ...(max_price && { max_price: max_price.toString() }),
      ...(search && { search }),
    });

    const response = await fetch(`${API_BASE}/products?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
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