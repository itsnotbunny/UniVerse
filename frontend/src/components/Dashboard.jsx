import React from 'react';
import './Dashboard.css';

const Dashboard = ({ role, tiles }) => {
  return (
    <div className="dashboard-container">
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h2>
      <div className="tile-grid">
        {tiles.map((tile, index) => (
          <div className="tile" key={index}>
            <h3>{tile}</h3>
            {/* You can plug in dynamic content later here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
