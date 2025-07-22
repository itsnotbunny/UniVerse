// src/components/Dashboard.jsx
import './Tile.css'; // shared styling for tiles
import './Dashboard.css';

const Dashboard = ({ headings = [], renderContent }) => {
  return (
    <>
      {headings.map((heading, index) => (
        <div className="tile" key={index}>
          <h3>{heading}</h3>
          <div className="tile-content">
            {renderContent(heading)}
          </div>
        </div>
      ))}
    </>
  );
};

export default Dashboard;
