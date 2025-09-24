import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { URL } from "../../services/api";

function useQuery() {
    const { search } = useLocation();
    return new URLSearchParams(search);
}

export default function ResetPassword() {
    const query = useQuery();
    const navigate = useNavigate();
    const [token, setToken] = useState(query.get("token") || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setMessage("Mật khẩu phải ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Mật khẩu xác nhận không khớp");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            // Token trong email có thể xuống dòng. Chuẩn hóa để loại bỏ toàn bộ khoảng trắng/newline.
            const normalizedToken = (token || "").replace(/\s+/g, "").trim();
            if (!normalizedToken) {
                setMessage("Token không hợp lệ. Vui lòng dán lại từ email.");
                setIsLoading(false);
                return;
            }

            const res = await fetch(`${URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                // Theo Swagger: chỉ nhận { token, newPassword }
                body: JSON.stringify({ token: normalizedToken, newPassword: password }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || "Đặt lại mật khẩu thành công.");
                setTimeout(() => navigate("/login"), 1200);
            } else {
                setMessage(data.message || `Không thể đặt lại mật khẩu (mã ${res.status}).`);
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
                <h2 className="auth-title">Đặt lại mật khẩu</h2>
                <div className="auth-field">
                    <label className="auth-label">Token đặt lại (dán từ email)</label>
                    <textarea
                        className="auth-input"
                        value={token}
                        onChange={(e) => setToken(e.target.value.trim())}
                        placeholder="Dán token đặt lại mật khẩu"
                        rows={2}
                        required
                        disabled={isLoading}
                        style={{ resize: 'vertical' }}
                    />
                </div>
                {message && (
                    <div style={{
                        color: message.toLowerCase().includes("lỗi") ? '#ff4444' : '#28a745',
                        backgroundColor: message.toLowerCase().includes("lỗi") ? '#ffe6e6' : '#d4edda',
                        padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px'
                    }}>{message}</div>
                )}
                <div className="auth-field">
                    <label className="auth-label">Mật khẩu mới</label>
                    <input
                        className="auth-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                        disabled={isLoading}
                        placeholder="Nhập mật khẩu mới"
                    />
                </div>
                <div className="auth-field">
                    <label className="auth-label">Xác nhận mật khẩu</label>
                    <input
                        className="auth-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                        required
                        disabled={isLoading}
                        placeholder="Nhập lại mật khẩu"
                    />
                </div>
                <button className="auth-submit" type="submit" disabled={isLoading}
                    style={{ opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
                <div className="auth-alt"><Link to="/login">Quay lại đăng nhập</Link></div>
            </form>
        </div>
    );
}


