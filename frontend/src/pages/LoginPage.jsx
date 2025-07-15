import { useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(document.getElementById('google-signin'), {
      theme: 'outline',
      size: 'large',
    });
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`, {
        credential: response.credential,
      });

      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'studentCoordinator':
          navigate('/coordinator');
          break;
        case 'student':
        default:
          navigate('/student');
          break;
      }
    } catch (err) {
      console.error('Login failed', err);
      alert("Google login failed");
    }
  };

  return (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#722f37', // wine background
    }}
  >
    <div
      id="google-signin"
      style={{
        padding: '2rem',
        backgroundColor: 'white',
        border: '2px solid gold',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      }}
    >
    </div>
  </div>
  );
}

export default LoginPage;
