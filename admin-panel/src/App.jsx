// admin-panel/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MaterialTailwindControllerProvider } from "@/context";
import { ThemeProvider } from "@material-tailwind/react";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth/sign-in" replace />;
};

// Public Route component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard/home" replace />;
};

function AppContent() {
  return (
    <Routes>
      {/* Dashboard Routes - Protected */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Auth Routes - Public */}
      <Route 
        path="/auth/*" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      
      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;