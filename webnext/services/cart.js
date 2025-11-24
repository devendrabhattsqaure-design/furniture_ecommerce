const API_BASE = 'http://localhost:5000/api';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const getCart = async () => {
  try {
    const response = await fetch(`${API_BASE}/cart`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Get cart error:', error);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add to cart');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update cart item');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Update cart item error:', error);
    throw error;
  }
};

export const removeFromCart = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove from cart');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to clear cart');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
};