import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { URL } from "../../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pasteToken, setPasteToken] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);
        try {
            const res = await fetch(`${URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.");
            } else {
                setMessage(data.message || "Không thể gửi yêu cầu.");
            }
        } catch (err) {
            setMessage("Lỗi: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h2 className="auth-title">Quên mật khẩu</h2>
                {message && (
                    <div style={{
                        color: message.toLowerCase().includes("lỗi") ? '#ff4444' : '#28a745',
                        backgroundColor: message.toLowerCase().includes("lỗi") ? '#ffe6e6' : '#d4edda',
                        padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px'
                    }}>{message}</div>
                )}
                <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="auth-field">
                    <label className="auth-label">Đã có token từ email? Dán vào đây</label>
                    <textarea
                        className="auth-input"
                        rows={2}
                        placeholder="Dán token đặt lại mật khẩu"
                        value={pasteToken}
                        onChange={(e) => setPasteToken(e.target.value)}
                    />
                    <button
                        type="button"
                        className="auth-submit"
                        style={{ marginTop: 8 }}
                        onClick={() => pasteToken && navigate(`/reset-password?token=${encodeURIComponent(pasteToken.trim())}`)}
                    >
                        Tiếp tục đặt lại mật khẩu
                    </button>
                </div>
                <button className="auth-submit" type="submit" disabled={isLoading}
                    style={{ opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? "Đang gửi..." : "Gửi link đặt lại"}
                </button>
                <div className="auth-alt">
                    <Link to="/login">Quay lại đăng nhập</Link>
                </div>
            </form>
        </div>
    );
}


