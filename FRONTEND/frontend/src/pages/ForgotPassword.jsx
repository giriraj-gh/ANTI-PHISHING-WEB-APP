import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '3rem', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🔐</div>
          <h1 style={{ margin: '0.5rem 0', background: 'linear-gradient(45deg,#8b5cf6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forgot Password</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
            <h3 style={{ color: '#10b981' }}>Reset link sent!</h3>
            <p style={{ color: '#6b7280' }}>Check your email inbox and click the reset link.</p>
            <Link to="/" style={{ color: '#8b5cf6', fontWeight: 600 }}>← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>⚠️ {error}</div>}
            <div>
              <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>📧 Email Address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                style={{ width: '100%', padding: '1rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" disabled={loading}
              style={{ padding: '1rem', background: 'linear-gradient(45deg,#8b5cf6,#3b82f6)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Sending...' : '📨 Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <Link to="/" style={{ color: '#8b5cf6', fontSize: '0.9rem' }}>← Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
