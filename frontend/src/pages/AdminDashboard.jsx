// pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../components/LayoutWrapper';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [usersRes, eventsRes] = await Promise.all([
        axios.get(`${API}/api/admin/users`, { headers }),
        axios.get(`${API}/api/events/public`)
      ]);
      setUsers(usersRes.data);
      setPublicEvents(eventsRes.data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/api/admin/assign-role/${userId}`, {
        role: 'faculty',
        subRole: 'Professor' // Optional: make dynamic if needed
      }, { headers });
      fetchData();
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User rejected');
      fetchData();
    } catch (err) {
      console.error("❌ Reject error:", err);
      alert('Failed to reject user');
    }
  };

  const renderTileContent = (heading) => {
    if (heading === 'User Database') {
      return users.map((u, i) => (
        <div key={i}>
          <strong>{u.name}</strong> — {u.role}
          {u.facultyRole ? ` (${u.facultyRole})` : ''} {u.club && `| Club: ${u.club}`}
        </div>
      ));
    }

    if (heading === 'Pending Faculty Registrations') {
      const pending = users.filter(u => u.role === 'pending' && u.desiredRole === 'faculty');
      return pending.length ? pending.map((u, i) => (
        <div key={i}>
          <strong>{u.name}</strong> — {u.email}
          <br />
          <button onClick={() => approveUser(u._id)}>Approve</button>
          <button onClick={() => rejectUser(u._id)} style={{ marginLeft: '10px' }}>Reject</button>
        </div>
      )) : <p>No pending faculty registrations.</p>;
    }

    const events = publicEvents.filter(e => e.clubName?.toLowerCase() === heading.toLowerCase());
    return events.length > 0 ? events.map((ev, i) => (
      <div key={i}>
        <strong>{ev.title}</strong> — {new Date(ev.eventDate).toLocaleDateString()}
        <ul>
          {ev.registrationLinks.map((link, j) => (
            <li key={j}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
          ))}
        </ul>
      </div>
    )) : <p>No public events available for this club.</p>;
  };

  const headings = [
    'User Database',
    'Pending Faculty Registrations',
    'Dance',
    'Music',
    'Photography',
    'Art',
    'Technical',
    'Literary',
    'Fashion',
    'Book',
  ];

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
