import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Đăng nhập bằng email: ${email}`);
  };

  return (
    <div className="auth-bg">
      <div className="auth-brand auth-brand--outside">
        <div className="auth-logo auth-logo--xl">🃏</div>
        <div className="auth-name auth-name--xl">Arena of Cards</div>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-title">Đăng nhập</h2>

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Nhập email" required />
        </div>

        <div className="auth-field" style={{ position: "relative" }}>
          <label className="auth-label">Mật khẩu</label>
          <input className="auth-input" type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
          <span onClick={()=>setShowPassword(!showPassword)} title={showPassword?"Ẩn mật khẩu":"Hiện mật khẩu"} style={{ position:'absolute', right:14, top:48, cursor:'pointer' }}>{showPassword?"🙈":"👁️"}</span>
        </div>

        <button className="auth-submit" type="submit">Đăng nhập</button>

        <div className="auth-alt">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </form>
    </div>
  );
}


