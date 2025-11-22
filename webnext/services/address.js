// services/address.js
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

export const getAddresses = async () => {
  try {
    const response = await fetch(`${API_BASE}/addresses`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }

    const data = await response.json();
    return data.addresses || [];
  } catch (error) {
    console.error('Get addresses error:', error);
    throw error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add address');
    }

    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Add address error:', error);
    throw error;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update address');
    }

    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Update address error:', error);
    throw error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete address');
    }

    return addressId;
  } catch (error) {
    console.error('Delete address error:', error);
    throw error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await fetch(`${API_BASE}/addresses/${addressId}/set-default`, {
      method: 'PATCH',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to set default address');
    }

    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error('Set default address error:', error);
    throw error;
  }
};