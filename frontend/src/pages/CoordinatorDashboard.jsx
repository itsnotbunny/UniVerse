// pages/CoordinatorDashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import LayoutWrapper from '../components/LayoutWrapper';
import logo from '../assets/UniVerseLogo.jpg';

function CoordinatorDashboard() {
  const [events, setEvents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTile, setActiveTile] = useState('');
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

  const getUserInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      return userInfo?.name || 'Coordinator';
    } catch {
      return 'Coordinator';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  const headings = [
    'Events Sent',
    'Idea Board',
    'Events Status',
    'Faculty Status',
    'Faculty List',
    'Event Organisation',
    'Club Showcase Uploader'
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
      console.error('❌ Coordinator fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowcaseSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/showcase`, showcase, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Showcase item uploaded!');
      setShowcase({
        club: '',
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: ''
      });
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('Upload failed.');
    }
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
      alert('Idea submission failed');
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
      alert('✅ Organising flow saved!');
      setOrgText('');
    } catch (err) {
      console.error('❌ Org flow save error:', err);
      alert('Failed to save');
    }
  };

  const openModal = (event, tile) => {
    setSelectedEvent(event);
    setActiveTile(tile);
    setOrgText(event.organisingFlow || ''); // preload if editing
    setModalOpen(true);
  };

  const renderTileContent = (heading) => {
    switch (heading) {
      case 'Events Sent':
        return events.map((e, i) => (
          <div
            key={e._id || i}
            onClick={() => openModal(e, heading)}
            className="request-item"
            style={{ cursor: 'pointer' }}
          >
            <strong>{e.title}</strong> — {e.clubName}
          </div>
        ));

      case 'Events Status':
        return events.map((e, i) => {
          const approved = e.facultyApprovals.filter(a => a.approved === true).length;
          const rejected = e.facultyApprovals.filter(a => a.approved === false).length;
          const pending = e.facultyApprovals.filter(a => a.approved === null).length;

          return (
            <div
              key={e._id || i}
              onClick={() => openModal(e, heading)}
              className="request-item"
              style={{ cursor: 'pointer' }}
            >
              <strong>{e.title}</strong> — Status: <em>{e.status}</em><br />
              ✅ {approved} | ❌ {rejected} | ⏳ {pending}
            </div>
          );
        });

      case 'Faculty Status':
        return events.map((e, i) => (
          <div key={e._id || i}>
            <strong>{e.title}</strong>
            <ul>
              {e.facultyApprovals.map((fa, j) => (
                <li key={j}>
                  Faculty ID: {fa.faculty} — {fa.read ? 'Seen' : 'Not Seen'}
                </li>
              ))}
            </ul>
          </div>
        ));

      case 'Faculty List':
        return faculty.map((f, i) => (
          <div key={i}>
            {f.name} ({f.facultyRole}) — {f.isOnline ? '🟢 Online' : '⚫ Offline'}
          </div>
        ));

      case 'Idea Board':
        return (
          <form onSubmit={handleIdeaSubmit}>
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Write ideas here..."
              style={{ width: '100%', height: '120px' }}
            />
            <button type="submit">Submit Idea</button>
          </form>
        );

      case 'Event Organisation':
        return selectedEvent ? (
          <form onSubmit={handleOrgSubmit}>
            <textarea
              value={orgText}
              onChange={(e) => setOrgText(e.target.value)}
              placeholder="Describe event flow..."
              style={{ width: '100%', height: '120px' }}
            />
            <button type="submit">Save Flow</button>
          </form>
        ) : (
          <p>Click an event to edit its organising flow</p>
        );

      case 'Club Showcase Uploader':
        return (
          <form onSubmit={handleShowcaseSubmit}>
            <input
              type="text"
              value={showcase.club}
              onChange={(e) => setShowcase({ ...showcase, club: e.target.value })}
              placeholder="Club"
              required
            />
            <input
              type="text"
              value={showcase.title}
              onChange={(e) => setShowcase({ ...showcase, title: e.target.value })}
              placeholder="Title"
              required
            />
            <input
              type="text"
              value={showcase.imageUrl}
              onChange={(e) => setShowcase({ ...showcase, imageUrl: e.target.value })}
              placeholder="Image URL"
            />
            <input
              type="text"
              value={showcase.linkUrl}
              onChange={(e) => setShowcase({ ...showcase, linkUrl: e.target.value })}
              placeholder="Registration Link"
            />
            <textarea
              value={showcase.description}
              onChange={(e) => setShowcase({ ...showcase, description: e.target.value })}
              placeholder="Description"
            ></textarea>
            <button type="submit">Upload</button>
          </form>
        );

      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <LayoutWrapper 
      title="Coordinator Dashboard"
      showHeader={true}
      userName={getUserInfo()}
      onLogout={handleLogout}
      logo={logo}
    >
      <LogoutButton />
      {loading ? (
        <Loader />
      ) : (
        <Dashboard headings={headings} renderContent={renderTileContent} />
      )}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedEvent && (
          <div>
            <h2>{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
            <hr />
            <strong>Faculty Feedback:</strong>
            <ul>
              {selectedEvent.facultyApprovals.map((f, i) => (
                <li key={i}>
                  Faculty ID: {f.faculty}<br />
                  ✅ Approved: {f.approved === true ? 'Yes' : f.approved === false ? 'No' : 'Pending'}<br />
                  💬 Comment: {f.comment || 'None'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </LayoutWrapper>
  );
}

export default CoordinatorDashboard;
