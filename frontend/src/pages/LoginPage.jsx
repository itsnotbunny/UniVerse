// pages/LoginPage.jsx
import './AuthPages.css';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import LayoutWrapper from '../components/LayoutWrapper';

function LoginPage() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL; 

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const credential = credentialResponse.credential;

    try {
      const res = await fetch(`${API}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (!data.user) throw new Error("User object missing from response");

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      // ✅ Set isOnline = true
      await fetch(`${API}/api/user/online-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`
        },
        body: JSON.stringify({ isOnline: true })
      });

      const role = data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'faculty') navigate('/faculty');
      else if (role === 'studentCoordinator') navigate('/coordinator');
      else if (role === 'student') navigate('/student');
      else navigate('/');
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <LayoutWrapper title="Welcome to UniVerse" center>
      <div className="auth-center-wrapper">
        <div className="auth-page">
          <div className="auth-form">
            <h2>Choose Login Method</h2>
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => alert("Google login failed")}
              />
            </div>
            <button onClick={() => navigate('/register')}>Register</button>
            <button onClick={() => navigate('/student')}>Continue as Student</button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

export default LoginPage;