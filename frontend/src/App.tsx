import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AiDoctor from "./components/AiDoctor";
import DiseaseWiki from "./components/DiseaseWiki";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NoticeBoard from "./components/NoticeBoard";
import SymptomTracker from "./components/SymptomTracker";
import HospitalFinder from "./components/HospitalFinder";
import DoctorDashboard from "./components/DoctorDashboard";
import DoctorList from "./components/DoctorList";
import AppLayout from "./components/AppLayout";
import Home from "./components/Home";

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'patient' | 'doctor' }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Role-based protection
  if (role && currentUser.role && currentUser.role !== role) {
    return <Navigate to={role === 'doctor' ? '/dashboard' : '/doctor-dashboard'} />;
  }

  return children;
};

// ... Rest of the file
import DiseaseHistory from "./components/DiseaseHistory";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ai-doctor" element={<ProtectedRoute><AiDoctor /></ProtectedRoute>} />
            <Route path="/diseases" element={<div className="bg-gray-50 py-8 px-4"><DiseaseWiki /></div>} />
            <Route path="/notices" element={<div className="bg-gray-50 py-8 px-4"><NoticeBoard /></div>} />
            <Route path="/symptom-tracker" element={<ProtectedRoute><SymptomTracker /></ProtectedRoute>} />
            <Route path="/hospitals" element={<ProtectedRoute><div className="bg-gray-50 py-8 px-4"><HospitalFinder /></div></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><DoctorList /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><DiseaseHistory /></ProtectedRoute>} />
            <Route path="/doctor-dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
