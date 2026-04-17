import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SurveyPage from './pages/SurveyPage';
import AdminDashboard from './pages/AdminDashboard';
import ReviewGate from './pages/ReviewGate';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/review-gate" element={<ReviewGate />} />
      </Routes>
    </Router>
  );
}
