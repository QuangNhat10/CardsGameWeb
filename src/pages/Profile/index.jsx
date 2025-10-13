import React, { useState, useEffect } from "react";
import apiService from "../../services/api";
import { Link } from "react-router-dom";
import socketService from "../../services/socket";

const mockUser = {
  username: "player_one92",
  email: "player.one92@example.com",
  sdt: "+84 912 345 678",
  displayName: "Nguyễn Tuấn",
  country: "Vietnam",
  avatarColor: "#6C5CE7",
  level: 27,
  rank: "Diamond III",
  score: 14280,
  achievements: [
    {
      id: "a1",
      title: "Top 100 Ranked",
      desc: "Reached top 100 in seasonal ladder",
    },
    { id: "a2", title: "Collector I", desc: "Own 50 unique cards" },
    { id: "a3", title: "Win Streak", desc: "Win 10 matches in a row" },
  ],
};

const matchHistory = [
  {
    id: "m1",
    date: "2025-09-12",
    opponent: "alpha_gamer",
    result: "Win",
    score: "3-1",
  },
  {
    id: "m2",
    date: "2025-09-10",
    opponent: "deck_master",
    result: "Loss",
    score: "2-3",
  },
  {
    id: "m3",
    date: "2025-09-07",
    opponent: "noob_slayer",
    result: "Win",
    score: "3-0",
  },
  {
    id: "m4",
    date: "2025-09-01",
    opponent: "pro_builder",
    result: "Win",
    score: "3-2",
  },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0b0f12,#0f1418)",
    color: "#E6EEF6",
    padding: 28,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  back: {
    color: "#9aa8b8",
    textDecoration: "none",
    fontSize: 13,
    display: "inline-block",
    marginBottom: 18,
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 18,
    alignItems: "start",
  },
  profileCard: {
    background: "linear-gradient(180deg,#0f1417,#0b0d0f)",
    borderRadius: 12,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.04)",
  },
  avatarBox: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 800,
    color: "#fff",
    boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.4)",
  },
  name: { fontSize: 18, fontWeight: 800 },
  username: { color: "#9aa8b8", fontSize: 13 },
  statRow: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
  statBox: {
    flex: "1 1 100px",
    background: "rgba(255,255,255,0.02)",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.03)",
  },
  section: {
    background: "linear-gradient(180deg,#0f1417,#0b0d0f)",
    borderRadius: 12,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.04)",
    marginBottom: 18,
  },
  sectionTitle: { fontSize: 16, fontWeight: 800, marginBottom: 12 },
  collectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  cardItem: {
    background: "linear-gradient(180deg,#141618,#1a1d20)",
    padding: 8,
    borderRadius: 10,
    textAlign: "center",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  cardImg: {
    width: "100%",
    height: 90,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 8,
  },
  historyTable: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 6px", color: "#9aa8b8", fontSize: 13 },
  td: { padding: "8px 6px", borderTop: "1px solid rgba(255,255,255,0.03)" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,10,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1200,
  },
  modal: {
    background: "#0b0d0f",
    borderRadius: 12,
    padding: 18,
    width: "min(720px, 96%)",
    color: "#e6eef6",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 8,
    background: "#12212a",
    color: "#bfe6ff",
    fontWeight: 700,
    fontSize: 13,
  },
  smallMuted: { color: "#9aa8b8", fontSize: 13 },
};

function Avatar({ name, color, size = 96 }) {
  const initials = name
    ? name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "U";
  return (
    <div
      style={{ ...styles.avatar, width: size, height: size, background: color }}
    >
      {initials}
    </div>
  );
}

