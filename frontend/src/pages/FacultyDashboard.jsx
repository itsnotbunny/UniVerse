import { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import LayoutWrapper from '../components/LayoutWrapper';

function FacultyDashboard() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTile, setActiveTile] = useState('');
  const [comment, setComment] = useState('');
  const [suggestMode, setSuggestMode] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  const headings = [
    'Pending Requests',
    'Accepted Events',
    'Rejected Events',
    'Edits Suggested',
    'Attendance Lists',
    'Coordinator List',
    'Coordinator Approval'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventRes, userRes] = await Promise.all([
        axios.get(`${API}/api/events/pending`, { headers }),
        axios.get(`${API}/api/faculty/users`, { headers }),
      ]);
      setEvents(eventRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event, tile) => {
    setSelectedEvent(event);
    setActiveTile(tile);
    setModalOpen(true);
    setComment('');
  };

  const handleApprove = async () => {
    try {
      await axios.put(
        `${API}/api/events/${selectedEvent._id}/respond`,
        { approved: true, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("❌ Approve error:", err);
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(
        `${API}/api/events/${selectedEvent._id}/respond`,
        { approved: false, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("❌ Reject error:", err);
    }
  };

  const handleSuggestEdit = async () => {
    try {
      await axios.put(
        `${API}/api/events/${selectedEvent._id}/suggest-edits`,
        { comment: suggestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Suggestion submitted.");
      setModalOpen(false);
      setSuggestMode(false);
      setSuggestion('');
      fetchData();
    } catch (err) {
      console.error("❌ Suggest edits error:", err);
      alert("Failed to submit suggestion");
    }
  };

  const approveCoordinator = async (userId) => {
    try {
      await axios.put(`${API}/api/faculty/approve-coordinator/${userId}`, {
        role: 'studentCoordinator'
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error("❌ Coordinator approval error:", err);
    }
  };

  const rejectCoordinator = async (userId) => {
    try {
      await axios.delete(`${API}/api/faculty/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error("❌ Coordinator rejection error:", err);
    }
  };

  const renderTileContent = (heading) => {
    if (heading === 'Coordinator Approval') {
      const pending = users.filter(u => u.role === 'studentCoordinator' &&
        u.isApproved === null);
      return pending.length ? pending.map((u, i) => (
        <div key={i}>
          <strong>{u.name}</strong> — {u.email}
          <br />
          <button onClick={() => approveCoordinator(u._id)}>Approve</button>
          <button onClick={() => rejectCoordinator(u._id)} style={{ marginLeft: '10px' }}>Reject</button>
        </div>
      )) : <p>No pending coordinator requests.</p>;
    }

    if (heading === 'Coordinator List') {
      const coordinators = users.filter(u => u.role === 'studentCoordinator');
      return coordinators.length ? (
        <ul>
          {coordinators.map((c, i) => (
            <li key={i}>
              {c.name} {c.club ? `– ${c.club}` : ''}
            </li>
          ))}
        </ul>
      ) : <p>No coordinators available yet.</p>;
    }

    const filtered = events.filter(e => {
      const entry = e.facultyApprovals.find(f => f.faculty === e._id || f.faculty?._id === e._id);
      if (!entry) return false;

      switch (heading) {
        case 'Pending Requests': return entry.approved === null;
        case 'Accepted Events': return entry.approved === true;
        case 'Rejected Events': return entry.approved === false;
        case 'Edits Suggested': return entry.comment && entry.approved === null;
        default: return false;
      }
    });

    if (['Pending Requests', 'Accepted Events', 'Rejected Events', 'Edits Suggested'].includes(heading)) {
      return filtered.length ? filtered.map((event, i) => (
        <div
          key={i}
          className="request-item"
          onClick={() => openModal(event, heading)}
          style={{ cursor: 'pointer', marginBottom: '10px' }}
        >
          <strong>{event.title}</strong> — {event.clubName}
        </div>
      )) : <p>No {heading.toLowerCase()}.</p>;
    }

    if (heading === 'Attendance Lists') {
      return (
        <ul>
          <li><a href="https://sheets.google.com/dance" target="_blank" rel="noopener noreferrer">Dance Attendance</a></li>
          <li><a href="https://sheets.google.com/music" target="_blank" rel="noopener noreferrer">Music Attendance</a></li>
        </ul>
      );
    }

    return <p>Coming soon...</p>;
  };

  return (
    <LayoutWrapper title="Faculty Dashboard">
      <LogoutButton />
      {loading ? <Loader /> : <Dashboard headings={headings} renderContent={renderTileContent} />}
      <Modal isOpen={modalOpen} onClose={() => {
        setModalOpen(false);
        setSuggestMode(false);
        setSuggestion('');
      }}>
        {selectedEvent && (
          <div>
            <h2>{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
            <hr />
            {suggestMode ? (
              <div>
                <textarea
                  placeholder="Type suggested edits here..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                />
                <button onClick={handleSuggestEdit}>Submit Suggestion</button>
                <button onClick={() => setSuggestMode(false)} style={{ marginLeft: '10px' }}>Cancel</button>
              </div>
            ) : (
              <div className="popup-buttons">
                {activeTile === 'Pending Requests' ? (
                  <>
                    <button onClick={handleApprove}>Approve</button>
                    <button onClick={handleReject}>Reject</button>
                    <button onClick={() => setSuggestMode(true)}>Suggest Edits</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setModalOpen(false)}>Close</button>
                    <button onClick={() => setSuggestMode(true)}>Suggest Edits</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </LayoutWrapper>
  );
}

export default FacultyDashboard;
