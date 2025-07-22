// components/LayoutWrapper.jsx
import './Dashboard.css';

function LayoutWrapper({ children }) {
  return (
    <div className="dashboard-wrapper">
      <div className="tile-grid">{children}</div>
    </div>
  );
}

export default LayoutWrapper;
