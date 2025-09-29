import React, { useState, useEffect } from 'react';
import './CombinationModal.css';

const CombinationModal = ({ card, isOpen, onClose, allCards }) => {
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      findCombinations();
    }
  }, [isOpen, card]);

  const findCombinations = () => {
    setLoading(true);
    
    // Tìm các thẻ có thể kết hợp với thẻ hiện tại
    const possibleCombinations = [];
    
    allCards.forEach(otherCard => {
      if (otherCard.id !== card._id && otherCard.id !== card.id) {
        // Tạo sơ đồ kết hợp giả lập
        const combination = {
          id: `${card._id || card.id}-${otherCard.id}`,
          card1: card,
          card2: otherCard,
          result: generateCombinationResult(card, otherCard),
          compatibility: calculateCompatibility(card, otherCard)
        };
        possibleCombinations.push(combination);
      }
    });

    // Sắp xếp theo độ tương thích
    possibleCombinations.sort((a, b) => b.compatibility - a.compatibility);
    
    setCombinations(possibleCombinations.slice(0, 10)); // Chỉ hiển thị 10 kết hợp tốt nhất
    setLoading(false);
  };

  const generateCombinationResult = (card1, card2) => {
    const power1 = card1.power || 0;
    const power2 = card2.power || 0;
    const avgPower = Math.floor((power1 + power2) / 2);
    
    const rarity1 = card1.rarity || 'Common';
    const rarity2 = card2.rarity || 'Common';
    
    // Logic tạo rarity kết hợp
    let resultRarity = 'Common';
    if (rarity1 === 'Legendary' || rarity2 === 'Legendary') {
      resultRarity = 'Epic';
    } else if (rarity1 === 'Epic' || rarity2 === 'Epic') {
      resultRarity = 'Rare';
    } else if (rarity1 === 'Rare' || rarity2 === 'Rare') {
      resultRarity = 'Uncommon';
    } else if (rarity1 === 'Uncommon' || rarity2 === 'Uncommon') {
      resultRarity = 'Common';
    }

    return {
      name: `${card1.label} + ${card2.label}`,
      power: avgPower + Math.floor(Math.random() * 20),
      rarity: resultRarity,
      description: `Kết hợp giữa ${card1.label} và ${card2.label}`,
      image: card1.img || card2.img || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"
    };
  };

  const calculateCompatibility = (card1, card2) => {
    let score = 50; // Base score
    
    const power1 = card1.power || 0;
    const power2 = card2.power || 0;
    const powerDiff = Math.abs(power1 - power2);
    
    // Càng gần nhau về power càng tương thích
    if (powerDiff < 20) score += 20;
    else if (powerDiff < 40) score += 10;
    else score -= 10;
    
    // Cùng rarity tăng tương thích
    if (card1.rarity === card2.rarity) score += 15;
    
    // Random factor
    score += Math.floor(Math.random() * 20) - 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    if (score >= 40) return '#ff5722';
    return '#f44336';
  };

  const getCompatibilityText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (!isOpen || !card) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="combination-modal-overlay" onClick={handleBackdropClick}>
      <div className="combination-modal">
        <div className="modal-header">
          <h2>Combination Analysis</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="selected-card-section">
            <h3>Selected Card</h3>
            <div className="selected-card-info">
              <img 
                src={card.img || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"} 
                alt={card.label}
                className="selected-card-image"
              />
              <div className="selected-card-details">
                <h4>{card.label}</h4>
                <p><strong>Power:</strong> {card.power ?? 'Unknown'}</p>
                <p><strong>Rarity:</strong> {card.rarity || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="combinations-section">
            <h3>Possible Combinations</h3>
            {loading ? (
              <div className="loading">Analyzing combinations...</div>
            ) : (
              <div className="combinations-list">
                {combinations.map((combo, index) => (
                  <div key={combo.id} className="combination-item">
                    <div className="combination-flow">
                      <div className="card-pair">
                        <div className="card-mini">
                          <img src={combo.card1.img || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"} alt={combo.card1.label} />
                          <span>{combo.card1.label}</span>
                        </div>
                        <div className="plus-sign">+</div>
                        <div className="card-mini">
                          <img src={combo.card2.img || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"} alt={combo.card2.label} />
                          <span>{combo.card2.label}</span>
                        </div>
                      </div>
                      
                      <div className="arrow-down">↓</div>
                      
                      <div className="result-card">
                        <img src={combo.result.image} alt={combo.result.name} />
                        <div className="result-info">
                          <h5>{combo.result.name}</h5>
                          <p>Power: {combo.result.power}</p>
                          <span className={`rarity-badge ${getRarityClass(combo.result.rarity)}`}>
                            {combo.result.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="compatibility-score">
                      <div className="score-label">Compatibility</div>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${combo.compatibility}%`,
                            backgroundColor: getCompatibilityColor(combo.compatibility)
                          }}
                        ></div>
                      </div>
                      <div className="score-text" style={{ color: getCompatibilityColor(combo.compatibility) }}>
                        {combo.compatibility}% - {getCompatibilityText(combo.compatibility)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const getRarityClass = (rarity) => {
  if (!rarity) return 'rarity-unknown';
  return `rarity-${rarity.toLowerCase().replace(/\s+/g, '-')}`;
};

export default CombinationModal;
