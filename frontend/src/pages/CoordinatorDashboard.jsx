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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventRes, facultyRes] = await Promise.all([
        axios.get(`${API}/api/events/sent`, { headers }),
        axios.get(`${API}/api/faculty/list`, { headers }),
      ]);
      setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
      setFaculty(Array.isArray(facultyRes.data) ? facultyRes.data : []);
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

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        eventDate: new Date(newEvent.eventDate).toISOString(),
        registrationLinks: [] // keep API stable
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

  // ---------- Render helpers ----------
  const renderEventsList = () => {
    if (!events.length) return <p className="empty-state">No events yet. Submit one 👇</p>;
    return (
      <div className="cards-grid">
        {events.map(ev => (
          <div className="card" key={ev._id}>
            <h4>{ev.title}</h4>
            <p>{ev.description}</p>
            <p><strong>Date:</strong> {new Date(ev.eventDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {ev.status}</p>
            <button className="btn-secondary" onClick={() => openModal(ev)}>View / Edit Flow</button>
          </div>
        ))}
      </div>
    );
  };

  const renderStatus = () => {
    const counts = events.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {});

    const statusOrder = ['Pending', 'Partially Approved', 'Approved', 'Rejected'];

    return (
      <div className="cards-grid">
        {statusOrder.map(s => (
          <div className="card" key={s}>
            <h4>{s}</h4>
            <p>{counts[s] || 0} event(s)</p>
          </div>
        ))}
      </div>
    );
  };

  const renderFacultyStatus = () => {
    if (!events.length) return <p className="empty-state">No events to show.</p>;
    return (
      <div className="stack">
        {events.map(ev => (
          <div className="card" key={ev._id}>
            <h4>{ev.title}</h4>
            <ul className="list">
              {(ev.facultyApprovals || []).map((appr, i) => (
                <li key={i}>
                  <strong>{appr?.faculty?.name || 'Faculty'}</strong>:&nbsp;
                  {appr.approved === true ? '✅ Approved'
                    : appr.approved === false ? '❌ Rejected'
                    : '⏳ Pending'}
                  {appr.comment ? ` — ${appr.comment}` : ''}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const renderFacultyList = () => {
    if (!faculty.length) return <p className="empty-state">No faculty found.</p>;
    return (
      <div className="cards-grid">
        {faculty.map(f => (
          <div className="card" key={f._id}>
            <h4>{f.name}</h4>
            <p>{f.email}</p>
            {f.facultyRole && <p><em>{f.facultyRole}</em></p>}
          </div>
        ))}
      </div>
    );
  };

  const renderIdeas = () => (
    <div className="form-card">
      <h3>Submit an Idea</h3>
      <form onSubmit={handleIdeaSubmit}>
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Your idea..."
          rows="4"
          className="form-input"
          required
        />
        <button type="submit" className="btn-primary">💡 Submit Idea</button>
      </form>
    </div>
  );

  const renderOrganisation = () => {
    if (!events.length) return <p className="empty-state">No events yet.</p>;
    return (
      <div className="cards-grid">
        {events.map(ev => (
          <div className="card" key={ev._id}>
            <h4>{ev.title}</h4>
            <p>{ev.organisingFlow ? ev.organisingFlow.slice(0, 120) + '…' : 'No flow yet.'}</p>
            <button className="btn-secondary" onClick={() => openModal(ev)}>✏️ Edit Flow</button>
          </div>
        ))}
      </div>
    );
  };

  const renderShowcase = () => (
    <div className="form-card">
      <h3>Club Showcase</h3>
      <form onSubmit={handleShowcaseSubmit} className="stack">
        <input className="form-input" placeholder="Club" value={showcase.club} onChange={e => setShowcase({ ...showcase, club: e.target.value })} required />
        <input className="form-input" placeholder="Title" value={showcase.title} onChange={e => setShowcase({ ...showcase, title: e.target.value })} required />
        <textarea className="form-input" placeholder="Description" rows="4" value={showcase.description} onChange={e => setShowcase({ ...showcase, description: e.target.value })} required />
        <input className="form-input" placeholder="Image URL" value={showcase.imageUrl} onChange={e => setShowcase({ ...showcase, imageUrl: e.target.value })} />
        <input className="form-input" placeholder="Link URL" value={showcase.linkUrl} onChange={e => setShowcase({ ...showcase, linkUrl: e.target.value })} />
        <button type="submit" className="btn-primary">🎯 Publish Showcase</button>
      </form>
    </div>
  );

  const renderNewEvent = () => (
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
      case 'events': return renderEventsList();
      case 'status': return renderStatus();
      case 'faculty-status': return renderFacultyStatus();
      case 'faculty-list': return renderFacultyList();
      case 'ideas': return renderIdeas();
      case 'organisation': return renderOrganisation();
      case 'showcase': return renderShowcase();
      case 'new-event': return renderNewEvent();
      default: return <p className="empty-state">Select a tab to view content</p>;
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
                {(selectedEvent.facultyApprovals || []).map((f, i) => (
                  <div key={i} className="feedback-item">
                    <div className="feedback-header">
                      <strong>{f?.faculty?.name || 'Faculty'}</strong>
                    </div>
                    <div className="feedback-details">
                      <p><strong>Status:</strong> {
                        f.approved === true ? '✅ Approved' :
                        f.approved === false ? '❌ Rejected' : '⏳ Pending'
                      }</p>
                      {f.comment && <p><strong>Comment:</strong> {f.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-divider"></div>

            <form onSubmit={handleOrgSubmit} className="stack">
              <textarea
                value={orgText}
                onChange={(e) => setOrgText(e.target.value)}
                placeholder="Organising flow / next steps"
                rows={5}
                className="form-input"
              />
              <button className="btn-primary" type="submit">💾 Save Flow</button>
            </form>
          </div>
        )}
      </Modal>
    </LayoutWrapper>
  );
}

export default CoordinatorDashboard;
