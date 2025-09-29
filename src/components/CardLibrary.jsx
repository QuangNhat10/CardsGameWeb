import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './CardLibrary.css';

const CardLibrary = ({ onCardSelect, selectedCards = [] }) => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const loadCards = async () => {
            try {
                setLoading(true);
                setError(null);
                const cardData = await apiService.getAllCards();
                setCards(cardData);
                console.log('Cards loaded successfully:', cardData.length, 'cards');
            } catch (err) {
                console.error('Failed to load cards:', err);
                setError('Failed to load cards from server');
                // Set empty array as fallback
                setCards([]);
            } finally {
                setLoading(false);
            }
        };

        loadCards();
    }, []);

    const filteredCards = cards.filter(card => {
        if (filter === 'all') return true;
        return card.rarity?.toLowerCase() === filter.toLowerCase();
    });

    const handleCardClick = (card) => {
        if (onCardSelect) {
            onCardSelect(card);
        }
    };

    if (loading) {
        return (
            <div className="card-library">
                <div className="library-header">
                    <h3>Card Library</h3>
                </div>
                <div className="loading">Loading cards...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-library">
                <div className="library-header">
                    <h3>Card Library</h3>
                </div>
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="card-library">
            <div className="library-header">
                <h3>Card Library ({filteredCards.length})</h3>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rarity-filter"
                >
                    <option value="all">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="fusion">Fusion</option>
                </select>
            </div>

            <div className="cards-grid">
                {filteredCards.map((card, idx) => (
                    <div
                        key={card.id ?? `${card.name || 'card'}-${idx}`}
                        className={`card-item ${selectedCards.includes(card.id) ? 'selected' : ''}`}
                        onClick={() => handleCardClick(card)}
                    >
                        <div className="card-image">
                            <img
                                src={card.image || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"}
                                alt={card.name}
                                onError={(e) => {
                                    e.target.src = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
                                }}
                            />
                        </div>
                        <div className="card-info">
                            <div className="card-name">{card.name || card.label}</div>
                            <div className="card-rarity">{card.rarity}</div>
                            <div className="card-power">Power: {card.power || '?'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardLibrary;
