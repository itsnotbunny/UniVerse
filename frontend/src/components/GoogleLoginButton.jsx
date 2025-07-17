import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;

      const response = await axios.post('http://localhost:5173/api/auth/google-login', {
        credential,
      });

      const { token, user } = response.data;

      // Save token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'studentCoordinator':
          navigate('/student-coordinator');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Google login failed")}
      />
    </div>
  );
};

export default GoogleLoginButton;
