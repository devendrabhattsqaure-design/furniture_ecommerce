import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Fetch organization details if user has org_id
        if (parsedUser.org_id) {
          await fetchOrganizationDetails(token, parsedUser.org_id);
        } else if (parsedUser.role === 'super_admin') {
          // Set super admin organization
          setOrganization({
            org_name: "Super Admin Dashboard",
            org_logo: null,
            isSuperAdmin: true
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    }
    setLoading(false);
  };

  const fetchOrganizationDetails = async (token, orgId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrganization(data.organization || data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setOrganization(null);
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Fetch organization details if user has org_id
        if (data.user.org_id) {
          await fetchOrganizationDetails(data.token, data.user.org_id);
        } else if (data.user.role === 'super_admin') {
          setOrganization({
            org_name: "Super Admin Dashboard",
            org_logo: null,
            isSuperAdmin: true
          });
        }
        
        // Navigate based on role
        if (data.user.role === 'super_admin') {
          navigate('/dashboard/home');
        } else {
          navigate('/dashboard/home');
        }
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (email, password, full_name, phone) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name, 
          phone 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/auth/sign-in');
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/auth/sign-in');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateOrganization = (orgData) => {
    setOrganization(orgData);
  };

  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Refresh organization data if needed
          if (data.user.org_id) {
            await fetchOrganizationDetails(token, data.user.org_id);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    organization,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    updateUser,
    updateOrganization,
    refreshUserData,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    hasPermission: (requiredRole) => {
      if (!user) return false;
      if (user.role === 'super_admin') return true;
      return user.role === requiredRole;
    },
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};