export default function Profile() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  // Player Profile API states
  const [playerProfile, setPlayerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState({ gold: 0, gem: 0 });
  const [playerCards, setPlayerCards] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [availableCards, setAvailableCards] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCardsToDelete, setSelectedCardsToDelete] = useState([]);
  const [globalMessage, setGlobalMessage] = useState("");

  const user = (() => {
    try { 
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : mockUser;
    } catch { 
      return mockUser;
    }
  })();

  // Load player profile data - GET /player-profiles
  useEffect(() => {
    const loadPlayerProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('No token found');
        setError('Vui lòng đăng nhập để xem thông tin hồ sơ.');
        setPlayerProfile({});
        setCurrency({ gold: 0, gem: 0 });
        setPlayerCards([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // GET /player-profiles with populated cards
        const profileData = await apiService.fetchData('/player-profiles?populate=cards');
        
        console.log('✅ Full player profile response:', profileData);
        setPlayerProfile(profileData);
        
        // Extract currency data
        if (profileData.currency) {
          setCurrency({
            gold: profileData.currency.gold || 0,
            gem: profileData.currency.gem || 0
          });
        }
        
        // Extract cards data
        if (profileData.cards && Array.isArray(profileData.cards)) {
          console.log('🃏 Player cards from API:', profileData.cards);
          
          // Unwrap card data from nested structure and filter out null cards
          const unwrappedCards = profileData.cards
            .map(item => {
              // If card is nested inside 'card' property, extract it
              if (item.card && typeof item.card === 'object') {
                return {
                  ...item.card,
                  quantity: item.quantity || 1,
                  playerCardId: item._id // Keep the relationship ID for reference
                };
              }
              // Otherwise, use the item directly if it has an _id
              if (item._id && item.name) {
                return item;
              }
              // Skip null or invalid cards
              return null;
            })
            .filter(Boolean); // Remove null values
          
          // Expand cards with quantity > 1 into multiple individual cards
          const expandedCards = unwrappedCards.flatMap(card => {
            const quantity = card.quantity || 1;
            return Array.from({ length: quantity }, (_, index) => ({
              ...card,
              quantity: 1, // Reset to 1 for each individual card
              displayIndex: index + 1, // Track which copy this is
              uniqueKey: `${card._id || card.id}_${index}` // Unique key for React
            }));
          });
          
          setPlayerCards(expandedCards);
          console.log('✅ Set playerCards with', expandedCards.length, 'cards (expanded from', unwrappedCards.length, 'unique cards)');
        } else {
          console.warn('⚠️ No cards found in player profile');
          setPlayerCards([]);
        }
      } catch (err) {
        console.error('Failed to load player profile:', err);
        if (err.message.includes('401')) {
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Lỗi kết nối đến server.');
        }
        setPlayerProfile({});
        setCurrency({ gold: 0, gem: 0 });
        setPlayerCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerProfile();
  }, []);

  // Load available cards from GET /cards
  useEffect(() => {
    const loadCards = async () => {
      try {
        console.log('🔍 Loading available cards...');
        const cards = await apiService.getAllCards();
        console.log('📊 Total available cards:', cards.length);
        setAvailableCards(cards);
      } catch (err) {
        console.error('❌ Error loading cards:', err);
      }
    };
    loadCards();
  }, []);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Listen for card deletion events from other users
    const handleCardDeleted = (data) => {
      console.log('🔔 Card deleted by another user:', data);
      const username = data.username || 'Một người dùng';
      const cardCount = data.cardCount || 1;
      setGlobalMessage(`🗑️ ${username} vừa xóa ${cardCount} thẻ!`);
      setTimeout(() => setGlobalMessage(""), 5000);
    };

    socketService.getSocket()?.on('cardDeleted', handleCardDeleted);

    // Cleanup on unmount
    return () => {
      socketService.getSocket()?.off('cardDeleted', handleCardDeleted);
      socketService.disconnect();
    };
  }, []);

  // Handle currency update - PUT /player-profiles/currency
  const handleUpdateCurrency = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage("Vui lòng đăng nhập để sử dụng tính năng này!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    setCurrencyLoading(true);
    setMessage("");
    
    try {
      // PUT /player-profiles/currency
      await apiService.fetchData('/player-profiles/currency', {
        method: 'PUT',
        body: JSON.stringify(currency)
      });
      
      setMessage("✅ Cập nhật tiền tệ thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error('Failed to update currency:', err);
      if (err.message.includes('401')) {
        setMessage("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setMessage("Lỗi kết nối: " + err.message);
      }
    } finally {
      setCurrencyLoading(false);
    }
  };

  // Handle add cards - POST /player-profiles/cards
  const handleAddCards = async (cardIds) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage("Vui lòng đăng nhập để sử dụng tính năng này!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    setCardsLoading(true);
    setMessage("");
    
    try {
      // POST /player-profiles/cards
      const requestBody = Array.isArray(cardIds) && cardIds.length === 1
        ? { cardId: cardIds[0] }  // Single card
        : { cardIds };             // Multiple cards
      
      console.log('🔍 Adding cards with body:', requestBody);
      
      await apiService.fetchData('/player-profiles/cards', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      setMessage("✅ Thêm thẻ thành công!");
      
      // Reload profile to get updated cards
      const profileData = await apiService.fetchData('/player-profiles?populate=cards');
      
      if (profileData.cards && Array.isArray(profileData.cards)) {
        // Unwrap and expand cards
        const unwrappedCards = profileData.cards
          .map(item => {
            if (item.card && typeof item.card === 'object') {
              return {
                ...item.card,
                quantity: item.quantity || 1,
                playerCardId: item._id
              };
            }
            if (item._id && item.name) {
              return item;
            }
            return null;
          })
          .filter(Boolean);
        
        const expandedCards = unwrappedCards.flatMap(card => {
          const quantity = card.quantity || 1;
          return Array.from({ length: quantity }, (_, index) => ({
            ...card,
            quantity: 1,
            displayIndex: index + 1,
            uniqueKey: `${card._id || card.id}_${index}`
          }));
        });
        
        setPlayerCards(expandedCards);
      }
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error('Failed to add cards:', err);
      if (err.message.includes('401')) {
        setMessage("❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setMessage("❌ Lỗi kết nối: " + err.message);
      }
    } finally {
      setCardsLoading(false);
    }
  };

  // Handle delete cards - DELETE /player-profiles/cards
  const handleDeleteCards = async (cardIds) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setMessage("Vui lòng đăng nhập để sử dụng tính năng này!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    setCardsLoading(true);
    setMessage("");
    
    try {
      // DELETE /player-profiles/cards
      const requestBody = Array.isArray(cardIds) && cardIds.length === 1
        ? { cardId: cardIds[0] }  // Single card
        : { cardIds };             // Multiple cards
      
      console.log('🗑️ Deleting cards with body:', requestBody);
      
      await apiService.fetchData('/player-profiles/cards', {
        method: 'DELETE',
        body: JSON.stringify(requestBody)
      });
      
      // Remove cards from UI immediately
      setPlayerCards(prev => prev.filter(card => {
        const cardId = card._id || card.id;
        return !cardIds.includes(cardId);
      }));
      
      setMessage("✅ Xóa thẻ thành công!");
      setTimeout(() => setMessage(""), 3000);
      
      // Broadcast to all users via Socket.IO
      socketService.getSocket()?.emit('cardDeleted', {
        username: user.username || user.displayName || 'Người dùng',
        cardCount: cardIds.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('Failed to delete cards:', err);
      if (err.message.includes('401')) {
        setMessage("❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setMessage("❌ Lỗi kết nối: " + err.message);
      }
    } finally {
      setCardsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPassword.length < 6) {
      setPwdMessage("Mật khẩu mới phải ít nhất 6 ký tự");
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      setPwdMessage("Xác nhận mật khẩu không khớp");
      return;
    }
    setPwdLoading(true);
    setPwdMessage("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${apiService.baseURL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: pwd.currentPassword,
          oldPassword: pwd.currentPassword,
          password: pwd.currentPassword,
          newPassword: pwd.newPassword,
          confirmPassword: pwd.confirmPassword || pwd.newPassword,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (res.ok) {
        setPwdMessage(data.message || "Đổi mật khẩu thành công");
        setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const backendMsg = data.message || data.error || data.errors?.join?.(", ");
        setPwdMessage(backendMsg || `Không thể đổi mật khẩu (mã ${res.status}).`);
      }
    } catch (err) {
      setPwdMessage("Lỗi: " + err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ textAlign: 'center', padding: '50px', color: '#9aa8b8' }}>
          Đang tải thông tin hồ sơ...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <Link to="/" style={styles.back}>
        ← Back to Home
      </Link>

      {error && (
        <div style={{
          background: error.includes('demo') || error.includes('chưa đăng nhập') 
            ? 'rgba(255, 193, 7, 0.1)' 
            : 'rgba(255, 128, 128, 0.1)',
          border: error.includes('demo') || error.includes('chưa đăng nhập')
            ? '1px solid rgba(255, 193, 7, 0.3)'
            : '1px solid rgba(255, 128, 128, 0.3)',
          color: error.includes('demo') || error.includes('chưa đăng nhập')
            ? '#ffc107'
            : '#ff8080',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '18px',
          textAlign: 'center'
        }}>
          {error}
          {error.includes('hết hạn') && (
            <div style={{ marginTop: '8px' }}>
              <Link to="/login" style={{ 
                color: '#4CAF50', 
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}>
                → Đăng nhập lại
              </Link>
            </div>
          )}
        </div>
      )}

      {message && (
        <div style={{
          background: 'rgba(159, 229, 159, 0.1)',
          border: '1px solid rgba(159, 229, 159, 0.3)',
          color: '#9fe59f',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '18px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* Global toast notification for real-time events */}
      {globalMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '15px',
          minWidth: '280px',
          animation: 'slideInRight 0.3s ease-out',
          backdropFilter: 'blur(10px)'
        }}>
          {globalMessage}
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatarBox}>
            <Avatar 
              name={playerProfile?.displayName || user.displayName || user.username} 
              color={playerProfile?.avatarColor || user.avatarColor || "#6C5CE7"} 
            />
            <div>
              <div style={styles.name}>
                {playerProfile?.displayName || user.displayName || user.username}
              </div>
              <div style={styles.username}>@{user.username}</div>

              <div style={styles.statRow}>
                <div style={styles.statBox}>
                  <div style={{ fontSize: 12, color: "#9aa8b8" }}>Level</div>
                  <div style={{ fontWeight: 800 }}>
                    {playerProfile?.level || user.level || 1}
                  </div>
                </div>
                <div style={styles.statBox}>
                  <div style={{ fontSize: 12, color: "#9aa8b8" }}>Rank</div>
                  <div style={{ fontWeight: 800 }}>
                    {playerProfile?.rank || user.rank || "Unranked"}
                  </div>
                </div>
                <div style={styles.statBox}>
                  <div style={{ fontSize: 12, color: "#9aa8b8" }}>Điểm</div>
                  <div style={{ fontWeight: 800 }}>
                    {playerProfile?.score || user.score || 0}
                  </div>
                </div>
              </div>

              {/* Currency Display */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: "#9aa8b8", marginBottom: 6 }}>
                  Tiền tệ hiện có
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{
                    background: "rgba(255, 215, 0, 0.1)",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span style={{ color: "#FFD700" }}>💰</span>
                    <span style={{ fontWeight: 700, color: "#FFD700" }}>
                      {currency.gold.toLocaleString()} Gold
                    </span>
                  </div>
                  <div style={{
                    background: "rgba(138, 43, 226, 0.1)",
                    border: "1px solid rgba(138, 43, 226, 0.3)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span style={{ color: "#8A2BE2" }}>💎</span>
                    <span style={{ fontWeight: 700, color: "#8A2BE2" }}>
                      {currency.gem.toLocaleString()} Gem
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 12, color: "#9aa8b8" }}>Email</div>
                <div style={{ fontWeight: 700 }}>{user.email}</div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 12, color: "#9aa8b8" }}>
                  Số điện thoại
                </div>
                <div style={{ fontWeight: 700 }}>{user.sdt || user.phone || "N/A"}</div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 12, color: "#9aa8b8" }}>Quốc gia</div>
                <div style={{ fontWeight: 700 }}>{user.country || "N/A"}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: "#9aa8b8", marginBottom: 6 }}>
                Thành tích nổi bật
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(user.achievements || []).map((a) => (
                  <div key={a.id} style={{ ...styles.badge }}>
                    {a.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Currency Management Section */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>💰 Quản lý tiền tệ</div>
            <form onSubmit={handleUpdateCurrency} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr auto" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9aa8b8", marginBottom: 4 }}>
                  Gold
                </label>
                <input
                  type="number"
                  value={currency.gold}
                  onChange={(e) => setCurrency({ ...currency, gold: parseInt(e.target.value) || 0 })}
                  disabled={currencyLoading}
                  style={{ 
                    padding: 10, 
                    borderRadius: 8, 
                    background: "#0f1417", 
                    color: "#e6eef6", 
                    border: "1px solid rgba(255,255,255,0.06)",
                    width: "100%"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#9aa8b8", marginBottom: 4 }}>
                  Gem
                </label>
                <input
                  type="number"
                  value={currency.gem}
                  onChange={(e) => setCurrency({ ...currency, gem: parseInt(e.target.value) || 0 })}
                  disabled={currencyLoading}
                  style={{ 
                    padding: 10, 
                    borderRadius: 8, 
                    background: "#0f1417", 
                    color: "#e6eef6", 
                    border: "1px solid rgba(255,255,255,0.06)",
                    width: "100%"
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={currencyLoading}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#4CAF50,#45a049)",
                  color: "#fff",
                  fontWeight: 800,
                  border: "none",
                  cursor: currencyLoading ? "not-allowed" : "pointer",
                  opacity: currencyLoading ? 0.7 : 1,
                  alignSelf: "end"
                }}
              >
                {currencyLoading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </form>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Đổi mật khẩu</div>
            {pwdMessage && (
              <div style={{
                color: pwdMessage.toLowerCase().includes("lỗi") || pwdMessage.toLowerCase().includes("không") ? '#ff8080' : '#9fe59f',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: 8, borderRadius: 8, marginBottom: 10
              }}>{pwdMessage}</div>
            )}
            <form onSubmit={handleChangePassword} style={{ display: "grid", gap: 10 }}>
              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={pwd.currentPassword}
                onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                required
                disabled={pwdLoading}
                style={{ padding: 10, borderRadius: 8, background: "#0f1417", color: "#e6eef6", border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <input
                type="password"
                placeholder="Mật khẩu mới (≥ 6 ký tự)"
                value={pwd.newPassword}
                onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                minLength={6}
                required
                disabled={pwdLoading}
                style={{ padding: 10, borderRadius: 8, background: "#0f1417", color: "#e6eef6", border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={pwd.confirmPassword}
                onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })}
                minLength={6}
                required
                disabled={pwdLoading}
                style={{ padding: 10, borderRadius: 8, background: "#0f1417", color: "#e6eef6", border: "1px solid rgba(255,255,255,0.06)" }}
              />
              <button
                type="submit"
                disabled={pwdLoading}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#ff6b35,#ffd700)",
                  color: "#000",
                  fontWeight: 800,
                  border: "none",
                  cursor: pwdLoading ? "not-allowed" : "pointer",
                  opacity: pwdLoading ? 0.7 : 1,
                }}
              >
                {pwdLoading ? "Đang đổi..." : "Cập nhật mật khẩu"}
              </button>
            </form>
          </div>
          <div style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={styles.sectionTitle}>🃏 Bộ sưu tập thẻ</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={async () => {
                    if (availableCards.length === 0) {
                      setMessage("Chưa có thẻ nào trong hệ thống!");
                      setTimeout(() => setMessage(""), 3000);
                      return;
                    }
                    
                    // Random 1 thẻ từ danh sách (có thể trùng lặp)
                    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                    const cardId = randomCard._id || randomCard.id;
                    
                    console.log('🎲 Random card selected:', randomCard.name, 'ID:', cardId);
                    
                    if (cardId) {
                      await handleAddCards([cardId]);
                    } else {
                      console.error('❌ Invalid card ID');
                    }
                  }}
                  disabled={cardsLoading || availableCards.length === 0}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "linear-gradient(135deg,#2196F3,#1976D2)",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    cursor: cardsLoading || availableCards.length === 0 ? "not-allowed" : "pointer",
                    opacity: cardsLoading || availableCards.length === 0 ? 0.7 : 1,
                    fontSize: 12
                  }}
                >
                  {cardsLoading ? "Đang xử lý..." : "+ Thêm thẻ"}
                </button>
                <button
                  onClick={() => {
                    if (playerCards.length === 0) {
                      setMessage("Bạn chưa có thẻ nào để xóa!");
                      setTimeout(() => setMessage(""), 3000);
                      return;
                    }
                    setShowDeleteModal(true);
                    setSelectedCardsToDelete([]);
                  }}
                  disabled={cardsLoading || playerCards.length === 0}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "linear-gradient(135deg,#f44336,#d32f2f)",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    cursor: cardsLoading || playerCards.length === 0 ? "not-allowed" : "pointer",
                    opacity: cardsLoading || playerCards.length === 0 ? 0.7 : 1,
                    fontSize: 12
                  }}
                >
                  {cardsLoading ? "Đang xử lý..." : "- Xóa thẻ"}
                </button>
              </div>
            </div>
            <div style={styles.collectionGrid}>
              {playerCards.length > 0 ? playerCards.map((c) => (
                <div
                  key={c.uniqueKey || c._id || c.id}
                  style={styles.cardItem}
                  onClick={() => setSelectedCard(c)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedCard(c)}
                >
                  <img 
                    src={c.imageUrl || c.img || c.image || `/images/cardfeature${((c._id?.charCodeAt(0) || 0) % 4) + 1}.jpg`} 
                    alt={c.name || "Unknown"} 
                    style={styles.cardImg}
                    onError={(e) => {
                      e.target.src = `/images/cardfeature${Math.floor(Math.random() * 4) + 1}.jpg`;
                    }}
                  />
                  <div style={{ fontWeight: 800 }}>{c.name || "Unknown"}</div>
                  <div style={styles.smallMuted}>Gen {c.genCore || "?"}
                    {c.displayIndex && <span style={{marginLeft: 4}}>#{c.displayIndex}</span>}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "#12212a",
                        marginRight: 6,
                      }}
                    >
                      PWR {c.power || "?"}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "#12212a",
                      }}
                    >
                      DEF {c.defense || "?"}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ 
                  gridColumn: "1 / -1", 
                  textAlign: "center", 
                  color: "#9aa8b8", 
                  padding: "20px",
                  fontStyle: "italic"
                }}>
                  Chưa có thẻ nào trong bộ sưu tập
                </div>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Lịch sử đấu</div>
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Ngày</th>
                  <th style={styles.th}>Đối thủ</th>
                  <th style={styles.th}>Kết quả</th>
                  <th style={styles.th}>Tỷ số</th>
                </tr>
              </thead>
              <tbody>
                {matchHistory.map((m) => (
                  <tr key={m.id}>
                    <td style={styles.td}>{m.date}</td>
                    <td style={styles.td}>{m.opponent}</td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 800,
                        color: m.result === "Win" ? "#9fe59f" : "#f28b8b",
                      }}
                    >
                      {m.result}
                    </td>
                    <td style={styles.td}>{m.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedCard && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCard(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <img
                src={selectedCard.imageUrl || selectedCard.img || selectedCard.image || `/images/cardfeature${((selectedCard._id?.charCodeAt(0) || 0) % 4) + 1}.jpg`}
                alt={selectedCard.name || "Unknown"}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = `/images/cardfeature${Math.floor(Math.random() * 4) + 1}.jpg`;
                }}
              />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {selectedCard.name || "Unknown"}
                </div>
                <div style={{ color: "#9aa8b8", marginTop: 6 }}>
                  Gen {selectedCard.genCore || "?"} · {selectedCard.origin || selectedCard.desc || "No description"}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <div
                    style={{
                      background: "#1d2a36",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    PWR {selectedCard.power || "?"}
                  </div>
                  <div
                    style={{
                      background: "#2a1d27",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    DEF {selectedCard.defense || "?"}
                  </div>
                  <div
                    style={{
                      background: "#271d2a",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    MAG {selectedCard.magic || "?"}
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={() => setSelectedCard(null)}
                  style={{
                    background: "transparent",
                    color: "#9aa8b8",
                    border: "none",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Kĩ năng</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(selectedCard.skill || []).map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#12212a",
                      padding: "6px 10px",
                      borderRadius: 8,
                    }}
                  >
                    <strong>{s.name || "Unknown Skill"}:</strong> {s.description || "No description"}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Mô tả</div>
              <div>{selectedCard.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa thẻ */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={{...styles.modal, width: "min(1000px, 95%)", maxHeight: "85vh", overflow: "auto"}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
              <h3 style={{margin: 0}}>Chọn thẻ để xóa ({selectedCardsToDelete.length} đã chọn)</h3>
              <button onClick={() => setShowDeleteModal(false)} style={{background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#9aa8b8"}}>✕</button>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 16}}>
              {playerCards.map((card) => {
                const cardId = card._id || card.id;
                const uniqueKey = card.uniqueKey || cardId;
                const isSelected = selectedCardsToDelete.includes(cardId);
                return (
                  <div
                    key={uniqueKey}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCardsToDelete(prev => prev.filter(id => id !== cardId));
                      } else {
                        setSelectedCardsToDelete(prev => [...prev, cardId]);
                      }
                    }}
                    style={{
                      ...styles.cardItem,
                      cursor: "pointer",
                      border: isSelected ? "3px solid #f44336" : "1px solid rgba(255,255,255,0.03)",
                      background: isSelected ? "rgba(244, 67, 54, 0.1)" : "linear-gradient(180deg,#141618,#1a1d20)"
                    }}
                  >
                    <img 
                      src={card.imageUrl || card.img || card.image || `/images/cardfeature${((card._id?.charCodeAt(0) || 0) % 4) + 1}.jpg`} 
                      alt={card.name || "Unknown"} 
                      style={styles.cardImg}
                      onError={(e) => {
                        e.target.src = `/images/cardfeature${Math.floor(Math.random() * 4) + 1}.jpg`;
                      }}
                    />
                    <div style={{fontWeight: 800}}>{card.name || "Unknown"}</div>
                    <div style={styles.smallMuted}>Gen {card.genCore || "?"}</div>
                    {card.displayIndex && (
                      <div style={{fontSize: 11, color: "#9aa8b8"}}>#{card.displayIndex}</div>
                    )}
                    <div style={{marginTop: 8}}>
                      <span style={{...styles.badge, marginRight: 4, fontSize: 11}}>⚔{card.power || "?"}</span>
                      <span style={{...styles.badge, fontSize: 11}}>🛡{card.defense || "?"}</span>
                    </div>
                    {isSelected && (
                      <div style={{marginTop: 8, color: "#f44336", fontWeight: 700, fontSize: 12}}>✓ Đã chọn</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{display: "flex", gap: 12, justifyContent: "flex-end"}}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (selectedCardsToDelete.length > 0) {
                    const confirmed = window.confirm(
                      `Bạn có chắc chắn muốn xóa ${selectedCardsToDelete.length} thẻ đã chọn?\n\n` +
                      `Hành động này không thể hoàn tác!`
                    );
                    
                    if (confirmed) {
                      await handleDeleteCards(selectedCardsToDelete);
                      setShowDeleteModal(false);
                      setSelectedCardsToDelete([]);
                    }
                  }
                }}
                disabled={selectedCardsToDelete.length === 0}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: selectedCardsToDelete.length > 0 ? "linear-gradient(135deg,#f44336,#d32f2f)" : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "none",
                  cursor: selectedCardsToDelete.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  opacity: selectedCardsToDelete.length > 0 ? 1 : 0.5
                }}
              >
                Xóa {selectedCardsToDelete.length > 0 ? `(${selectedCardsToDelete.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}