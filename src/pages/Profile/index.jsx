import React, { useState } from "react";
import apiService from "../../services/api";
import { Link } from "react-router-dom";

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

const sampleCards = [
  {
    id: "c1",
    name: "Blade Warden",
    atk: 32,
    def: 18,
    skills: ["Dash Strike", "Riposte"],
    rarity: "Epic",
    img: "/images/cardfeature1.jpg",
    desc: "Fast melee attacker",
  },
  {
    id: "c2",
    name: "Shield Sentinel",
    atk: 12,
    def: 44,
    skills: ["Shield Wall", "Taunt"],
    rarity: "Rare",
    img: "/images/cardfeature2.jpg",
    desc: "Bulky defender",
  },
  {
    id: "c3",
    name: "Arcane Weaver",
    atk: 25,
    def: 15,
    skills: ["Arcane Bolt", "Mana Surge"],
    rarity: "Legendary",
    img: "/images/cardfeature3.jpg",
    desc: "High burst magic",
  },
  {
    id: "c4",
    name: "Feral Stalker",
    atk: 28,
    def: 14,
    skills: ["Pounce", "Bleed"],
    rarity: "Uncommon",
    img: "/images/map1.jpg",
    desc: "Quick single-target DPS",
  },
  {
    id: "c5",
    name: "Flame Herald",
    atk: 22,
    def: 12,
    skills: ["Flame Nova", "Ignite"],
    rarity: "Rare",
    img: "/images/map2.jpg",
    desc: "AoE burn",
  },
];

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

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || mockUser; } catch { return mockUser; }
  })();

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
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        // Gửi đồng thời các alias trường để tương thích API (currentPassword/oldPassword/password)
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
      } catch (_) {
        data = {};
      }
      if (res.ok) {
        setPwdMessage(data.message || "Đổi mật khẩu thành công");
        setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        // Hỗ trợ hiển thị lỗi phổ biến từ backend
        const backendMsg = data.message || data.error || data.errors?.join?.(", ");
        setPwdMessage(backendMsg || `Không thể đổi mật khẩu (mã ${res.status}).`);
      }
    } catch (err) {
      setPwdMessage("Lỗi: " + err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>
        ← Back to Home
      </Link>

      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatarBox}>
            <Avatar name={user.displayName || user.username} color={user.avatarColor || mockUser.avatarColor} />
            <div>
              <div style={styles.name}>{user.displayName || user.username}</div>
              <div style={styles.username}>@{user.username}</div>

              <div style={styles.statRow}>
                <div style={styles.statBox}>
                  <div style={{ fontSize: 12, color: "#9aa8b8" }}>Level</div>
                  <div style={{ fontWeight: 800 }}>{user.level || mockUser.level}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={{ fontSize: 12, color: "#9aa8b8" }}>Rank</div>
                  <div style={{ fontWeight: 800 }}>{user.rank || mockUser.rank}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={{ fontSize: 12, color: "#9aa8b8" }}>Điểm</div>
                  <div style={{ fontWeight: 800 }}>{user.score || mockUser.score}</div>
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
                <div style={{ fontWeight: 700 }}>{user.sdt || mockUser.sdt}</div>
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
                <div style={{ fontWeight: 700 }}>{user.country || mockUser.country}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: "#9aa8b8", marginBottom: 6 }}>
                Thành tích nổi bật
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(user.achievements || mockUser.achievements).map((a) => (
                  <div key={a.id} style={{ ...styles.badge }}>
                    {a.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
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
            <div style={styles.sectionTitle}>Bộ sưu tập thẻ</div>
            <div style={styles.collectionGrid}>
              {sampleCards.map((c) => (
                <div
                  key={c.id}
                  style={styles.cardItem}
                  onClick={() => setSelectedCard(c)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedCard(c)}
                >
                  <img src={c.img} alt={c.name} style={styles.cardImg} />
                  <div style={{ fontWeight: 800 }}>{c.name}</div>
                  <div style={styles.smallMuted}>{c.rarity}</div>
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
                      ATK {c.atk}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "#12212a",
                      }}
                    >
                      DEF {c.def}
                    </span>
                  </div>
                </div>
              ))}
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
                src={selectedCard.img}
                alt={selectedCard.name}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  {selectedCard.name}
                </div>
                <div style={{ color: "#9aa8b8", marginTop: 6 }}>
                  {selectedCard.rarity} · {selectedCard.desc}
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
                    ATK {selectedCard.atk}
                  </div>
                  <div
                    style={{
                      background: "#2a1d27",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    DEF {selectedCard.def}
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
                {selectedCard.skills.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#12212a",
                      padding: "6px 10px",
                      borderRadius: 8,
                    }}
                  >
                    {s}
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
    </div>
  );
}
