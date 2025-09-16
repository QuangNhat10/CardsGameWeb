import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp");
      return;
    }
    alert(`Đăng ký bằng email: ${email}`);
  };

  return (
    <div className="auth-bg">
      <div className="auth-brand auth-brand--outside">
        <div className="auth-logo auth-logo--xl">🃏</div>
        <div className="auth-name auth-name--xl">Arena of Cards</div>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Đăng ký</h2>

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Nhập email" required />
        </div>

        <div className="auth-field">
          <label className="auth-label">Mật khẩu</label>
          <input className="auth-input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
        </div>

        <div className="auth-field">
          <label className="auth-label">Nhập lại mật khẩu</label>
          <input className="auth-input" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" required />
        </div>

        <button className="auth-submit" type="submit">Tạo tài khoản</button>

        <div className="auth-alt">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}


