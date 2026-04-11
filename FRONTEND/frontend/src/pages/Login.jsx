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
    if (role === "guest") { navigate("/guest"); setLoading(false); return; }
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .lp { min-height: 100vh; display: flex; background: #020b18; overflow: hidden; position: relative; }

        /* Animated background */
        .lp-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 60% 80%, rgba(99,102,241,0.08) 0%, transparent 50%);
        }

        /* Grid lines */
        .lp-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* LEFT */
        .lp-left {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 4rem 3rem; position: relative; z-index: 1;
        }

        .lp-shield {
          position: relative; margin-bottom: 2.5rem;
          animation: shield-float 4s ease-in-out infinite;
        }

        @keyframes shield-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .lp-shield-outer {
          width: 160px; height: 160px;
          background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(59,130,246,0.1));
          border: 1px solid rgba(14,165,233,0.3);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          position: relative;
        }

        .lp-shield-outer::before {
          content: ''; position: absolute; inset: -8px; border-radius: 50%;
          border: 1px solid rgba(14,165,233,0.15);
          animation: ring-pulse 3s ease-in-out infinite;
        }

        .lp-shield-outer::after {
          content: ''; position: absolute; inset: -18px; border-radius: 50%;
          border: 1px solid rgba(14,165,233,0.08);
          animation: ring-pulse 3s ease-in-out infinite 0.5s;
        }

        @keyframes ring-pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }

        .lp-shield-inner {
          width: 100px; height: 100px;
          background: linear-gradient(135deg, #0ea5e9, #3b82f6, #6366f1);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 3rem;
          box-shadow: 0 0 40px rgba(14,165,233,0.5), 0 0 80px rgba(14,165,233,0.2);
        }

        .lp-brand { text-align: center; margin-bottom: 3rem; }

        .lp-brand h1 {
          font-size: 2.4rem; font-weight: 800; color: white;
          letter-spacing: -1px; line-height: 1.1; margin-bottom: 0.75rem;
        }

        .lp-brand h1 span {
          background: linear-gradient(90deg, #0ea5e9, #3b82f6, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .lp-brand p {
          color: rgba(255,255,255,0.4); font-size: 0.95rem; line-height: 1.6; max-width: 340px;
        }

        .lp-features {
          display: flex; flex-direction: column; gap: 1rem;
          width: 100%; max-width: 360px;
        }

        .lp-feat {
          display: flex; align-items: center; gap: 1rem;
          background: rgba(14,165,233,0.05);
          border: 1px solid rgba(14,165,233,0.12);
          border-radius: 14px; padding: 1rem 1.25rem;
          transition: all 0.3s;
          animation: fadeInLeft 0.6s ease-out both;
        }

        .lp-feat:hover {
          background: rgba(14,165,233,0.1);
          border-color: rgba(14,165,233,0.3);
          transform: translateX(4px);
        }

        .lp-feat-icon {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(59,130,246,0.2));
          border: 1px solid rgba(14,165,233,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; flex-shrink: 0;
        }

        .lp-feat-text h4 { color: white; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.15rem; }
        .lp-feat-text p { color: rgba(255,255,255,0.4); font-size: 0.78rem; }

        /* RIGHT */
        .lp-right {
          width: 460px; background: rgba(255,255,255,0.02);
          border-left: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 2.5rem; position: relative; z-index: 1;
          backdrop-filter: blur(20px);
        }

        .lp-card {
          width: 100%;
          animation: fadeInRight 0.7s ease-out;
        }

        .lp-card-header { margin-bottom: 2rem; }

        .lp-card-header h2 {
          font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.4rem;
        }

        .lp-card-header p { color: rgba(255,255,255,0.35); font-size: 0.88rem; }

        /* Role selector */
        .lp-roles {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 0.6rem; margin-bottom: 1.75rem;
        }

        .lp-role {
          padding: 0.75rem 0.5rem;
          border-radius: 12px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          text-align: center; transition: all 0.25s;
        }

        .lp-role:hover { border-color: rgba(14,165,233,0.3); background: rgba(14,165,233,0.05); }

        .lp-role.active {
          border-color: #0ea5e9;
          background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(59,130,246,0.1));
          box-shadow: 0 0 20px rgba(14,165,233,0.15);
        }

        .lp-role-icon { font-size: 1.4rem; margin-bottom: 0.3rem; }
        .lp-role-name { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.6); }
        .lp-role.active .lp-role-name { color: #7dd3fc; }

        /* Inputs */
        .lp-field { margin-bottom: 1.1rem; }

        .lp-field label {
          display: block; font-size: 0.82rem; font-weight: 500;
          color: rgba(255,255,255,0.5); margin-bottom: 0.45rem; letter-spacing: 0.3px;
        }

        .lp-input-wrap { position: relative; }

        .lp-input-icon {
          position: absolute; left: 0.9rem; top: 50%;
          transform: translateY(-50%); font-size: 0.95rem; opacity: 0.4; pointer-events: none;
        }

        .lp-input {
          width: 100%; padding: 0.82rem 1rem 0.82rem 2.6rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; color: white; font-size: 0.92rem;
          outline: none; transition: all 0.25s; font-family: inherit;
        }

        .lp-input::placeholder { color: rgba(255,255,255,0.2); }

        .lp-input:focus {
          border-color: #0ea5e9;
          background: rgba(14,165,233,0.06);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }

        .lp-eye {
          position: absolute; right: 0.9rem; top: 50%;
          transform: translateY(-50%); background: none; border: none;
          cursor: pointer; font-size: 0.95rem; opacity: 0.4; transition: opacity 0.2s;
        }
        .lp-eye:hover { opacity: 0.8; }

        /* Error */
        .lp-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px; padding: 0.7rem 0.9rem;
          color: #fca5a5; font-size: 0.83rem; margin-bottom: 1.1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }

        /* Submit */
        .lp-btn {
          width: 100%; padding: 0.88rem; border: none; border-radius: 12px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer; color: white;
          background: linear-gradient(135deg, #0ea5e9, #3b82f6);
          box-shadow: 0 8px 24px rgba(14,165,233,0.3);
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: all 0.3s; margin-bottom: 1.25rem; font-family: inherit;
          letter-spacing: 0.2px;
        }

        .lp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(14,165,233,0.45);
        }

        .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .lp-btn.admin { background: linear-gradient(135deg, #6366f1, #3b82f6); box-shadow: 0 8px 24px rgba(99,102,241,0.3); }
        .lp-btn.admin:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(99,102,241,0.45); }

        .lp-spin {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .lp-div {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.1rem;
        }
        .lp-div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .lp-div-txt { color: rgba(255,255,255,0.25); font-size: 0.78rem; }

        /* Guest */
        .lp-guest {
          width: 100%; padding: 0.82rem; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.5); font-size: 0.88rem; font-weight: 500;
          cursor: pointer; transition: all 0.25s; margin-bottom: 1.5rem;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          font-family: inherit;
        }
        .lp-guest:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: white; }

        /* Footer */
        .lp-footer { display: flex; justify-content: space-between; align-items: center; }
        .lp-footer a { color: #38bdf8; text-decoration: none; font-size: 0.83rem; font-weight: 500; transition: color 0.2s; }
        .lp-footer a:hover { color: #7dd3fc; }

        /* Animations */
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .lp { flex-direction: column; }
          .lp-left { padding: 2.5rem 1.5rem; }
          .lp-right { width: 100%; border-left: none; border-top: 1px solid rgba(255,255,255,0.05); padding: 2rem 1.5rem; }
          .lp-shield-outer { width: 120px; height: 120px; }
          .lp-shield-inner { width: 76px; height: 76px; font-size: 2.2rem; }
          .lp-brand h1 { font-size: 1.8rem; }
        }
      `}</style>

      <div className="lp">
        <div className="lp-bg" />
        <div className="lp-grid" />

        {/* ── LEFT ── */}
        <div className="lp-left">
          <div className="lp-shield">
            <div className="lp-shield-outer">
              <div className="lp-shield-inner">🛡️</div>
            </div>
          </div>

          <div className="lp-brand">
            <h1>Anti<span>Phishing</span><br />Platform</h1>
            <p>Protect yourself from cyber threats with real-time phishing detection, security education, and advanced threat intelligence.</p>
          </div>

          <div className="lp-features">
            {[
              { icon: '🔍', title: 'Real-Time Detection', desc: 'Google Safe Browsing + PhishTank + AI' },
              { icon: '🎓', title: 'Security Education', desc: '10 lessons & 5 interactive quizzes' },
              { icon: '📊', title: 'Threat Analytics', desc: 'Detailed scan history & reports' },
              { icon: '🔐', title: 'Secure & Private', desc: 'JWT authentication & data encryption' },
            ].map((f, i) => (
              <div key={f.title} className="lp-feat" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="lp-feat-icon">{f.icon}</div>
                <div className="lp-feat-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="lp-right">
          <div className="lp-card">

            <div className="lp-card-header">
              <h2>Sign In</h2>
              <p>Welcome back! Please enter your credentials.</p>
            </div>

            {/* Role Selector */}
            <div className="lp-roles">
              {[
                { val: 'user', icon: '👤', name: 'User' },
                { val: 'admin', icon: '👨💼', name: 'Admin' },
                { val: 'guest', icon: '👥', name: 'Guest' },
              ].map(r => (
                <div key={r.val} className={`lp-role ${role === r.val ? 'active' : ''}`} onClick={() => setRole(r.val)}>
                  <div className="lp-role-icon">{r.icon}</div>
                  <div className="lp-role-name">{r.name}</div>
                </div>
              ))}
            </div>

            {error && <div className="lp-error">⚠️ {error}</div>}

            <form onSubmit={submit}>
              {role !== 'guest' && (
                <>
                  <div className="lp-field">
                    <label>Email Address</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon">📧</span>
                      <input className="lp-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div className="lp-field">
                    <label>Password</label>
                    <div className="lp-input-wrap">
                      <span className="lp-input-icon">🔒</span>
                      <input className="lp-input" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className={`lp-btn ${role === 'admin' ? 'admin' : ''}`} disabled={loading}>
                {loading
                  ? <><div className="lp-spin" /> Signing In...</>
                  : role === 'guest'
                    ? <> 👥 Continue as Guest</>
                    : <>{role === 'admin' ? '🔐' : '🚀'} Sign In to {role === 'admin' ? 'Admin Panel' : 'Dashboard'}</>
                }
              </button>
            </form>

            {role !== 'guest' && (
              <>
                <div className="lp-div">
                  <div className="lp-div-line" />
                  <span className="lp-div-txt">or</span>
                  <div className="lp-div-line" />
                </div>
                <button className="lp-guest" onClick={() => navigate('/guest')}>
                  👥 Continue as Guest
                </button>
              </>
            )}

            <div className="lp-footer">
              <Link to="/register">New here? <strong>Create account</strong></Link>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
