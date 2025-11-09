import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CheckEmail from './components/CheckEmail';
import EmailVerification from './components/EmailVerification';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Leaderboard from './components/Leaderboard';
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// User Profile Pages
import ProfileSettingsPage from './components/ProfileSettingsPage';
import UserStatsPage from './components/UserStatsPage';

// Run Management Pages
import RecordRunPage from './components/RecordRunPage';
import RunHistoryPage from './components/RunHistoryPage';
import RunDetailsPage from './components/RunDetailsPage';
import EditRunPage from './components/EditRunPage';
import RunStatisticsPage from './components/RunStatisticsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes (Public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Dashboard (Protected) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Leaderboard (Protected) */}
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        
        {/* User Profile Routes (Protected) */}
        <Route path="/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><UserStatsPage /></ProtectedRoute>} />
        
        {/* Run Management Routes (Protected) */}
        <Route path="/runs/new" element={<ProtectedRoute><RecordRunPage /></ProtectedRoute>} />
        <Route path="/runs" element={<ProtectedRoute><RunHistoryPage /></ProtectedRoute>} />
        <Route path="/runs/:id" element={<ProtectedRoute><RunDetailsPage /></ProtectedRoute>} />
        <Route path="/runs/:id/edit" element={<ProtectedRoute><EditRunPage /></ProtectedRoute>} />
        <Route path="/run-statistics" element={<ProtectedRoute><RunStatisticsPage /></ProtectedRoute>} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;