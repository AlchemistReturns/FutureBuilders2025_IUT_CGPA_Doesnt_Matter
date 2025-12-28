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
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          {/* 🟢 NEW ROUTE: Disease Wiki */}
          <Route
            path="/diseases"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 py-8 px-4">
                  <DiseaseWiki />
                </div>
              </ProtectedRoute>
            }
          />
          {/* 🟢 NEW ROUTE: Notices */}
          <Route path="/notices" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 py-8 px-4">
                <NoticeBoard />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
