// pages/LoginPage.jsx
import './AuthPages.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="auth-background"></div>
      <div className="auth-page-title">Welcome to UniVerse</div>
      <div className="auth-container">
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="auth-card">
            <h2>Choose an Option</h2>
            <div className="auth-form">
              <button onClick={() => navigate('/login/google')}>
                Login
              </button>
              <button onClick={() => navigate('/register')}>
                Register
              </button>
              <button 
                className="secondary-button"
                onClick={() => navigate('/student')}
              >
                Continue as Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;