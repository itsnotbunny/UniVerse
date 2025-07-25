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
      console.log('🔄 Attempting Google login...');
      
      const res = await fetch(`${API}/api/auth/google-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ credential }),
      });

      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Login failed:', errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('✅ Login response:', data);

      if (!data.user) {
        console.error('❌ User object missing from response');
        throw new Error("User object missing from response");
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      // ✅ Set isOnline = true with better error handling
      try {
        const onlineRes = await fetch(`${API}/api/user/online-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ isOnline: true })
        });

        if (!onlineRes.ok) {
          console.warn('⚠️ Failed to update online status:', onlineRes.status);
        } else {
          console.log('✅ Online status updated successfully');
        }
      } catch (onlineError) {
        console.warn('⚠️ Online status update failed:', onlineError);
        // Don't block login for this
      }

      // Navigate based on role
      const role = data.user.role;
      console.log('🔄 Navigating to dashboard for role:', role);
      
      if (role === 'admin') navigate('/admin');
      else if (role === 'faculty') navigate('/faculty');
      else if (role === 'studentCoordinator') navigate('/coordinator');
      else if (role === 'student') navigate('/student');
      else {
        console.warn('⚠️ Unknown role, navigating to home:', role);
        navigate('/');
      }
    } catch (err) {
      console.error("❌ Google login failed:", err);
      alert(`Login failed: ${err.message}. Please try again.`);
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error("❌ Google OAuth error:", error);
    alert("Google login failed. Please try again.");
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
                onError={handleGoogleLoginError}
                useOneTap={false}
                auto_select={false}
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