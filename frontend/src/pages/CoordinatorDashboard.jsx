import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../components/LayoutWrapper';
import Modal from '../components/Modal';

function CoordinatorDashboard() {
  const [events, setEvents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [showcase, setShowcase] = useState({
    club: '',
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: ''
  });
  const [ideaText, setIdeaText] = useState('');
  const [orgText, setOrgText] = useState('');

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const tabs = [
    { id: 'events', label: 'Events Sent', icon: '📋' },
    { id: 'status', label: 'Events Status', icon: '📊' },
    { id: 'faculty-status', label: 'Faculty Status', icon: '👨‍🏫' },
    { id: 'faculty-list', label: 'Faculty List', icon: '👥' },
    { id: 'ideas', label: 'Idea Board', icon: '💡' },
    { id: 'organisation', label: 'Event Organisation', icon: '🗂️' },
    { id: 'showcase', label: 'Club Showcase', icon: '🎯' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventRes, facultyRes] = await Promise.all([
        axios.get(`${API}/api/events/sent`, { headers }),
        axios.get(`${API}/api/faculty/list`, { headers }),
      ]);
      setEvents(eventRes.data);
      setFaculty(facultyRes.data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setOrgText(event.organisingFlow || '');
    setModalOpen(true);
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/ideas`, { text: ideaText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Idea submitted');
      setIdeaText('');
    } catch (err) {
      console.error('❌ Idea submit error:', err);
      alert('Submission failed');
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent?._id) return;
    try {
      await axios.put(`${API}/api/events/${selectedEvent._id}/organisation`, {
        organisingFlow: orgText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Flow saved!');
      setOrgText('');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('❌ Flow save error:', err);
      alert('Save failed');
    }
  };

  const handleShowcaseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/showcase`, showcase, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Showcase uploaded!');
      setShowcase({ club: '', title: '', description: '', imageUrl: '', linkUrl: '' });
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Upload failed');
    }
  };

  const renderEventCard = (event) => (
    <div key={event._id} className="dashboard-card" onClick={() => openModal(event)}>
      <div className="card-header">
        <h3>{event.title}</h3>
        <span className="club-name">{event.clubName}</span>
      </div>
      <div className="card-content">
        <p className="event-date">📅 {new Date(event.date).toLocaleDateString()}</p>
        <p className="event-description">{event.description?.substring(0, 100)}...</p>
      </div>
      <div className="card-footer">
        <span className="event-status">Status: {event.status}</span>
      </div>
    </div>
  );

  const renderStatusCard = (event) => {
    const approved = event.facultyApprovals.filter(a => a.approved === true).length;
    const rejected = event.facultyApprovals.filter(a => a.approved === false).length;
    const pending = event.facultyApprovals.filter(a => a.approved === null).length;

    return (
      <div key={event._id} className="dashboard-card" onClick={() => openModal(event)}>
        <div className="card-header">
          <h3>{event.title}</h3>
          <span className="club-name">{event.clubName}</span>
        </div>
        <div className="card-content">
          <p className="event-status">Status: <strong>{event.status}</strong></p>
          <div className="approval-stats">
            <span className="approved">✅ {approved}</span>
            <span className="rejected">❌ {rejected}</span>
            <span className="pending">⏳ {pending}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFacultyStatusCard = (event) => (
    <div key={event._id} className="dashboard-card">
      <div className="card-header">
        <h3>{event.title}</h3>
        <span className="club-name">{event.clubName}</span>
      </div>
      <div className="card-content">
        <div className="faculty-approvals">
          {event.facultyApprovals.map((fa, i) => (
            <div key={i} className="approval-item">
              <span>Faculty ID: {fa.faculty}</span>
              <span className={`status ${fa.read ? 'read' : 'unread'}`}>
                {fa.read ? '🟢 Seen' : '⚫ Not Seen'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFacultyCard = (facultyMember) => (
    <div key={facultyMember._id} className="dashboard-card">
      <div className="card-header">
        <h3>{facultyMember.name}</h3>
        <span className="faculty-role">{facultyMember.facultyRole}</span>
      </div>
      <div className="card-content">
        <div className="online-status">
          <span className={`status ${facultyMember.isOnline ? 'online' : 'offline'}`}>
            {facultyMember.isOnline ? '🟢 Online' : '⚫ Offline'}
          </span>
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

    switch (activeTab) {
      case 'events':
        return (
          <div className="cards-grid">
            {events.length > 0
              ? events.map(renderEventCard)
              : <p className="empty-state">No events sent</p>}
          </div>
        );

      case 'status':
        return (
          <div className="cards-grid">
            {events.length > 0
              ? events.map(renderStatusCard)
              : <p className="empty-state">No events to show status</p>}
          </div>
        );

      case 'faculty-status':
        return (
          <div className="cards-grid">
            {events.length > 0
              ? events.map(renderFacultyStatusCard)
              : <p className="empty-state">No faculty status to display</p>}
          </div>
        );

      case 'faculty-list':
        return (
          <div className="cards-grid">
            {faculty.length > 0
              ? faculty.map(renderFacultyCard)
              : <p className="empty-state">No faculty members found</p>}
          </div>
        );

      case 'ideas':
        return (
          <div className="form-container">
            <div className="form-card">
              <h3>Share Your Ideas</h3>
              <form onSubmit={handleIdeaSubmit}>
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Share your ideas for events, improvements, or suggestions..."
                  className="form-textarea"
                  rows="6"
                  required
                />
                <button type="submit" className="btn-primary">Submit Idea</button>
              </form>
            </div>
          </div>
        );

      case 'organisation':
        return (
          <div className="form-container">
            <div className="form-card">
              <h3>Event Organisation</h3>
              {selectedEvent ? (
                <form onSubmit={handleOrgSubmit}>
                  <div className="selected-event-info">
                    <h4>Editing: {selectedEvent.title}</h4>
                    <p>{selectedEvent.clubName}</p>
                  </div>
                  <textarea
                    value={orgText}
                    onChange={(e) => setOrgText(e.target.value)}
                    placeholder="Describe the event organization flow, timeline, responsibilities..."
                    className="form-textarea"
                    rows="8"
                    required
                  />
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Save Flow</button>
                    <button 
                      type="button" 
                      onClick={() => setSelectedEvent(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="instruction-text">Click on an event from the "Events Sent" tab to edit its organizing flow</p>
              )}
            </div>
          </div>
        );

      case 'showcase':
        return (
          <div className="form-container">
            <div className="form-card">
              <h3>Club Showcase Uploader</h3>
              <form onSubmit={handleShowcaseSubmit} className="showcase-form">
                <input
                  type="text"
                  value={showcase.club}
                  onChange={(e) => setShowcase({ ...showcase, club: e.target.value })}
                  placeholder="Club Name"
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  value={showcase.title}
                  onChange={(e) => setShowcase({ ...showcase, title: e.target.value })}
                  placeholder="Event/Showcase Title"
                  className="form-input"
                  required
                />
                <input
                  type="url"
                  value={showcase.imageUrl}
                  onChange={(e) => setShowcase({ ...showcase, imageUrl: e.target.value })}
                  placeholder="Image URL"
                  className="form-input"
                />
                <input
                  type="url"
                  value={showcase.linkUrl}
                  onChange={(e) => setShowcase({ ...showcase, linkUrl: e.target.value })}
                  placeholder="Registration/Event Link"
                  className="form-input"
                />
                <input
                  type="text"
                  value={showcase.description}
                  onChange={(e) => setShowcase({ ...showcase, description: e.target.value })}
                  placeholder="Describe your club showcase..."
                  className="form-input"
                  required
                />
                <button type="submit" className="btn-primary">Upload Showcase</button>
              </form>
            </div>
          </div>
        );

      default:
        return <p className="empty-state">Select a tab to view content</p>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  return (
    <LayoutWrapper title="Coordinator Dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <h1>Welcome, {userInfo.name}</h1>
              <p className="user-role">Coordinator Dashboard</p>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedEvent && (
          <div className="modal-content">
            <h2>{selectedEvent.title}</h2>
            <p className="modal-description">{selectedEvent.description}</p>
            <div className="modal-divider"></div>
            <div className="faculty-feedback-section">
              <h3>Faculty Feedback:</h3>
              <div className="feedback-list">
                {selectedEvent.facultyApprovals.map((f, i) => (
                  <div key={i} className="feedback-item">
                    <div className="feedback-header">
                      <strong>Faculty ID: {f.faculty}</strong>
                    </div>
                    <div className="feedback-details">
                      <p><strong>Status:</strong> {
                        f.approved === true ? '✅ Approved' : 
                        f.approved === false ? '❌ Rejected' : 
                        '⏳ Pending'
                      }</p>
                      {f.comment && (
                        <p><strong>Comment:</strong> {f.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </LayoutWrapper>
  );
}

export default CoordinatorDashboard;