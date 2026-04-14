import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SurveyPage from './pages/SurveyPage';
import AdminDashboard from './pages/AdminDashboard';
import ReviewGate from './pages/ReviewGate';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/review-gate" element={<ReviewGate />} />
      </Routes>
    </Router>
  );
}
