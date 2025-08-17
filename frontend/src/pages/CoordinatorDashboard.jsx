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
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: ''
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
    { id: 'showcase', label: 'Club Showcase', icon: '🎯' },
    { id: 'new-event', label: 'Event for Approval', icon: '🚀' }
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

  // ✅ FIXED: always send registrationLinks and proper Date
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newEvent.title,
        description: newEvent.description,
        eventDate: new Date(newEvent.eventDate).toISOString(), // 👈 force ISO format
        registrationLinks: []
      };

      console.log("📤 Sending event:", payload);

      await axios.post(`${API}/api/events`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      alert('✅ Event submitted for approval!');
      setNewEvent({ title: '', description: '', eventDate: '' });
      fetchData();
    } catch (err) {
      console.error('❌ Event submit error:', err.response?.data || err.message);
      alert('Submission failed: ' + (err.response?.data?.message || err.message));
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

  // … keep all render functions (renderEventCard, renderStatusCard, etc.) same …

  // (I’ll keep rest unchanged except the "new-event" form which uses updated handleEventSubmit)

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
      // ... other cases unchanged ...

      case 'new-event':
        return (
          <div className="form-container">
            <div className="form-card">
              <h3>Send New Event for Approval</h3>
              <form onSubmit={handleEventSubmit} className="event-form">
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event Title"
                  className="form-input"
                  required
                />
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event Description"
                  className="form-input"
                  rows="4"
                  required
                />
                <input
                  type="date"
                  value={newEvent.eventDate}
                  onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                  className="form-input"
                  required
                />
                <button type="submit" className="btn-primary">🚀 Submit for Approval</button>
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
      {/* header, nav, main (unchanged) */}
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
