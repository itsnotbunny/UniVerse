import { useEffect, useState } from 'react';
import axios from 'axios';
import LayoutWrapper from '../components/LayoutWrapper';
import Dashboard from '../components/Dashboard';
import Loader from '../components/Loader';

function StudentDashboard() {
  const [showcaseItems, setShowcaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const categories = ['Dance', 'Music', 'Photography', 'Art', 'Technical', 'Literary', 'Fashion', 'Book'];

  useEffect(() => {
    fetchShowcaseItems();
  }, []);

  const fetchShowcaseItems = async () => {
    try {
      const res = await axios.get(`${API}/api/showcase`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowcaseItems(res.data);
    } catch (err) {
      console.error("❌ Showcase fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (category) => {
    const items = showcaseItems.filter(item => item.club === category);
    if (items.length === 0) return <p>No events yet for {category}.</p>;

    return items.map((item, i) => (
      <div key={i} className="showcase-item">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />}
        {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">Register Here</a>}
      </div>
    ));
  };

  return (
    <LayoutWrapper title="Student Dashboard">
      {loading ? <Loader /> : <Dashboard headings={categories} renderContent={renderContent} />}
    </LayoutWrapper>
  );
}

export default StudentDashboard;