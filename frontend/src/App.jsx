// App.jsx
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';

function App() {
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const handleUnload = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = JSON.stringify({ isOnline: false });

      navigator.sendBeacon(
        `${API}/api/user/online-status`,
        new Blob([data], { type: 'application/json' })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator"
        element={
          <ProtectedRoute role="studentCoordinator">
            <CoordinatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/student" element={<StudentDashboard />} />
    </Routes>
  );
}

export default App;