import React, { useState } from "react";

// Để giao diện đẹp nhất, hãy thêm vào <head> của public/index.html:
// <link href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap" rel="stylesheet">

const logo =
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Yu-Gi-Oh%21_Logo.png";
const cardBack =
  "https://upload.wikimedia.org/wikipedia/commons/6/6a/Yu-Gi-Oh%21_cardback.jpg";
const card1 =
  "https://static.wikia.nocookie.net/yugioh/images/6/6a/DarkMagician-LOB-EN-UR-1E.png";
const card2 =
  "https://static.wikia.nocookie.net/yugioh/images/7/7c/BlueEyesWhiteDragon-LOB-EN-UR-1E.png";
const duelBg =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    // Xử lý đăng ký ở đây
    alert(`Đăng ký thành công, ${username}!`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(120deg, #2d1606cc 60%, #eab308cc 100%), url('${duelBg}')`,
        backgroundSize: "cover",
        backgroundBlendMode: "overlay",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Hiệu ứng ánh sáng vàng */}
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) rotate(-10deg)",
          background: "radial-gradient(circle, #eab30855 0%, transparent 80%)",
          filter: "blur(30px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(30, 20, 10, 0.98)",
          padding: "2.8rem 2.2rem 2.2rem 2.2rem",
          borderRadius: "1.7rem",
          boxShadow: "0 12px 40px 0 #000a",
          display: "flex",
          flexDirection: "column",
          minWidth: "420px",
          maxWidth: "95vw",
          border: "4px solid #eab308",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* Logo game thẻ bài */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "1.2rem",
            marginTop: "-2.2rem",
            zIndex: 3,
          }}
        >
          <img
            src={logo}
            alt="Logo Game Thẻ Bài"
            style={{
              height: "60px",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 8px #000a)",
              background: "rgba(255,255,255,0.01)",
              borderRadius: "0.5rem",
              padding: "0.1rem 0.5rem",
            }}
          />
        </div>
        {/* Card back Yu-Gi-Oh! */}
        <div
          style={{
            position: "absolute",
            top: "-56px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #eab308 60%, #b45309 100%)",
            borderRadius: "1.2rem",
            width: "110px",
            height: "150px",
            boxShadow: "0 4px 24px #0008",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #fff",
            zIndex: 2,
            gap: "0.2rem",
          }}
        >
          <img
            src={cardBack}
            alt="Card Back"
            style={{
              width: "90px",
              height: "130px",
              borderRadius: "0.7rem",
              boxShadow: "0 2px 8px #000a",
              border: "2px solid #eab308",
              objectFit: "cover",
              background: "#fff",
            }}
          />
        </div>
        <h2
          style={{
            textAlign: "center",
            margin: "3.5rem 0 1.5rem 0",
            color: "#eab308",
            letterSpacing: "2px",
            fontWeight: "bold",
            textShadow: "0 2px 12px #000a",
            fontSize: "2.2rem",
            fontFamily: "'UnifrakturCook', 'Cinzel', serif",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          Đăng ký
          <br />
          <span
            style={{ color: "#fff", fontSize: "1.3rem", letterSpacing: "1px" }}
          >
            Card Game Duel
          </span>
        </h2>
        {/* Nhóm input căn lề đều, label và input cùng lề trái/phải */}
        <div style={{ marginBottom: "1.7rem" }}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#eab308",
                fontWeight: 600,
                letterSpacing: "1px",
                fontSize: "1.08rem",
                paddingLeft: "0.2rem",
              }}
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "0.6rem",
                border: "2px solid #eab308",
                fontSize: "1.08rem",
                background: "#2d1606",
                color: "#fff",
                outline: "none",
                boxShadow: "0 2px 10px #eab30833",
                fontWeight: 500,
                letterSpacing: "0.5px",
                transition: "border 0.2s",
                marginBottom: 0,
                boxSizing: "border-box",
              }}
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#eab308",
                fontWeight: 600,
                letterSpacing: "1px",
                fontSize: "1.08rem",
                paddingLeft: "0.2rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "0.6rem",
                border: "2px solid #eab308",
                fontSize: "1.08rem",
                background: "#2d1606",
                color: "#fff",
                outline: "none",
                boxShadow: "0 2px 10px #eab30833",
                fontWeight: 500,
                letterSpacing: "0.5px",
                transition: "border 0.2s",
                marginBottom: 0,
                boxSizing: "border-box",
              }}
              placeholder="Nhập email"
            />
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#eab308",
                fontWeight: 600,
                letterSpacing: "1px",
                fontSize: "1.08rem",
                paddingLeft: "0.2rem",
              }}
            >
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "0.6rem",
                  border: "2px solid #eab308",
                  fontSize: "1.08rem",
                  background: "#2d1606",
                  color: "#fff",
                  outline: "none",
                  boxShadow: "0 2px 10px #eab30833",
                  fontWeight: 500,
                  letterSpacing: "0.5px",
                  transition: "border 0.2s",
                  marginBottom: 0,
                  boxSizing: "border-box",
                }}
                placeholder="Nhập mật khẩu"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1.1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#eab308",
                  fontSize: "1.3rem",
                  userSelect: "none",
                  transition: "color 0.2s",
                }}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#eab308",
                fontWeight: 600,
                letterSpacing: "1px",
                fontSize: "1.08rem",
                paddingLeft: "0.2rem",
              }}
            >
              Xác nhận mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "0.6rem",
                  border: "2px solid #eab308",
                  fontSize: "1.08rem",
                  background: "#2d1606",
                  color: "#fff",
                  outline: "none",
                  boxShadow: "0 2px 10px #eab30833",
                  fontWeight: 500,
                  letterSpacing: "0.5px",
                  transition: "border 0.2s",
                  marginBottom: 0,
                  boxSizing: "border-box",
                }}
                placeholder="Xác nhận mật khẩu"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: "1.1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#eab308",
                  fontSize: "1.3rem",
                  userSelect: "none",
                  transition: "color 0.2s",
                }}
                title={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
        </div>
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #eab308 0%, #b45309 100%)",
            color: "#2d1606",
            padding: "0.85rem",
            border: "none",
            borderRadius: "0.6rem",
            fontSize: "1.15rem",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 12px #eab30833",
            letterSpacing: "1px",
            marginTop: "0.5rem",
            transition: "background 0.2s, transform 0.2s",
            textShadow: "0 2px 8px #fff6",
          }}
        >
          Đăng ký
        </button>
        <div
          style={{
            textAlign: "center",
            marginTop: "1.7rem",
            color: "#fff9",
            fontSize: "1rem",
          }}
        >
          <span>
            Đã có tài khoản?{" "}
            <a
              href="#"
              style={{
                color: "#eab308",
                textDecoration: "underline",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              Đăng nhập
            </a>
          </span>
        </div>
        {/* Hai lá bài trang trí */}
        <div
          style={{
            position: "absolute",
            left: "-60px",
            bottom: "-40px",
            transform: "rotate(-18deg)",
            zIndex: 0,
            opacity: 0.8,
          }}
        >
          <img
            src={card1}
            alt="Card 1"
            style={{
              width: "70px",
              height: "100px",
              borderRadius: "0.7rem",
              border: "2px solid #eab308",
              boxShadow: "0 4px 16px #0007",
              objectFit: "cover",
              background: "#fff",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: "-50px",
            top: "-30px",
            transform: "rotate(12deg)",
            zIndex: 0,
            opacity: 0.8,
          }}
        >
          <img
            src={card2}
            alt="Card 2"
            style={{
              width: "60px",
              height: "85px",
              borderRadius: "0.7rem",
              border: "2px solid #eab308",
              boxShadow: "0 4px 16px #0007",
              objectFit: "cover",
              background: "#fff",
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default Register;
