import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import socketService from '../../services/socket';
import apiService from '../../services/api';
import './styles.css';

const fallbackImg = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";

export default function Fusion() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableCards, setAvailableCards] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [fusedCard, setFusedCard] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    // Kiểm tra authentication
    useEffect(() => {
        const checkAuth = () => {
            const token = apiService.getAccessToken();
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                navigate('/login');
            }
        };

        checkAuth();
    }, [navigate]);

    // Kết nối socket và lắng nghe events
    useEffect(() => {
        if (!isAuthenticated) return;

        console.log('[fusion] Initializing socket connection...');
        const socket = socketService.connect();

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('[fusion] ✅ Connected to fusion room');
            socketService.emitJoinRoom('fusion-room');
        });

        socket.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log('[fusion] ❌ Disconnected from fusion room:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('[fusion] ❌ Socket connection error:', error);
            setIsConnected(false);
        });

        // Lắng nghe sự kiện generating (tiến trình tạo ảnh)
        socketService.onGenerating((data) => {
            console.log('Generating progress received:', data);
            setIsGenerating(true);
            setGenerationProgress(data.progress || 0);
        });

        // Lắng nghe sự kiện new-card-ready (ảnh mới đã sẵn sàng)
        socketService.onNewCardReady((data) => {
            console.log('New card ready received:', data);
            setIsGenerating(false);
            setGenerationProgress(0);

            // Hiển thị thẻ mới được tạo
            setFusedCard({
                id: data.cardId,
                name: data.cardData?.name || 'Fused Card',
                image: data.img || data.cardData?.imageUrl,
                description: data.cardData?.description || 'AI Generated Card',
                power: data.cardData?.power || Math.floor(Math.random() * 100),
                rarity: data.cardData?.rarity || 'Rare',
                parentIds: data.parentIds || []
            });

            // Reset selection sau khi ghép thành công
            setSelectedCards([]);
        });

        return () => {
            socketService.emitLeaveRoom('fusion-room');
        };
    }, [isAuthenticated]);

    // Load danh sách thẻ từ API
    useEffect(() => {
        if (!isAuthenticated) return;

        const loadCards = async () => {
            setLoading(true);
            setError(null);
            try {
                const cards = await apiService.getAllCards();
                setAvailableCards(cards);
                console.log(`Loaded ${cards.length} cards`);
            } catch (err) {
                console.error('Failed to load cards:', err);
                setError('Failed to load cards from server');
            } finally {
                setLoading(false);
            }
        };

        loadCards();
    }, [isAuthenticated]);

    // Xử lý chọn thẻ
    const handleCardSelect = useCallback((card) => {
        if (selectedCards.length >= 2) {
            setError('Bạn chỉ có thể chọn tối đa 2 thẻ để ghép');
            return;
        }

        if (selectedCards.find(c => c._id === card._id)) {
            setError('Thẻ này đã được chọn');
            return;
        }

        setSelectedCards(prev => [...prev, card]);
        setError(null);
    }, [selectedCards]);

    // Xử lý bỏ chọn thẻ
    const handleCardDeselect = useCallback((cardId) => {
        setSelectedCards(prev => prev.filter(c => c._id !== cardId));
        setError(null);
    }, []);

    // Xử lý ghép thẻ
    const handleFusion = async () => {
        if (selectedCards.length !== 2) {
            setError('Vui lòng chọn đúng 2 thẻ để ghép');
            return;
        }

        setLoading(true);
        setError(null);
        setIsGenerating(true);
        setGenerationProgress(0);

        try {
            const [card1, card2] = selectedCards;

            // Gửi yêu cầu ghép qua socket
            const fusionData = {
                requestId: `fusion_${Date.now()}`,
                card1Id: card1._id,
                card2Id: card2._id,
                card1Data: card1,
                card2Data: card2,
                resultName: `${card1.name} + ${card2.name}`
            };

            console.log('Sending fusion request:', fusionData);
            socketService.emitCardFusion(fusionData);

            // Cũng thử gọi API REST nếu có
            try {
                await apiService.mergeCards({
                    cardIds: [card1._id, card2._id]
                });
                console.log('✅ Fusion request sent via API');
            } catch (apiError) {
                console.log('⚠️ API fusion failed, using socket only:', apiError.message);
            }

        } catch (err) {
            console.error('Failed to start fusion:', err);
            setError('Failed to start fusion process');
            setIsGenerating(false);
            setGenerationProgress(0);
        } finally {
            setLoading(false);
        }
    };

    // Reset fusion
    const handleReset = () => {
        setSelectedCards([]);
        setFusedCard(null);
        setError(null);
        setIsGenerating(false);
        setGenerationProgress(0);
    };

    if (!isAuthenticated) {
        return (
            <div className="fusion-page">
                <Header />
                <div className="auth-required">
                    <h2>🔐 Authentication Required</h2>
                    <p>Vui lòng đăng nhập để sử dụng chức năng ghép thẻ</p>
                    <button onClick={() => navigate('/login')} className="btn-login">
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fusion-page">
            <Header />

            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'Connected to Server' : 'Disconnected from Server'}
                </div>
                {loading && <div className="loading-indicator">Loading...</div>}
                {error && <div className="error-message">{error}</div>}
            </div>

            {/* Header */}
            <div className="fusion-header">
                <h1>🃏 Card Fusion</h1>
                <p>Chọn 2 thẻ để ghép thành thẻ mới</p>
            </div>

            {/* Selected Cards */}
            <div className="selected-cards-section">
                <h2>Thẻ đã chọn ({selectedCards.length}/2)</h2>
                <div className="selected-cards">
                    {selectedCards.map((card, index) => (
                        <div key={card._id} className="selected-card">
                            <img
                                src={card.imageUrl || card.image || fallbackImg}
                                alt={card.name}
                                className="card-image"
                            />
                            <div className="card-info">
                                <h3>{card.name}</h3>
                                <p>Power: {card.power || 'N/A'}</p>
                                <p>Rarity: {card.rarity || 'N/A'}</p>
                            </div>
                            <button
                                onClick={() => handleCardDeselect(card._id)}
                                className="btn-remove"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {selectedCards.length === 2 && (
                    <div className="fusion-actions">
                        <button
                            onClick={handleFusion}
                            disabled={loading || isGenerating}
                            className="btn-fusion"
                        >
                            {isGenerating ? 'Đang ghép card...' : loading ? 'Đang ghép...' : 'Ghép Thẻ'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="btn-reset"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Generation Progress */}
            {isGenerating && (
                <div className="generation-progress">
                    <h3>Đang ghép card...</h3>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${generationProgress}%` }}
                        ></div>
                    </div>
                    <p>{generationProgress}% hoàn thành</p>
                </div>
            )}

            {/* Fused Card Result */}
            {fusedCard && (
                <div className="fused-card-result">
                    <h2>🎉 Thẻ mới đã được tạo!</h2>
                    <div className="fused-card">
                        <img
                            src={fusedCard.image || fallbackImg}
                            alt={fusedCard.name}
                            className="fused-card-image"
                        />
                        <div className="fused-card-info">
                            <h3>{fusedCard.name}</h3>
                            <p><strong>Mô tả:</strong> {fusedCard.description}</p>
                            <p><strong>Power:</strong> {fusedCard.power}</p>
                            <p><strong>Rarity:</strong> {fusedCard.rarity}</p>
                            <p><strong>Được tạo từ:</strong> {selectedCards.map(c => c.name).join(' + ')}</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="btn-new-fusion">
                        🔄 Ghép Thẻ Mới
                    </button>
                </div>
            )}

            {/* Available Cards */}
            <div className="available-cards-section">
                <h2>Thẻ có sẵn ({availableCards.length})</h2>
                <div className="cards-grid">
                    {availableCards.map((card) => (
                        <div
                            key={card._id}
                            className={`card-item ${selectedCards.find(c => c._id === card._id) ? 'selected' : ''}`}
                            onClick={() => handleCardSelect(card)}
                        >
                            <img
                                src={card.imageUrl || card.image || fallbackImg}
                                alt={card.name}
                                className="card-image"
                            />
                            <div className="card-info">
                                <h4>{card.name}</h4>
                                <p>Power: {card.power || 'N/A'}</p>
                                <p>Rarity: {card.rarity || 'N/A'}</p>
                            </div>
                            {selectedCards.find(c => c._id === card._id) && (
                                <div className="selected-indicator">✓</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
