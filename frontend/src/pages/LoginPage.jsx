// pages/LoginPage.jsx
import './AuthPages.css';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import LayoutWrapper from '../components/LayoutWrapper';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const credential = credentialResponse.credential;

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const role = data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'faculty') navigate('/faculty');
        else if (role === 'studentCoordinator') navigate('/coordinator');
        else if (role === 'student') navigate('/student');
        else navigate('/');
      })
      .catch((err) => {
        console.error("Google login failed:", err);
      });
  };

  return (
    <LayoutWrapper title="Welcome to UniVerse" center>
      <div className="auth-page">
        <div className="auth-form">
          <h2>Choose Login Method</h2>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => alert("Google login failed")}
          />
          <button onClick={() => navigate('/register')}>Register</button>
          <button onClick={() => navigate('/student')}>Continue as Student</button>
        </div>
      </div>
    </LayoutWrapper>
  );
}

export default LoginPage;
