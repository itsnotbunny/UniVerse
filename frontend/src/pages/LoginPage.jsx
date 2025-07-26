// pages/LoginPage.jsx
import './AuthPages.css';
import { useNavigate } from 'react-router-dom';
import LayoutWrapper from '../components/LayoutWrapper';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <LayoutWrapper title="Welcome to UniVerse" center>
      <div className="fullscreen-center">
        <div className="auth-center-wrapper">
          <div className="auth-page">
            <div className="auth-form">
              <h2>Choose an Option</h2>
              <button onClick={() => navigate('/login/google')}>Login</button>
              <button onClick={() => navigate('/register')}>Register</button>
              <button onClick={() => navigate('/student')}>Continue as Student</button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

export default LoginPage;