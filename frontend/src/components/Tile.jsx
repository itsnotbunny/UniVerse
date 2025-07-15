import React, { useState } from 'react';
import './Tile.css';

const Tile = ({ title, content, type, actions = [] }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleAction = (action) => {
    // Placeholder for action handlers like approve/reject/suggest edits
    alert(`${action} clicked for: ${title}`);
    setShowPopup(false);
  };

  return (
    <div className="tile">
      <h3 className="tile-title">{title}</h3>

      {/* Type: Text Area */}
      {type === 'textarea' && (
        <textarea
          className="tile-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type here..."
        />
      )}

      {/* Type: List */}
      {type === 'list' && (
        <ul className="tile-list">
          {content?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}

      {/* Type: Popup/Expandable */}
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
                      className={`tile-btn tile-btn-${action.toLowerCase()}`}
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
