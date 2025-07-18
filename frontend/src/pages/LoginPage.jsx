import './AuthPages.css';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

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
    <div className="auth-page">
      <h2>Welcome to UniVerse</h2>
      <div className="auth-form">
        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => alert("Google login failed")} />
        <button onClick={() => navigate('/register')}>Register</button>
        <button onClick={() => navigate('/student')}>Continue as Student</button>
      </div>
    </div>
  );
}

export default LoginPage;
