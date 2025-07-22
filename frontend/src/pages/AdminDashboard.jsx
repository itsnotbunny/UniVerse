import LayoutWrapper from '../components/LayoutWrapper';
import Dashboard from '../components/Dashboard';
import LogoutButton from '../components/LogoutButton';
import Loader from '../components/Loader';
import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState([]);
  const API = import.meta.env.VITE_API_BASE_URL;

  const headings = [
    'Dance', 'Music', 'Photography', 'Art',
    'Technical', 'Literary', 'Fashion', 'Book',
    'Student Coordinators', 'User Database',
    'Faculty Registration'
  ];

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await axios.get('${API}/api/users/coordinators');
      setCoordinators(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch coordinators:", err);
    } finally {
      setLoading(false);
    }
  };

  const [pendingFaculty, setPendingFaculty] = useState([]);

  useEffect(() => {
    fetchCoordinators();
    fetchPendingFaculty(); // ✅ fetch pending faculty
  }, []);

  const fetchPendingFaculty = async () => {
    try {
      const res = await axios.get('${API}/api/users/faculty-pending');
      setPendingFaculty(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending faculty:", err);
    }
  };

  const renderTileContent = (heading) => {
    if (heading === 'Student Coordinators') {
      return (
        <ul>
          {coordinators.map((c, i) => (
            <li key={i}>{c.name} — {c.club}</li>
          ))}
        </ul>
      );
    }
    if (heading === 'User Database') {
      return <p>Full user list to be implemented</p>;
    }
    if (heading === 'Faculty Registration') {
      return pendingFaculty.length > 0 ? (
        <ul>
          {pendingFaculty.map((f, i) => (
            <li key={i}>{f.name} — {f.email}</li>
          ))}
        </ul>
      ) : (
        <p>No pending faculty approvals</p>
      );
    }
    return <p>Club events or tools for {heading}</p>;
  };

  return (
    <LayoutWrapper title="Admin Dashboard">
      <LogoutButton />
      {loading ? (
        <Loader />
      ) : (
        <Dashboard headings={headings} renderContent={renderTileContent} />
      )}
    </LayoutWrapper>
  );
}

export default AdminDashboard;