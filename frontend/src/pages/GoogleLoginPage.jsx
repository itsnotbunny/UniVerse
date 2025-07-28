// pages/GoogleLoginPage.jsx
import './AuthPages.css';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

function GoogleLoginPage() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const credential = credentialResponse.credential;

    try {
      const res = await fetch(`${API}/api/auth/google-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      // Set isOnline = true
      await fetch(`${API}/api/user/online-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`,
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
      console.error("Login failed:", err);
      alert(`Login failed: ${err.message}`);
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error("Google login error:", error);
    alert("Google login failed. Please try again.");
  };

  return (
    <>
      <div className="auth-background"></div>
      <div className="auth-page-title">Welcome to UniVerse</div>
      <div className="auth-container">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="auth-card">
            <h2>Sign in with Google</h2>
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap={false}
                auto_select={false}
              />
            </div>
            <button 
              className="secondary-button"
              onClick={() => navigate('/')}
            >
              Return to Home Page
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default GoogleLoginPage;