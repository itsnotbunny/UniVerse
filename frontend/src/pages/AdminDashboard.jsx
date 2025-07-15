import { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Move inside component
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
        axios.get(`${API}/api/events/public`),
      ]);

      setUsers(usersRes.data);
      setPublicEvents(eventsRes.data);
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false); // ✅ Stop spinner
    }
  };

  const renderTileContent = (heading) => {
    if (heading === 'User Database') {
      return users.map((u, i) => (
        <div key={i}>
          <strong>{u.name}</strong> — {u.role} {u.facultyRole ? `(${u.facultyRole})` : ''} {u.club && `| Club: ${u.club}`}
        </div>
      ));
    }

    // For club-specific tiles
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

  return (
    <div>
      <LogoutButton />
      {loading ? (
        <Loader />
      ) : (
        <Dashboard
          headings={[
            'User Database',
            'Dance',
            'Music',
            'Photography',
            'Art',
            'Technical',
            'Literary',
            'Fashion',
            'Book',
          ]}
          renderContent={renderTileContent}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
