import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import "./styles.css";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

    // Validation
    if (formData.password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    try {
      // Sử dụng API service mới với refresh token
      const data = await apiService.register(formData);

      setMessage("Đăng ký thành công! Vui lòng nhập mã OTP gửi tới email.");

      // Tokens đã được lưu tự động trong apiService.register() nếu có auto-login
      console.log('[register] tokens saved automatically if available');

      // Lưu thông tin user nếu có
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setTimeout(() => {
        const emailParam = encodeURIComponent(formData.email);
        navigate(`/verify-otp?email=${emailParam}`);
      }, 1200);

    } catch (err) {
      console.error("Register error:", err);
      setMessage("Lỗi: " + (err.message || "Đăng ký thất bại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-brand auth-brand--outside">
        <div className="auth-logo auth-logo--xl">🃏</div>
        <div className="auth-name auth-name--xl">Arena of Cards</div>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Đăng ký</h2>

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
          <label className="auth-label">Tên người dùng</label>
          <input
            className="auth-input"
            type="text"
            name="username"
            placeholder="Nhập tên người dùng"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

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

        <div className="auth-field">
          <label className="auth-label">Mật khẩu</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            minLength={6}
          />
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
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>

        <div className="auth-alt">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}
