import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import axios from 'axios';

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;

  const clubTiles = [
    'Dance', 'Music', 'Photography', 'Art',
    'Technical', 'Literary', 'Fashion', 'Book'
  ];

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      const res = await axios.get(`${API}/api/events/public`);
      setEvents(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch public events:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderTileContent = (club) => {
    const filtered = events.filter(
      (e) => e.clubName?.toLowerCase() === club.toLowerCase()
    );

    return filtered.length > 0 ? (
      filtered.map((ev, i) => (
        <div key={i} className="event-card">
          <strong>{ev.title}</strong> — {new Date(ev.eventDate).toLocaleDateString()}<br />
          <p>{ev.description}</p>
          <ul>
            {ev.registrationLinks.map((link, j) => (
              <li key={j}><a href={link} target="_blank">{link}</a></li>
            ))}
          </ul>
        </div>
      ))
    ) : (
      <p>No events available for this club.</p>
    );
  };

  return (
    <div>
      <LogoutButton />
      {loading ? (
        <Loader />
      ) : (
        <Dashboard headings={clubTiles} renderContent={renderTileContent} />
      )}
    </div>
  );
}

export default StudentDashboard;
