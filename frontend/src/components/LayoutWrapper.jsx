// src/components/LayoutWrapper.jsx
import './LayoutWrapper.css';

const LayoutWrapper = ({ 
  children, 
  title, 
  center, 
  showHeader = false, 
  userName = "", 
  onLogout = null,
  logo = null 
}) => {
  return (
    <div className="layout-wrapper">
      {showHeader && (
        <div className="dashboard-header">
          <div className="logo-section">
            {logo && (
              <img 
                src={logo} 
                alt="UniVerse Logo" 
                className="dashboard-logo"
                style={{ height: '60px', width: '40px' }}
              />
            )}
            {title && <h1 className="header-title">{title}</h1>}
          </div>
          
          <div className="header-right">
            {userName && (
              <span className="user-info">{userName}</span>
            )}
            {onLogout && (
              <button 
                className="logout-btn" 
                onClick={onLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
      
      {!showHeader && title && <h1 className="layout-title">{title}</h1>}
      
      <div className={center ? "layout-center" : "dashboard-grid"}>
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;