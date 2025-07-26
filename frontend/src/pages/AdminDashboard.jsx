import LayoutWrapper from '../components/LayoutWrapper';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import logo from '../assets/UniVerseLogo.jpg';

import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [activeTab, setActiveTab] = useState('dance');

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  const tabs = [
    { id: 'dance', label: 'Dance', icon: '💃' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'photography', label: 'Photography', icon: '📸' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '💻' },
    { id: 'literary', label: 'Literary', icon: '📚' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'book', label: 'Book', icon: '📖' },
    { id: 'coordinators', label: 'Coordinators', icon: '👥' },
    { id: 'faculty', label: 'All Faculty', icon: '👨‍🏫' },
    { id: 'users', label: 'User Database', icon: '👤' },
    { id: 'registration', label: 'Faculty Registration', icon: '📝' }
  ];

  const getUserInfo = () => {
    try {
      const info = JSON.parse(localStorage.getItem("userInfo"));
      return info?.name || "Admin User";
    } catch {
      return "Admin User";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchCoordinators();
    fetchFaculty();
    fetchAllUsers();
    fetchPendingFaculty();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/coordinators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoordinators(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch coordinators:", err);
      setCoordinators([]);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/faculty`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaculty(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch faculty:", err);
      setFaculty([]);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch all users:", err);
      setAllUsers([]);
    }
  };

  const fetchPendingFaculty = async () => {
    try {
      const res = await axios.get(`${API}/api/faculty/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingFaculty(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch pending faculty:", err);
      setPendingFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (faculty, type) => {
    setSelectedFaculty(faculty);
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedFaculty || !actionType) return;

    try {
      const endpoint =
        actionType === "approve"
          ? `${API}/api/faculty/approve/${selectedFaculty._id}`
          : `${API}/api/faculty/reject/${selectedFaculty._id}`;

      await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Successfully ${actionType}ed ${selectedFaculty.name}`);
      setShowModal(false);
      setSelectedFaculty(null);
      setActionType("");
      fetchPendingFaculty();
      fetchAllUsers();
    } catch (err) {
      console.error("❌ Action failed:", err);
      alert("Action failed. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFaculty(null);
    setActionType("");
  };

  const renderCoordinatorCard = (coordinator) => (
    <div key={coordinator._id} className="dashboard-card">
      <div className="card-header">
        <h3>{coordinator.name}</h3>
        <span className="card-subtitle">{coordinator.club || 'No Club Assigned'}</span>
      </div>
      <div className="card-content">
        <p>Email: {coordinator.email || 'N/A'}</p>
        <p>Role: Student Coordinator</p>
      </div>
    </div>
  );

  const renderFacultyCard = (facultyMember) => (
    <div key={facultyMember._id} className="dashboard-card">
      <div className="card-header">
        <h3>{facultyMember.name}</h3>
        <span className="card-subtitle">{facultyMember.facultyRole || 'Faculty'}</span>
      </div>
      <div className="card-content">
        <p>Email: {facultyMember.email || 'N/A'}</p>
        <p>Status: {facultyMember.isOnline ? '🟢 Online' : '⚫ Offline'}</p>
      </div>
    </div>
  );

  const renderPendingFacultyCard = (facultyMember) => (
    <div key={facultyMember._id} className="dashboard-card">
      <div className="card-header">
        <h3>{facultyMember.name}</h3>
        <span className="card-subtitle">Pending Approval</span>
      </div>
      <div className="card-content">
        <p>Email: {facultyMember.email || 'N/A'}</p>
        <p>Role: {facultyMember.facultyRole || 'Faculty'}</p>
      </div>
      <div className="card-actions">
        <button
          onClick={() => handleActionClick(facultyMember, "approve")}
          className="btn-approve"
        >
          ✅ Approve
        </button>
        <button
          onClick={() => handleActionClick(facultyMember, "reject")}
          className="btn-reject"
        >
          ❌ Reject
        </button>
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
      case 'coordinators':
        return (
          <div className="cards-grid">
            {Array.isArray(coordinators) && coordinators.length > 0 ? (
              coordinators.map(renderCoordinatorCard)
            ) : (
              <p className="empty-state">No coordinators found</p>
            )}
          </div>
        );

      case 'faculty':
        return (
          <div className="cards-grid">
            {Array.isArray(faculty) && faculty.length > 0 ? (
              faculty.map(renderFacultyCard)
            ) : (
              <p className="empty-state">No faculty members found</p>
            )}
          </div>
        );

      case 'users':
        const grouped = {
          admin: [],
          faculty: [],
          studentCoordinator: [],
        };
        allUsers.forEach((user) => {
          if (grouped[user.role]) grouped[user.role].push(user);
        });

        return (
          <div className="cards-grid">
            {['admin', 'faculty', 'studentCoordinator'].map((role) => (
              <div key={role} className="dashboard-card">
                <div className="card-header">
                  <h3>
                    {role === 'admin'
                      ? 'Admins'
                      : role === 'faculty'
                      ? 'Faculty Members'
                      : 'Student Coordinators'}
                  </h3>
                  <span className="card-subtitle">{grouped[role].length} users</span>
                </div>
                <div className="card-content">
                  {grouped[role].length > 0 ? (
                    <ul className="user-list">
                      {grouped[role].map((user, j) => (
                        <li key={j} className="user-item">
                          <strong>{user.name}</strong>
                          {user.email && <span> - {user.email}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No users in this category</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'registration':
        return (
          <div className="cards-grid">
            {Array.isArray(pendingFaculty) && pendingFaculty.length > 0 ? (
              pendingFaculty.map(renderPendingFacultyCard)
            ) : (
              <p className="empty-state">No pending faculty registrations</p>
            )}
          </div>
        );

      default:
        return (
          <div className="empty-state">
            <h3>Club Management - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <p>Club events and management tools for {activeTab} will be displayed here.</p>
          </div>
        );
    }
  };

  return (
    <LayoutWrapper title="Admin Dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <h1>Welcome, {getUserInfo()}</h1>
              <p className="user-role">Admin Dashboard</p>
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

      {showModal && (
        <Modal isOpen={showModal} onClose={handleCloseModal}>
          <div className="modal-content">
            <h3>Confirm {actionType === "approve" ? "Approval" : "Rejection"}</h3>
            <p>
              Are you sure you want to <strong>{actionType}</strong> faculty member:{" "}
              <strong>{selectedFaculty?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={handleConfirmAction}
                className="btn-primary"
              >
                Yes, Confirm
              </button>
              <button
                onClick={handleCloseModal}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </LayoutWrapper>
  );
}

export default AdminDashboard;