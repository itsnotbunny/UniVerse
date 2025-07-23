import LayoutWrapper from '../components/LayoutWrapper';
import Dashboard from '../components/Dashboard';
import LogoutButton from '../components/LogoutButton';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

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
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Faculty Role</th>
              <th>Online</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((f, i) => (
              <tr key={i}>
                <td>{f.name}</td>
                <td>{f.email}</td>
                <td>{f.facultyRole || 'N/A'}</td>
                <td>{f.isOnline ? '🟢' : '⚫'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <h4 style={{ color: 'gold', marginBottom: '0.5rem' }}>
                {role === 'admin' ? 'Admins' : role === 'faculty' ? 'Facultys' : 'Student Coordinators'}
              </h4>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    {role !== 'admin' && <th>Club</th>}
                  </tr>
                </thead>
                <tbody>
                  {grouped[role].map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      {role !== 'admin' && <td>{u.club || '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      );
    }

    if (heading === 'Faculty Registration') {
      return Array.isArray(pendingFaculty) && pendingFaculty.length > 0 ? (
        <ul>
          {pendingFaculty.map((f, i) => (
            <li key={i}>
              {f.name} — {f.email}
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => handleActionClick(f, "approve")}
                  style={{ backgroundColor: "#28a745", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px" }}>
                  Approve
                </button>
                <button onClick={() => handleActionClick(f, "reject")}
                  style={{ backgroundColor: "#dc3545", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", marginLeft: "1rem" }}>
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
    <LayoutWrapper title="Admin Dashboard">
      <LogoutButton />
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
            <button onClick={handleConfirmAction}>Yes, Confirm</button>
            <button onClick={handleCloseModal} style={{ marginLeft: "0.5rem" }}>Cancel</button>
          </div>
        </Modal>
      )}
    </LayoutWrapper>
  );
}

export default AdminDashboard;