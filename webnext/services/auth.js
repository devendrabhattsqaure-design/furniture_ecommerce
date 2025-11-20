const API_BASE = 'http://localhost:5000/api';

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const register = async (name, email, password, phone = '') => {
  try {
    const requestBody = {
      full_name: name, // Backend expects full_name, not name
      email,
      password,
    };

    // Only add phone to request if it's provided and valid
    if (phone && phone.startsWith('+91') && phone.length === 13) {
      requestBody.phone = phone;
    }

    console.log('Sending registration data:', requestBody);
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Registration response status:', response.status);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log('Registration error details:', errorData);
        
        // Extract specific error message
        let errorMessage = 'Registration failed';
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorMessage;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      } catch (parseError) {
        console.log('Could not parse error response');
        throw new Error(`Registration failed with status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return true;
};