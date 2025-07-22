// src/components/LayoutWrapper.jsx
import './LayoutWrapper.css';

const LayoutWrapper = ({ children, title, center }) => {
  return (
    <div className="layout-wrapper">
      {title && <h1 className="layout-title">{title}</h1>}
      <div className={center ? "layout-center" : "dashboard-grid"}>
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;