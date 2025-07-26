import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../components/LayoutWrapper';
import Loader from '../components/Loader';

function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [showcaseItems, setShowcaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dance');

  const API = import.meta.env.VITE_API_BASE_URL;

  const tabs = [
    { id: 'dance', label: 'Dance', icon: '💃' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'photography', label: 'Photography', icon: '📸' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '💻' },
    { id: 'literary', label: 'Literary', icon: '📚' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'book', label: 'Book', icon: '📖' }
  ];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eventsRes, showcaseRes] = await Promise.all([
          axios.get(`${API}/api/events/public`),
          axios.get(`${API}/api/showcase`)
        ]);
        setEvents(eventsRes.data || []);
        setShowcaseItems(showcaseRes.data || []);
      } catch (err) {
        console.error('❌ Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API]);

  const renderEventCard = (event, index) => (
    <div key={`event-${index}`} className="dashboard-card">
      <div className="card-header">
        <h3>{event.title}</h3>
        <span className="club-name">{event.clubName}</span>
      </div>
      <div className="card-content">
        <p className="event-date">
          📅 <strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}
        </p>
        <p className="event-description">{event.description}</p>
        {event.registrationLinks?.length > 0 && (
          <div className="registration-links">
            {event.registrationLinks.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                🎯 Register Now
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderShowcaseCard = (item, index) => (
    <div key={`showcase-${index}`} className="dashboard-card">
      <div className="card-header">
        <h3>{item.title}</h3>
        <span className="club-name">{item.club}</span>
      </div>
      <div className="card-content">
        <p className="event-description">{item.description}</p>
        {item.imageUrl && (
          <div className="showcase-image">
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="showcase-actions">
          {item.linkUrl && (
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              🔗 Visit Link
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      );
    }

    const categoryEvents = events.filter(e => 
      e.clubName?.toLowerCase() === activeTab.toLowerCase()
    );
    const categoryShowcase = showcaseItems.filter(s => 
      s.club?.toLowerCase() === activeTab.toLowerCase()
    );

    const hasContent = categoryEvents.length || categoryShowcase.length;

    if (!hasContent) {
      return (
        <div className="empty-state">
          <h3>No Content Available</h3>
          <p>No events or showcases available for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} club yet.</p>
          <p>Check back later for updates!</p>
        </div>
      );
    }

    return (
      <div className="cards-grid">
        {categoryEvents.map((event, i) => renderEventCard(event, i))}
        {categoryShowcase.map((item, i) => renderShowcaseCard(item, i))}
      </div>
    );
  };

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  return (
    <LayoutWrapper title="Student Dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <h1>Welcome, {userInfo?.name || 'Student'}</h1>
              <p className="user-role">Student Dashboard</p>
            </div>
            <button onClick={handleLogout} className="btn-logout">🚪 Logout</button>
          </div>
        </header>

        <nav className="dashboard-nav">
          <div className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main className="dashboard-main">
          {renderTabContent()}
        </main>
      </div>
    </LayoutWrapper>
  );
}

export default StudentDashboard;