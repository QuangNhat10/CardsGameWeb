import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { URL } from "../../services/api";
import "./styles.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Đăng nhập thành công!");
        localStorage.setItem("token", data.token); // lưu token
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        setTimeout(() => {
          navigate("/"); // Chuyển hướng sau 1 giây
        }, 1000);
      } else {
        setMessage(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Lỗi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div
        className="auth-brand auth-brand--outside"
        onClick={() => {
          // trở về trang home ở trạng thái chưa đăng nhập
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }}
        style={{ cursor: 'pointer' }}
        title="Về trang chủ"
      >
        <div className="auth-logo auth-logo--xl">🃏</div>
        <div className="auth-name auth-name--xl">Arena of Cards</div>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Đăng nhập</h2>

        {message && (
          <div style={{
            color: message.includes('thành công') ? '#28a745' : '#ff4444',
            backgroundColor: message.includes('thành công') ? '#d4edda' : '#ffe6e6',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="auth-field" style={{ position: "relative" }}>
          <label className="auth-label">Mật khẩu</label>
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <span
            onClick={() => !isLoading && setShowPassword(!showPassword)}
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            style={{
              position: 'absolute',
              right: 14,
              top: 48,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="auth-alt" style={{ marginTop: 8 }}>
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <div className="auth-alt">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </form>
    </div>
  );
}
