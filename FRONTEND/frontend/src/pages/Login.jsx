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

  const roles = [
    { val: "guest", icon: "👥", label: "Guest", desc: "Browse freely" },
    { val: "user",  icon: "👤", label: "User",  desc: "Scan & Learn" },
    { val: "admin", icon: "🛡️", label: "Admin", desc: "Full Access" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060d1f;
          font-family: 'Inter', sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Animated background blobs */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
          animation: blob-move 10s ease-in-out infinite;
        }
        .blob-1 { width: 500px; height: 500px; background: #1d4ed8; top: -150px; left: -150px; animation-delay: 0s; }
        .blob-2 { width: 400px; height: 400px; background: #0ea5e9; bottom: -100px; right: -100px; animation-delay: 3s; }
        .blob-3 { width: 300px; height: 300px; background: #6366f1; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 6s; }

        @keyframes blob-move {
          0%,100% { transform: scale(1) translate(0,0); }
          33% { transform: scale(1.1) translate(20px,-20px); }
          66% { transform: scale(0.95) translate(-15px,15px); }
        }

        /* Floating particles */
        .particles { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
        .p {
          position: absolute;
          width: 3px; height: 3px;
          background: rgba(14,165,233,0.6);
          border-radius: 50%;
          animation: rise linear infinite;
        }
        @keyframes rise {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-50px) scale(1); opacity: 0; }
        }

        /* Card */
        .card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(30px);
          box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
          z-index: 10;
          animation: card-in 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes card-in {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top logo */
        .logo-wrap {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 2rem;
        }

        .logo-ring {
          width: 72px; height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
          box-shadow: 0 8px 32px rgba(14,165,233,0.4);
          margin-bottom: 1rem;
          animation: logo-bounce 3s ease-in-out infinite;
          position: relative;
        }

        .logo-ring::after {
          content: '';
          position: absolute; inset: -4px;
          border-radius: 24px;
          border: 2px solid rgba(14,165,233,0.3);
          animation: ring-spin 4s linear infinite;
        }

        @keyframes logo-bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .logo-title {
          font-size: 1.5rem; font-weight: 800; color: white; letter-spacing: -0.5px;
        }

        .logo-title span {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .logo-sub { color: rgba(255,255,255,0.35); font-size: 0.82rem; margin-top: 0.25rem; }

        /* Role selector */
        .roles { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem; margin-bottom: 1.75rem; }

        .role-btn {
          padding: 0.85rem 0.5rem;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          text-align: center;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
        }

        .role-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1));
          opacity: 0;
          transition: opacity 0.25s;
        }

        .role-btn:hover { transform: translateY(-3px); border-color: rgba(14,165,233,0.3); }
        .role-btn:hover::before { opacity: 1; }

        .role-btn.active {
          border-color: #0ea5e9;
          background: rgba(14,165,233,0.1);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 24px rgba(14,165,233,0.2), 0 0 0 1px rgba(14,165,233,0.3);
        }

        .role-btn.active::before { opacity: 1; }

        .role-icon { font-size: 1.5rem; margin-bottom: 0.3rem; display: block; }
        .role-name { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.5); display: block; }
        .role-desc { font-size: 0.68rem; color: rgba(255,255,255,0.25); display: block; margin-top: 0.1rem; }
        .role-btn.active .role-name { color: #7dd3fc; }
        .role-btn.active .role-desc { color: rgba(125,211,252,0.5); }

        /* Active indicator dot */
        .role-btn.active::after {
          content: '';
          position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
          width: 5px; height: 5px; border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 6px #0ea5e9;
        }

        /* Fields */
        .fields { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }

        .field label {
          display: block; font-size: 0.8rem; font-weight: 600;
          color: rgba(255,255,255,0.45); margin-bottom: 0.4rem; letter-spacing: 0.3px;
        }

        .input-box { position: relative; }

        .input-icon {
          position: absolute; left: 0.85rem; top: 50%;
          transform: translateY(-50%); font-size: 0.9rem; opacity: 0.35; pointer-events: none;
        }

        .inp {
          width: 100%; padding: 0.8rem 1rem 0.8rem 2.5rem;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; color: white; font-size: 0.9rem;
          outline: none; transition: all 0.25s; font-family: inherit;
        }

        .inp::placeholder { color: rgba(255,255,255,0.18); }

        .inp:focus {
          border-color: #0ea5e9;
          background: rgba(14,165,233,0.07);
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }

        .eye {
          position: absolute; right: 0.85rem; top: 50%;
          transform: translateY(-50%); background: none; border: none;
          cursor: pointer; font-size: 0.9rem; opacity: 0.35; transition: opacity 0.2s;
        }
        .eye:hover { opacity: 0.8; }

        /* Error */
        .err {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px; padding: 0.65rem 0.9rem;
          color: #fca5a5; font-size: 0.82rem; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.5rem;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        /* Button */
        .btn {
          width: 100%; padding: 0.88rem; border: none; border-radius: 13px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer; color: white;
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          box-shadow: 0 6px 20px rgba(14,165,233,0.3);
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: all 0.3s; font-family: inherit; letter-spacing: 0.2px;
          position: relative; overflow: hidden;
        }

        .btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0; transition: opacity 0.3s;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(14,165,233,0.45);
        }

        .btn:hover::after { opacity: 1; }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .btn.admin-btn { background: linear-gradient(135deg, #4f46e5, #6366f1); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
        .btn.admin-btn:hover:not(:disabled) { box-shadow: 0 10px 30px rgba(99,102,241,0.45); }

        .spin {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spinning 0.7s linear infinite;
        }
        @keyframes spinning { to { transform: rotate(360deg); } }

        /* Divider */
        .divider { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; }
        .div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .div-txt { color: rgba(255,255,255,0.2); font-size: 0.75rem; }

        /* Guest */
        .guest-btn {
          width: 100%; padding: 0.8rem; border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; background: transparent;
          color: rgba(255,255,255,0.4); font-size: 0.88rem; font-weight: 500;
          cursor: pointer; transition: all 0.25s; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .guest-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); }

        /* Footer */
        .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
        .footer a { color: #38bdf8; text-decoration: none; font-size: 0.82rem; font-weight: 500; transition: color 0.2s; }
        .footer a:hover { color: #7dd3fc; }
      `}</style>

      {/* Background */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Particles */}
      <div className="particles">
        {[
          {l:'8%',d:'8s',del:'0s'},{l:'18%',d:'12s',del:'2s'},
          {l:'30%',d:'9s',del:'4s'},{l:'45%',d:'14s',del:'1s'},
          {l:'58%',d:'10s',del:'6s'},{l:'70%',d:'11s',del:'3s'},
          {l:'82%',d:'13s',del:'5s'},{l:'92%',d:'8s',del:'7s'},
        ].map((p,i) => (
          <div key={i} className="p" style={{ left:p.l, animationDuration:p.d, animationDelay:p.del }} />
        ))}
      </div>

      {/* Card */}
      <div className="card">

        {/* Logo */}
        <div className="logo-wrap">
          <div className="logo-ring">🛡️</div>
          <div className="logo-title">Anti<span>Phishing</span></div>
          <div className="logo-sub">Cybersecurity Protection Platform</div>
        </div>

        {/* Role Selector */}
        <div className="roles">
          {roles.map(r => (
            <div key={r.val} className={`role-btn ${role === r.val ? 'active' : ''}`} onClick={() => setRole(r.val)}>
              <span className="role-icon">{r.icon}</span>
              <span className="role-name">{r.label}</span>
              <span className="role-desc">{r.desc}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div className="err">⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={submit}>
          {role !== 'guest' && (
            <div className="fields">
              <div className="field">
                <label>Email Address</label>
                <div className="input-box">
                  <span className="input-icon">📧</span>
                  <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="field">
                <label>Password</label>
                <div className="input-box">
                  <span className="input-icon">🔒</span>
                  <input className="inp" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className={`btn ${role === 'admin' ? 'admin-btn' : ''}`} disabled={loading}>
            {loading
              ? <><div className="spin" /> Signing In...</>
              : role === 'guest'
                ? <>👥 Continue as Guest</>
                : <>{role === 'admin' ? '🔐' : '🚀'} Sign In to {role === 'admin' ? 'Admin Panel' : 'Dashboard'}</>
            }
          </button>
        </form>

        {role !== 'guest' && (
          <>
            <div className="divider">
              <div className="div-line" /><span className="div-txt">or</span><div className="div-line" />
            </div>
            <button className="guest-btn" onClick={() => navigate('/guest')}>
              👥 Continue as Guest
            </button>
          </>
        )}

        <div className="footer">
          <Link to="/register">New here? <strong>Sign Up</strong></Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

      </div>
    </>
  );
}
