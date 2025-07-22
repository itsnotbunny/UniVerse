// components/LayoutWrapper.jsx
import './LayoutWrapper.css';

function LayoutWrapper({ title, children }) {
  return (
    <div className="layout-wrapper">
      <h1 className="dashboard-title">{title}</h1>
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}

export default LayoutWrapper;
