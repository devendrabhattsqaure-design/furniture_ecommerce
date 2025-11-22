// services/user.js
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

// For form data (file uploads)
const getFormDataHeaders = () => {
  const token = getAuthToken();
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// services/user.js - Make sure uploadProfileImage is properly implemented
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/users/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload profile image');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};