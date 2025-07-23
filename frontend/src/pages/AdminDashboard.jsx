import LayoutWrapper from '../components/LayoutWrapper';
import Dashboard from '../components/Dashboard';
import LogoutButton from '../components/LogoutButton';
import Loader from '../components/Loader';
import Modal from '../components/Modal'; // ✅ Ensure this exists or I can provide one
import { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [coordinators, setCoordinators] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");

  const API = import.meta.env.VITE_API_BASE_URL;

  const headings = [
    'Dance', 'Music', 'Photography', 'Art',
    'Technical', 'Literary', 'Fashion', 'Book',
    'Student Coordinators', 'User Database',
    'Faculty Registration'
  ];

  useEffect(() => {
    fetchCoordinators();
    fetchPendingFaculty();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await axios.get('${API}/api/studentCoordinator/coordinators');
      setCoordinators(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch coordinators:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingFaculty = async () => {
    try {
      const res = await axios.get('${API}/api/faculty/pending');
      console.log("✅ Fetched faculty:", res.data);
      setPendingFaculty(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch pending faculty:", err);
      setPendingFaculty([]); // fallback
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
          ? '${API}/api/faculty/approve/${selectedFaculty._id}'
          : '${API}/api/faculty/reject/${selectedFaculty._id}';

      await axios.patch(endpoint);

      setShowModal(false);
      setSelectedFaculty(null);
      setActionType("");

      fetchPendingFaculty(); // Refresh tile
    } catch (err) {
      console.error("❌ Action failed:", err);
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
            <li key={i}>{c.name} — {c.club}</li>
          ))}
        </ul>
      );
    }

    if (heading === 'User Database') {
      return <p>Full user list to be implemented</p>;
    }

    if (heading === 'Faculty Registration') {
      return Array.isArray(pendingFaculty) && pendingFaculty.length > 0 ? (
        <ul>
          {pendingFaculty.map((f, i) => (
            <li key={i}>
              {f.name} — {f.email}
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => handleActionClick(f, "approve")}>Approve</button>
                <button onClick={() => handleActionClick(f, "reject")}>Reject</button>
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

      {/* ✅ Modal shown when Approve/Reject clicked */}
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h3>Confirm {actionType === "approve" ? "Approval" : "Rejection"}</h3>
          <p>
            Are you sure you want to {actionType}{" "}
            <strong>{selectedFaculty?.name}</strong>?
          </p>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleConfirmAction}>
              Yes, Confirm
            </button>
            <button onClick={handleCloseModal} style={{ marginLeft: "0.5rem" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </LayoutWrapper>
  );
}

export default AdminDashboard;