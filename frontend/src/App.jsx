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
import GoogleLoginPage from './pages/GoogleLoginPage';

// Inside <Routes>:


function App() {
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const handleUnload = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      // ✅ Use fetch with keepalive instead of sendBeacon for authenticated requests
      try {
        await fetch(`${API}/api/user/online-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isOnline: false }),
          keepalive: true // This ensures the request completes even if the page unloads
        });
      } catch (error) {
        console.error('Error updating online status:', error);
        // Fallback to sendBeacon without auth (you'll need to handle this differently on backend)
        const data = JSON.stringify({ isOnline: false, token });
        navigator.sendBeacon(
          `${API}/api/user/online-status-beacon`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };
    
    // ✅ Also handle visibility change for better user experience
    const handleVisibilityChange = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const isOnline = !document.hidden;
      
      try {
        await fetch(`${API}/api/user/online-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isOnline })
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [API]);
  
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login/google" element={<GoogleLoginPage />} />
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