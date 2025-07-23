import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import LayoutWrapper from '../components/LayoutWrapper';
import './RegisterPage.css';

function RegisterPage() {
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const handleGoogleRegister = async (credentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) return setError("Google authentication failed.");

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      setMessage("Registration successful! Awaiting approval.");
      setError('');

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error("Register error:", err);
      setError(err.message);
    }
  };

  return (
    <LayoutWrapper title="Register" center>
      <div className="auth-center-wrapper">
        <div className="register-wrapper">

          <div className="auth-page register-page">
            <h2>Register with Google</h2>

            <label>Select your role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">-- Select Role --</option>
              <option value="faculty">Faculty</option>
              <option value="studentCoordinator">Student Coordinator</option>
            </select>

            {role && (
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleRegister}
                  onError={() => setError("Google sign-in failed")}
                  />
              </div>
            )}

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <button onClick={() => navigate('/')}>Back to Login</button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );

}

export default RegisterPage;
