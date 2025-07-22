// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import './RegisterPage.css'; // Optional styling

function RegisterPage() {
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;

  const handleGoogleRegister = async (credentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) return setError("Google authentication failed.");

    const decoded = jwtDecode(credential); // decode Google JWT
    const { name, email } = decoded;

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }), // ✅ send correct fields
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


  const handleRoleSelect = (e) => {
    setRole(e.target.value);
    setError('');
  };

  return (
    <div className="register-page">
      <h2>Register with Google</h2>

      <label>Select your role:</label>
      <select value={role} onChange={handleRoleSelect}>
        <option value="">-- Select Role --</option>
        <option value="faculty">Faculty</option>
        <option value="studentCoordinator">Student Coordinator</option>
      </select>

      {role && (
        <div className="google-button">
          <GoogleLogin onSuccess={handleGoogleRegister} onError={() => setError("Google sign-in failed")} />
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <button onClick={() => navigate('/')}>Back to Login</button>
    </div>
  );
}

export default RegisterPage;
