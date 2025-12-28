import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AiDoctor from "./components/AiDoctor";
// 🟢 Import the component
import DiseaseWiki from "./components/DiseaseWiki";
import NoticeBoard from "./components/NoticeBoard";
import SymptomTracker from "./components/SymptomTracker";
// 🟢 Import the new component
import HospitalFinder from "./components/HospitalFinder";
import DiseaseHistory from "./components/DiseaseHistory";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* 🟢 NEW ROUTE: Disease Wiki (Public) */}
          <Route
            path="/diseases"
            element={
              <div className="min-h-screen bg-gray-50 py-8 px-4">
                <DiseaseWiki />
              </div>
            }
          />
          {/* 🟢 NEW ROUTE: Notices (Public) */}
          <Route path="/notices" element={
            <div className="min-h-screen bg-gray-50 py-8 px-4">
              <NoticeBoard />
            </div>
          } />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <DiseaseHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-doctor"
            element={
              <ProtectedRoute>
                <AiDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptom-tracker"
            element={
              <ProtectedRoute>
                <SymptomTracker />
              </ProtectedRoute>
            }
          />
          {/* 🟢 NEW ROUTE: Hospital Finder */}
          <Route path="/hospitals" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 py-8 px-4">
                <HospitalFinder />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
