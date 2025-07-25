import { useEffect, useState } from 'react';
import LayoutWrapper from '../components/LayoutWrapper';
import '../components/Dashboard';

function FacultyDashboard() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCoordinatorModal, setShowCoordinatorModal] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [modalType, setModalType] = useState('');
  const [comment, setComment] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [suggestMode, setSuggestMode] = useState(false);

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const API = import.meta.env.VITE_API_BASE_URL;

  const tabs = [
    { id: 'pending', label: 'Pending Requests', icon: '⏳' },
    { id: 'approved', label: 'Approved Events', icon: '✅' },
    { id: 'rejected', label: 'Rejected Events', icon: '❌' },
    { id: 'suggested', label: 'Edits Suggested', icon: '💡' },
    { id: 'coordinators', label: 'Coordinators', icon: '👥' },
    { id: 'approval', label: 'Coordinator Approval', icon: '🔍' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetching events and users with correct endpoints
      const [eventRes, userRes] = await Promise.all([
        fetch(`${API}/api/events`, { headers }),
        fetch(`${API}/api/admin/users`, { headers }) // Using admin endpoint which should exist
      ]);

      if (eventRes.ok) {
        const eventsData = await eventRes.json();
        setEvents(eventsData);
      }

      if (userRes.ok) {
        const usersData = await userRes.json();
        setUsers(usersData);
      }

    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (eventId, approved, comment = '') => {
    try {
      const response = await fetch(`${API}/api/events/${eventId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved, comment })
      });

      if (response.ok) {
        alert(`Event ${approved ? 'approved' : 'rejected'} successfully!`);
        setShowEventModal(false);
        setComment('');
        fetchData();
      } else {
        throw new Error('Action failed');
      }
    } catch (err) {
      console.error("❌ Event action error:", err);
      alert('Action failed. Please try again.');
    }
  };

  const handleSuggestEdit = async () => {
    try {
      const response = await fetch(`${API}/api/events/${selectedEvent._id}/suggest-edits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: suggestion })
      });

      if (response.ok) {
        alert("Suggestion submitted successfully!");
        setShowEventModal(false);
        setSuggestMode(false);
        setSuggestion('');
        fetchData();
      } else {
        throw new Error('Suggestion failed');
      }
    } catch (err) {
      console.error("❌ Suggest edits error:", err);
      alert("Failed to submit suggestion");
    }
  };

  const handleCoordinatorAction = async (coordinatorId, approve) => {
    try {
      const url = approve 
        ? `${API}/api/faculty/approve-coordinator/${coordinatorId}`
        : `${API}/api/faculty/users/${coordinatorId}`;
      
      const method = approve ? 'PUT' : 'DELETE';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`Coordinator ${approve ? 'approved' : 'rejected'} successfully!`);
        setShowCoordinatorModal(false);
        setSelectedCoordinator(null);
        fetchData();
      } else {
        throw new Error('Action failed');
      }
    } catch (err) {
      console.error("❌ Coordinator action error:", err);
      alert('Action failed. Please try again.');
    }
  };

  const getFilteredEvents = (filter) => {
    return events.filter(event => {
      const facultyApproval = event.facultyApprovals?.find(
        approval => approval.faculty === userInfo._id || approval.faculty?._id === userInfo._id
      );
      
      if (!facultyApproval) return filter === 'pending';
      
      switch (filter) {
        case 'pending':
          return facultyApproval.approved === null;
        case 'approved':
          return facultyApproval.approved === true;
        case 'rejected':
          return facultyApproval.approved === false;
        case 'suggested':
          return facultyApproval.comment && facultyApproval.approved === null;
        default:
          return false;
      }
    });
  };

  const getPendingCoordinators = () => {
    return users.filter(user => 
      user.role === 'studentCoordinator' && (user.isApproved === null || user.isApproved === undefined)
    );
  };

  const getApprovedCoordinators = () => {
    return users.filter(user => 
      user.role === 'studentCoordinator' && user.isApproved === true
    );
  };

  const renderEventCard = (event) => (
    <div key={event._id} className="dashboard-card" onClick={() => {
      setSelectedEvent(event);
      setShowEventModal(true);
    }}>
      <div className="card-header">
        <h3>{event.title}</h3>
        <span className="club-name">{event.clubName}</span>
      </div>
      <div className="card-content">
        <p className="event-date">📅 {new Date(event.date).toLocaleDateString()}</p>
        <p className="event-description">{event.description?.substring(0, 100)}...</p>
      </div>
      <div className="card-footer">
        <span className="event-status">
          {event.facultyApprovals?.find(a => a.faculty === userInfo._id)?.approved === true ? '✅ Approved' :
           event.facultyApprovals?.find(a => a.faculty === userInfo._id)?.approved === false ? '❌ Rejected' :
           '⏳ Pending'}
        </span>
      </div>
    </div>
  );

  const renderCoordinatorCard = (coordinator) => (
    <div key={coordinator._id} className="dashboard-card">
      <div className="card-header">
        <h3>{coordinator.name}</h3>
        <span className="coordinator-email">{coordinator.email}</span>
      </div>
      <div className="card-content">
        <p>Role: Student Coordinator</p>
        {coordinator.club && <p>Club: {coordinator.club}</p>}
      </div>
      {activeTab === 'approval' && (
        <div className="card-actions">
          <button 
            className="btn-approve"
            onClick={() => {
              setSelectedCoordinator(coordinator);
              setModalType('approve');
              setShowCoordinatorModal(true);
            }}
          >
            ✅ Approve
          </button>
          <button 
            className="btn-reject"
            onClick={() => {
              setSelectedCoordinator(coordinator);
              setModalType('reject');
              setShowCoordinatorModal(true);
            }}
          >
            ❌ Reject
          </button>
        </div>
      )}
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
      case 'pending':
      case 'approved':
      case 'rejected':
      case 'suggested': {
        const filteredEvents = getFilteredEvents(activeTab);
        return (
          <div className="cards-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(renderEventCard)
            ) : (
              <div className="empty-state">
                <h3>No {activeTab} events</h3>
                <p>There are currently no events in this category.</p>
              </div>
            )}
          </div>
        );
      }
      case 'coordinators': {
        const coordinators = getApprovedCoordinators();
        return (
          <div className="cards-grid">
            {coordinators.length > 0 ? (
              coordinators.map(renderCoordinatorCard)
            ) : (
              <div className="empty-state">
                <h3>No Coordinators</h3>
                <p>No approved coordinators found.</p>
              </div>
            )}
          </div>
        );
      }
      case 'approval': {
        const pendingCoordinators = getPendingCoordinators();
        return (
          <div className="cards-grid">
            {pendingCoordinators.length > 0 ? (
              pendingCoordinators.map(renderCoordinatorCard)
            ) : (
              <div className="empty-state">
                <h3>No Pending Approvals</h3>
                <p>No coordinators waiting for approval.</p>
              </div>
            )}
          </div>
        );
      }
      default:
        return <div>Invalid tab</div>;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  return (
    <LayoutWrapper title="Faculty Dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <h1>Welcome, {userInfo.name}</h1>
              <p className="user-role">Faculty Dashboard</p>
            </div>
            <button onClick={logout} className="btn-logout">
              🚪 Logout
            </button>
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

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="event-details">
                <p><strong>Club:</strong> {selectedEvent.clubName}</p>
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
              </div>
              
              {suggestMode ? (
                <div className="suggest-mode">
                  <h3>Suggest Edits</h3>
                  <textarea
                    placeholder="Type your suggestions here..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="suggestion-textarea"
                  />
                  <div className="modal-actions">
                    <button className="btn-primary" onClick={handleSuggestEdit}>
                      Submit Suggestion
                    </button>
                    <button className="btn-secondary" onClick={() => setSuggestMode(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="event-actions">
                  <textarea
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="comment-textarea"
                  />
                  <div className="modal-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleEventAction(selectedEvent._id, true, comment)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleEventAction(selectedEvent._id, false, comment)}
                    >
                      ❌ Reject
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => setSuggestMode(true)}
                    >
                      💡 Suggest Edits
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coordinator Modal */}
      {showCoordinatorModal && selectedCoordinator && (
        <div className="modal-overlay" onClick={() => setShowCoordinatorModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm {modalType === 'approve' ? 'Approval' : 'Rejection'}</h2>
              <button className="modal-close" onClick={() => setShowCoordinatorModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to <strong>{modalType}</strong> {' '}
                <strong>{selectedCoordinator.name}</strong> as Student Coordinator?
              </p>
              <div className="modal-actions">
                <button 
                  className={modalType === 'approve' ? 'btn-approve' : 'btn-reject'}
                  onClick={() => handleCoordinatorAction(selectedCoordinator._id, modalType === 'approve')}
                >
                  Yes, {modalType === 'approve' ? 'Approve' : 'Reject'}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCoordinatorModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}

export default FacultyDashboard;