// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on role
    if (user.role === 'super_admin') {
      return <Navigate to="/dashboard/home" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/dashboard/home" replace />;
    } else {
      return <Navigate to="/auth/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;