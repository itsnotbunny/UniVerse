import { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

function CoordinatorDashboard() {
  const [events, setEvents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTile, setActiveTile] = useState('');

  const token = localStorage.getItem('token');
  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [eventRes, facultyRes] = await Promise.all([
        axios.get(`${API}/api/events/pending`, { headers }),
        axios.get(`${API}/api/admin/faculty`, { headers }),
      ]);

      setEvents(eventRes.data);
      setFaculty(facultyRes.data);
    } catch (err) {
      console.error("❌ Coordinator fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event, tile) => {
    setSelectedEvent(event);
    setActiveTile(tile);
    setModalOpen(true);
  };

  const headings = [
    'Events Sent',
    'Idea Board',
    'Events Status',
    'Faculty Status',
    'Faculty List',
    'Event Organisation'
  ];

  const renderTileContent = (heading) => {
    switch (heading) {
      case 'Events Sent':
        return events.map((e, i) => (
          <div key={e._id || i} onClick={() => openModal(e, heading)} className="request-item" style={{ cursor: 'pointer' }}>
            <strong>{e.title}</strong> — {e.clubName}
          </div>
        ));

      case 'Events Status':
        return events.map((e, i) => {
          const approvedCount = e.facultyApprovals.filter(a => a.approved === true).length;
          const rejectedCount = e.facultyApprovals.filter(a => a.approved === false).length;
          const pendingCount = e.facultyApprovals.filter(a => a.approved === null).length;

          return (
            <div key={e._id || i} onClick={() => openModal(e, heading)} className="request-item" style={{ cursor: 'pointer' }}>
              <strong>{e.title}</strong> — Status: <em>{e.status}</em><br />
              ✅ {approvedCount} | ❌ {rejectedCount} | ⏳ {pendingCount}
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
          <div key={i}>{f.name} ({f.facultyRole}) — {f.isOnline ? '🟢 Online' : '⚫ Offline'}</div>
        ));

      case 'Idea Board':
        return (
          <textarea placeholder="Write ideas here..." style={{ width: '100%', height: '120px' }}></textarea>
        );

      case 'Event Organisation':
        return (
          <textarea placeholder="Describe event flow..." style={{ width: '100%', height: '120px' }}></textarea>
        );

      default:
        return <p>Coming soon...</p>;
    }
  };

  return (
    <div>
      <LogoutButton />
      {loading ? <Loader /> : <Dashboard headings={headings} renderContent={renderTileContent} />}

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
    </div>
  );
}

export default CoordinatorDashboard;
