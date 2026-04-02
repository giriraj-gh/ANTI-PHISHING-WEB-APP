import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setError("");
    try {
      await api.post(`/auth/reset/${token}`, { password });
      alert("Password updated successfully! Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset link.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '3rem', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🔒</div>
          <h1 style={{ margin: '0.5rem 0', background: 'linear-gradient(45deg,#8b5cf6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reset Password</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Enter your new password below</p>
        </div>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>⚠️ {error}</div>}
          <div>
            <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>🔒 New Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ width: '100%', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>🔐 Confirm Password</label>
            <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              style={{ width: '100%', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ padding: '1rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Saving...' : '✅ Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
