// src/components/Tile.jsx
import React, { useState } from 'react';
import './Tile.css';

const Tile = ({ title, content, type, actions = [] }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleAction = (action) => {
    alert(`${action} clicked for: ${title}`);
    setShowPopup(false);
  };

  return (
    <div className="tile">
      <h3 className="tile-title">{title}</h3>

      {type === 'textarea' && (
        <textarea
          className="tile-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here..."
        />
      )}

      {type === 'list' && (
        <ul className="tile-list">
          {content?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}

      {type === 'popup' && (
        <>
          <button className="tile-expand-btn" onClick={() => setShowPopup(true)}>
            View Details
          </button>

          {showPopup && (
            <div className="tile-popup">
              <div className="tile-popup-content">
                <h4>{title}</h4>
                <p>{content}</p>

                <div className="tile-popup-actions">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleAction(action)}
                      className={`tile-btn tile-btn-${action.toLowerCase().replace(/\s/g, '')}`}
                    >
                      {action}
                    </button>
                  ))}
                </div>

                <button className="tile-close" onClick={() => setShowPopup(false)}>×</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tile;