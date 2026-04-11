import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (role === 'guest') { navigate("/guest"); setLoading(false); return; }
    try {
      const res = await api.post("/auth/login", { email, password, role });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.role === "admin") { navigate("/admin"); } else { navigate("/home"); }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #0a0e1a;
          font-family: 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          flex: 1;
          background: linear-gradient(135deg, #0d1b2a 0%, #1a1f3a 40%, #0f2044 70%, #1a0a3a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: glow-move 8s ease-in-out infinite;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          bottom: -50px; right: -50px;
          animation: glow-move 8s ease-in-out infinite reverse;
        }

        @keyframes glow-move {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }

        .brand-section {
          text-align: center;
          z-index: 2;
          animation: fadeInUp 0.8s ease-out;
        }

        .brand-logo {
          width: 100px; height: 100px;
          background: linear-gradient(135deg, #6366f1, #3b82f6, #8b5cf6);
          border-radius: 28px;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem;
          margin: 0 auto 1.5rem;
          box-shadow: 0 20px 60px rgba(99,102,241,0.4);
          animation: logo-pulse 3s ease-in-out infinite;
          position: relative;
        }

        .brand-logo::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 31px;
          background: linear-gradient(135deg, #6366f1, #3b82f6, #8b5cf6);
          z-index: -1;
          opacity: 0.5;
          filter: blur(10px);
          animation: logo-pulse 3s ease-in-out infinite;
        }

        @keyframes logo-pulse {
          0%, 100% { box-shadow: 0 20px 60px rgba(99,102,241,0.4); transform: scale(1); }
          50% { box-shadow: 0 25px 80px rgba(99,102,241,0.6); transform: scale(1.03); }
        }

        .brand-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
        }

        .brand-title span {
          background: linear-gradient(90deg, #6366f1, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 0.95rem;
          margin-bottom: 3rem;
          letter-spacing: 0.3px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          width: 100%;
          max-width: 380px;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
          animation: fadeInUp 0.8s ease-out;
        }

        .stat-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(99,102,241,0.4);
          transform: translateY(-3px);
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(90deg, #6366f1, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          margin-top: 0.2rem;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          max-width: 380px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          animation: fadeInLeft 0.8s ease-out;
        }

        .feature-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(99,102,241,0.6);
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 480px;
          background: #0f1117;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          position: relative;
          border-left: 1px solid rgba(255,255,255,0.05);
        }

        .login-form-wrapper {
          width: 100%;
          animation: fadeInRight 0.8s ease-out;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.4rem;
        }

        .form-header p {
          color: rgba(255,255,255,0.4);
          font-size: 0.9rem;
        }

        .role-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 1.75rem;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .role-tab {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.25s;
          background: transparent;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .role-tab.active {
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          color: white;
          box-shadow: 0 4px 15px rgba(99,102,241,0.4);
        }

        .role-tab:hover:not(.active) {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.06);
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          margin-bottom: 0.5rem;
          letter-spacing: 0.3px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          opacity: 0.5;
        }

        .form-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.25s;
        }

        .form-input::placeholder { color: rgba(255,255,255,0.25); }

        .form-input:focus {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        .eye-btn {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .eye-btn:hover { opacity: 1; }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          color: #fca5a5;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: all 0.3s;
          box-shadow: 0 8px 25px rgba(99,102,241,0.35);
          margin-bottom: 1.25rem;
          letter-spacing: 0.3px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(99,102,241,0.5);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .submit-btn.admin-btn {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          box-shadow: 0 8px 25px rgba(139,92,246,0.35);
        }

        .submit-btn.admin-btn:hover:not(:disabled) {
          box-shadow: 0 12px 35px rgba(139,92,246,0.5);
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .divider-text {
          color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
        }

        .guest-btn {
          width: 100%;
          padding: 0.85rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .guest-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: white;
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-footer a {
          color: #6366f1;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .form-footer a:hover { color: #818cf8; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Floating particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(99,102,241,0.3);
          animation: float-particle linear infinite;
          pointer-events: none;
        }

        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
        }

        @media (max-width: 900px) {
          .login-page { flex-direction: column; }
          .left-panel { padding: 2rem; min-height: auto; }
          .right-panel { width: 100%; padding: 2rem 1.5rem; border-left: none; border-top: 1px solid rgba(255,255,255,0.05); }
          .stats-grid { grid-template-columns: repeat(4,1fr); }
          .brand-title { font-size: 1.6rem; }
        }
      `}</style>

      <div className="login-page">

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">

          {/* Floating particles */}
          {[
            {w:6,h:6,l:'10%',dur:'12s',del:'0s'},
            {w:4,h:4,l:'25%',dur:'15s',del:'3s'},
            {w:8,h:8,l:'50%',dur:'10s',del:'1s'},
            {w:5,h:5,l:'70%',dur:'14s',del:'5s'},
            {w:3,h:3,l:'85%',dur:'11s',del:'2s'},
          ].map((p,i) => (
            <div key={i} className="particle" style={{ width:p.w, height:p.h, left:p.l, animationDuration:p.dur, animationDelay:p.del }} />
          ))}

          <div className="brand-section">
            <div className="brand-logo">🛡️</div>
            <h1 className="brand-title">Anti<span>Phishing</span></h1>
            <p className="brand-subtitle">Advanced Cybersecurity Protection Platform</p>

            <div className="stats-grid">
              {[
                { val:'10K+', label:'URLs Scanned' },
                { val:'2.5K+', label:'Threats Blocked' },
                { val:'500+', label:'Users Protected' },
                { val:'99.9%', label:'Uptime' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="features-list">
              {[
                'Real-time phishing URL detection',
                'Google Safe Browsing + PhishTank integration',
                'Heuristic AI-powered threat analysis',
                'Interactive security lessons & quizzes',
                'Role-based access control system',
              ].map(f => (
                <div key={f} className="feature-item">
                  <div className="feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className="login-form-wrapper">

            <div className="form-header">
              <h2>Welcome back 👋</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {/* Role Tabs */}
            <div className="role-tabs">
              {[
                { val:'user', icon:'👤', label:'User' },
                { val:'admin', icon:'👨💼', label:'Admin' },
                { val:'guest', icon:'👥', label:'Guest' },
              ].map(r => (
                <button key={r.val} className={`role-tab ${role===r.val?'active':''}`} onClick={() => setRole(r.val)} type="button">
                  {r.icon} {r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="error-box">⚠️ {error}</div>
            )}

            <form onSubmit={submit}>
              {role !== 'guest' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <span className="input-icon">📧</span>
                      <input type="email" className="form-input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon">🔒</span>
                      <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {role === 'guest' ? (
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : '👥'} Continue as Guest
                </button>
              ) : (
                <button type="submit" className={`submit-btn ${role==='admin'?'admin-btn':''}`} disabled={loading}>
                  {loading ? <><div className="spinner" /> Signing In...</> : <>{role==='admin'?'🔐':'🚀'} Sign In to {role==='admin'?'Admin Panel':'Dashboard'}</>}
                </button>
              )}
            </form>

            {role !== 'guest' && (
              <>
                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">or</span>
                  <div className="divider-line" />
                </div>
                <button className="guest-btn" onClick={() => { setRole('guest'); navigate('/guest'); }}>
                  👥 Continue as Guest
                </button>
              </>
            )}

            <div className="form-footer">
              <Link to="/register">Don't have an account? <strong>Sign Up</strong></Link>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
