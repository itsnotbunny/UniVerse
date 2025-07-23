import { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import LayoutWrapper from '../components/LayoutWrapper';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import axios from 'axios';

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [showcaseItems, setShowcaseItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL;

  const headings = [
    'Dance', 'Music', 'Photography', 'Art',
    'Technical', 'Literary', 'Fashion', 'Book'
  ];

  useEffect(() => {
    fetchPublicEvents();
    fetchShowcaseItems();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      const res = await axios.get(`${API}/api/events/public`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch public events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowcaseItems = async () => {
    try {
      const res = await axios.get(`${API}/api/showcase/public`);
      setShowcaseItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Showcase fetch failed:", err);
      setShowcaseItems([]);
    }
  };

  const renderTileContent = (club) => {
    const eventsForClub = events.filter(
      (e) => e.clubName?.toLowerCase() === club.toLowerCase()
    );
    const showcaseForClub = showcaseItems.filter(
      (s) => s.club?.toLowerCase() === club.toLowerCase()
    );

    return (
      <>
        <h4>Events</h4>
        {eventsForClub.length ? eventsForClub.map((ev, i) => (
          <div key={i} className="event-card">
            <strong>{ev.title}</strong> — {new Date(ev.eventDate).toLocaleDateString()}<br />
            <p>{ev.description}</p>
            <ul>
              {ev.registrationLinks.map((link, j) => (
                <li key={j}><a href={link} target="_blank" rel="noreferrer">{link}</a></li>
              ))}
            </ul>
          </div>
        )) : <p>No events for this club.</p>}

        <h4 style={{ marginTop: '1rem' }}>Showcase</h4>
        {showcaseForClub.length ? showcaseForClub.map((item, i) => (
          <div key={i} className="showcase-card" style={{ marginTop: '0.5rem' }}>
            <strong>{item.title}</strong><br />
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '0.5rem' }} />
            )}
            <p>{item.description}</p>
            {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noreferrer">🔗 Link</a>}
          </div>
        )) : <p>No showcase items.</p>}
      </>
    );
  };

  return (
    <LayoutWrapper title="Student Dashboard">
      <LogoutButton />
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <Dashboard headings={headings} renderContent={renderTileContent} />
      )}
    </LayoutWrapper>
  );
}

export default StudentDashboard;