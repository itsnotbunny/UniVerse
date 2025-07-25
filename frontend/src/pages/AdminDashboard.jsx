import LayoutWrapper from '../components/LayoutWrapper';
import Dashboard from '../components/Dashboard';
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

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // Get user info from token or localStorage
  const getUserInfo = () => {
    try {
      const getUserInfo = () => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        return userInfo?.name || "Admin User";
      };
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        return parsed.name || "Admin User";
      }
      // Alternative: decode JWT token
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.name || "Admin User";
      }
      return "Admin User";
    } catch (error) {
      return "Admin User";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  const headings = [
    'Dance', 'Music', 'Photography', 'Art',
    'Technical', 'Literary', 'Fashion', 'Book',
    'Student Coordinators', 'All Faculty',
    'User Database', 'Faculty Registration'
  ];

  useEffect(() => {
    fetchCoordinators();
    fetchFaculty();
    fetchAllUsers();
    fetchPendingFaculty();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await axios.get(`${API}/api/studentcoordinator/coordinators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoordinators(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch coordinators:", err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/faculty`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFaculty(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch faculty:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch all users:", err);
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

  const renderTileContent = (heading) => {
    if (heading === 'Student Coordinators') {
      return (
        <ul>
          {coordinators.map((c, i) => (
            <li key={i}>{c.name} — {c.club || ''}</li>
          ))}
        </ul>
      );
    }

    if (heading === 'All Faculty') {
      return (
        <ul>
          {faculty.map((f, i) => (
            <li key={i}>
              {f.name} {f.facultyRole ? `— ${f.facultyRole}` : ''}
            </li>
          ))}
        </ul>
      );
    }

    if (heading === 'User Database') {
      const grouped = {
        admin: [],
        faculty: [],
        studentCoordinator: [],
      };

      [...coordinators, ...pendingFaculty].forEach((u) => {
        grouped[u.role]?.push(u);
      });

      return (
        <div>
          {['admin', 'faculty', 'studentCoordinator'].map((role) => (
            <div key={role} style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#fbbf24', marginBottom: '0.5rem' }}>
                {role === 'admin' ? 'Admins' : role === 'faculty' ? 'Facultys' : 'Student Coordinators'}
              </h4>
              <ul>
                {grouped[role].map((u, i) => (
                  <li key={i}>
                    {u.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    if (heading === 'Faculty Registration') {
      return Array.isArray(pendingFaculty) && pendingFaculty.length > 0 ? (
        <ul>
          {pendingFaculty.map((f, i) => (
            <li key={i} style={{ marginBottom: '1rem' }}>
              {f.name} — {f.email}
              <div style={{ marginTop: "0.5rem" }}>
                <button 
                  onClick={() => handleActionClick(f, "approve")}
                  style={{ 
                    backgroundColor: "#10b981", 
                    color: "white", 
                    padding: "6px 12px", 
                    border: "none", 
                    borderRadius: "6px",
                    marginRight: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleActionClick(f, "reject")}
                  style={{ 
                    backgroundColor: "#ef4444", 
                    color: "white", 
                    padding: "6px 12px", 
                    border: "none", 
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending faculty approvals</p>
      );
    }

    return <p>Club events or tools for {heading}</p>;
  };

  return (
    <LayoutWrapper 
      title="Admin Dashboard"
      showHeader={true}
      userName={getUserInfo()}
      onLogout={handleLogout}
      logo={logo} // Replace with your actual logo path
    >
      {loading ? (
        <Loader />
      ) : (
        <Dashboard headings={headings} renderContent={renderTileContent} />
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={handleCloseModal}>
          <h3>Confirm {actionType === "approve" ? "Approval" : "Rejection"}</h3>
          <p>
            Are you sure you want to {actionType} <strong>{selectedFaculty?.name}</strong>?
          </p>
          <div style={{ marginTop: "1rem" }}>
            <button 
              onClick={handleConfirmAction}
              style={{
                backgroundColor: "#4ade80",
                color: "#1f2937",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
                marginRight: "0.5rem"
              }}
            >
              Yes, Confirm
            </button>
            <button 
              onClick={handleCloseModal}
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </LayoutWrapper>
  );
}

export default AdminDashboard;