import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { URL } from "../../services/api";
import "../Login/styles.css";

export default function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const res = await fetch(`${URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Xác thực thành công! Đang chuyển đến trang đăng nhập...");
                setTimeout(() => navigate("/login"), 1200);
            } else {
                setMessage(data.message || "Mã OTP không hợp lệ hoặc đã hết hạn");
            }
        } catch (err) {
            setMessage("Lỗi: " + err.message);
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
                <h2 className="auth-title">Xác thực OTP</h2>

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
                        placeholder="Nhập email đã đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || Boolean(initialEmail)}
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label">Mã OTP</label>
                    <input
                        className="auth-input"
                        type="tel"
                        placeholder="Nhập mã OTP 6 số"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        disabled={isLoading}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                    />
                </div>

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                    {isLoading ? "Đang xác thực..." : "Xác thực"}
                </button>

                <div className="auth-alt">
                    Đã xác thực? <Link to="/login">Đăng nhập</Link>
                </div>
            </form>
        </div>
    );
}


