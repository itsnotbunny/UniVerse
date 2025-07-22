// src/components/LayoutWrapper.jsx
import './LayoutWrapper.css';

const LayoutWrapper = ({ children, title }) => {
  return (
    <div className="layout-wrapper">
      <div className="dashboard-grid">
        {title && <h1 className="dashboard-title">{title}</h1>}
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;
