import { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

function FacultyDashboard() {
  const [events, setEvents] = useState([]);
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
    'Coordinator List'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/api/events/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error("❌ Error fetching events:", err);
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

  const handleAction = async (approved) => {
    try {
      await axios.put(
        `${API}/api/events/${selectedEvent._id}/respond`,
        { approved, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("❌ Action failed:", err);
    }
  };

  const renderTileContent = (heading) => {
    const filtered = events.filter(e => {
      const facultyEntry = e.facultyApprovals.find(a => a.faculty === e._id || a.faculty?._id === e._id);
      if (!facultyEntry) return false;

      switch (heading) {
        case 'Pending Requests': return facultyEntry.approved === null;
        case 'Accepted Events': return facultyEntry.approved === true;
        case 'Rejected Events': return facultyEntry.approved === false;
        case 'Edits Suggested': return facultyEntry.comment && !facultyEntry.approved;
        default: return false;
      }
    });

    const handleSuggestEdit = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.put(
          `${API}/api/events/${selectedEvent._id}/suggest-edits`,
          { comment: suggestion },
          { headers }
        );
        alert("Suggestion submitted.");
        setModalOpen(false);
        setSuggestMode(false);
        setSuggestion('');
        fetchEvents(); // refresh list
      } catch (err) {
        console.error("❌ Suggest edits error:", err);
        alert("Failed to submit suggestion");
      }
    };

    if (['Pending Requests', 'Accepted Events', 'Rejected Events', 'Edits Suggested'].includes(heading)) {
      if (filtered.length === 0) return <p>No {heading.toLowerCase()}.</p>;
      return filtered.map((event, i) => (
        <div
          key={event._id || i}
          className="request-item"
          onClick={() => openModal(event, heading)}
          style={{ cursor: 'pointer', marginBottom: '10px' }}
        >
          <strong>{event.title}</strong> — {event.clubName}
        </div>
      ));
    }

    if (heading === 'Attendance Lists') {
      return (
        <ul>
          <li><a href="https://sheets.google.com/dance" target="_blank">Dance Event Attendance</a></li>
          <li><a href="https://sheets.google.com/music" target="_blank">Music Workshop Attendance</a></li>
        </ul>
      );
    }

    if (heading === 'Coordinator List') {
      return (
        <ul>
          <li>Alice - Music Club</li>
          <li>Bob - Tech Club</li>
        </ul>
      );
    }

    return <p>Coming soon...</p>;
  };

  return (
    <div>
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
                {activeTile === 'Pending Requests' && (
                  <>
                    <button onClick={handleApprove}>Approve</button>
                    <button onClick={handleReject}>Reject</button>
                    <button onClick={() => setSuggestMode(true)}>Suggest Edits</button>
                  </>
                )}

                {activeTile !== 'Pending Requests' && (
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
    </div>
  );
}

export default FacultyDashboard;
