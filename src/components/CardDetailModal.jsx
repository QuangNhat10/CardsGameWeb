import React from 'react';
import './CardDetailModal.css';

const CardDetailModal = ({ card, isOpen, onClose }) => {
  if (!isOpen || !card) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="card-detail-modal-overlay" onClick={handleBackdropClick}>
      <div className="card-detail-modal">
        <div className="modal-header">
          <h2>Card Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="card-image-section">
            <img 
              src={card.img || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"} 
              alt={card.label}
              className="card-detail-image"
            />
          </div>
          
          <div className="card-info-section">
            <div className="card-info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{card.label}</span>
              </div>
              
              <div className="info-item">
                <label>Description:</label>
                <span>{card.description || "No description available"}</span>
              </div>
              
              <div className="info-item">
                <label>Power:</label>
                <span className={`power-value ${getPowerClass(card.power)}`}>
                  {card.power ?? "Unknown"}
                </span>
              </div>
              
              <div className="info-item">
                <label>Rarity:</label>
                <span className={`rarity-badge ${getRarityClass(card.rarity)}`}>
                  {card.rarity || "Unknown"}
                </span>
              </div>
              
              {card._id && (
                <div className="info-item">
                  <label>Card ID:</label>
                  <span className="card-id">{card._id}</span>
                </div>
              )}
              
              {card.parentIds && card.parentIds.length > 0 && (
                <div className="info-item">
                  <label>Parent Cards:</label>
                  <span className="parent-ids">
                    {card.parentIds.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Card Stats Visualization */}
          <div className="card-stats-section">
            <h3>Card Statistics</h3>
            <div className="stats-visualization">
              <div className="stat-bar">
                <label>Power Level</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill power-fill"
                    style={{ width: `${Math.min((card.power || 0) / 100 * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="stat-value">{card.power || 0}/100</span>
              </div>
              
              <div className="stat-bar">
                <label>Rarity Level</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill rarity-fill"
                    style={{ width: `${getRarityPercentage(card.rarity)}%` }}
                  ></div>
                </div>
                <span className="stat-value">{getRarityPercentage(card.rarity)}%</span>
              </div>
            </div>
          </div>
          
          {/* Card Evolution Tree */}
          {card.parentIds && card.parentIds.length >= 2 && (
            <div className="evolution-tree">
              <h3>Evolution Tree</h3>
              <div className="tree-visualization">
                <div className="parent-cards">
                  <div className="parent-card">
                    <div className="parent-label">Parent 1</div>
                    <div className="parent-id">{card.parentIds[0]}</div>
                  </div>
                  <div className="fusion-symbol">+</div>
                  <div className="parent-card">
                    <div className="parent-label">Parent 2</div>
                    <div className="parent-id">{card.parentIds[1]}</div>
                  </div>
                </div>
                <div className="evolution-arrow">↓</div>
                <div className="result-card">
                  <div className="result-label">Result</div>
                  <div className="result-name">{card.label}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getPowerClass = (power) => {
  if (!power) return 'power-unknown';
  if (power >= 80) return 'power-legendary';
  if (power >= 60) return 'power-epic';
  if (power >= 40) return 'power-rare';
  if (power >= 20) return 'power-uncommon';
  return 'power-common';
};

const getRarityClass = (rarity) => {
  if (!rarity) return 'rarity-unknown';
  return `rarity-${rarity.toLowerCase().replace(/\s+/g, '-')}`;
};

const getRarityPercentage = (rarity) => {
  const rarityMap = {
    'Common': 20,
    'Uncommon': 40,
    'Rare': 60,
    'Epic': 80,
    'Legendary': 100,
    'AI Generated': 90
  };
  return rarityMap[rarity] || 0;
};

export default CardDetailModal;
