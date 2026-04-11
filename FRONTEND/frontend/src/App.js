import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import GuestHome from './pages/GuestHome';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Scan from './pages/Scan';
import Report from './pages/Report';
import Lessons from './pages/Lessons';
import Quiz from './pages/Quiz';
import LearningDashboard from './pages/LearningDashboard';
import ManageLessons from './pages/ManageLessons';
import ManageQuiz from './pages/ManageQuiz';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ScanHistory from './pages/ScanHistory';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/guest" element={<GuestHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/admin/scan-history" element={<AdminRoute><ScanHistory /></AdminRoute>} />
        <Route path="/scan-history" element={<UserRoute><ScanHistory /></UserRoute>} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/manage-lessons" element={<AdminRoute><ManageLessons /></AdminRoute>} />
        <Route path="/admin/manage-quiz" element={<AdminRoute><ManageQuiz /></AdminRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/report" element={<Report />} />
        <Route path="/learning-dashboard" element={<LearningDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
