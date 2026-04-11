import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

// SVG Icons
const GuestIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const UserIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const AdminIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>
);

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
      localStorage.setItem("refreshToken", res.data.refreshToken || "");
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
    { val: "guest", Icon: GuestIcon, label: "Guest",  desc: "Browse freely",  color: "#0ea5e9" },
    { val: "user",  Icon: UserIcon,  label: "User",   desc: "Scan & Learn",   color: "#3b82f6" },
    { val: "admin", Icon: AdminIcon, label: "Admin",  desc: "Full Access",    color: "#6366f1" },
  ];

  const btnColor = role === "admin" ? "linear-gradient(135deg,#4f46e5,#6366f1)" : "linear-gradient(135deg,#0284c7,#3b82f6)";
  const btnShadow = role === "admin" ? "0 8px 24px rgba(99,102,241,0.4)" : "0 8px 24px rgba(14,165,233,0.4)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(160deg, #e0f2fe 0%, #bae6fd 30%, #dbeafe 60%, #ede9fe 100%);
          font-family: 'Inter', sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Animated circles in background */
        .lp-circle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          animation: circle-float ease-in-out infinite;
        }
        .lp-c1 { width:400px;height:400px;background:rgba(14,165,233,0.12);top:-100px;left:-100px;animation-duration:12s;animation-delay:0s; }
        .lp-c2 { width:300px;height:300px;background:rgba(59,130,246,0.1);bottom:-80px;right:-80px;animation-duration:10s;animation-delay:3s; }
        .lp-c3 { width:200px;height:200px;background:rgba(99,102,241,0.08);top:40%;right:10%;animation-duration:14s;animation-delay:6s; }
        .lp-c4 { width:150px;height:150px;background:rgba(14,165,233,0.1);bottom:20%;left:5%;animation-duration:9s;animation-delay:2s; }

        @keyframes circle-float {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(15px,-15px) scale(1.05); }
          66% { transform: translate(-10px,10px) scale(0.97); }
        }

        /* Floating dots */
        .lp-dot {
          position: fixed;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(14,165,233,0.4);
          pointer-events: none;
          animation: dot-rise linear infinite;
        }
        @keyframes dot-rise {
          0%   { transform: translateY(100vh); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-60px); opacity: 0; }
        }

        /* Card */
        .lp-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          padding: 2.5rem 2.25rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(14,165,233,0.15), 0 4px 20px rgba(0,0,0,0.08);
          position: relative;
          z-index: 10;
          animation: card-up 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes card-up {
          from { opacity:0; transform:translateY(32px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* Logo */
        .lp-logo {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 1.75rem;
        }

        .lp-logo-icon {
          width: 68px; height: 68px;
          background: linear-gradient(135deg, #0284c7, #3b82f6);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(14,165,233,0.35);
          margin-bottom: 0.9rem;
          animation: icon-float 3s ease-in-out infinite;
          position: relative;
        }

        .lp-logo-icon::before {
          content: '';
          position: absolute; inset: -5px;
          border-radius: 25px;
          border: 2px solid rgba(14,165,233,0.25);
          animation: icon-ring 4s linear infinite;
        }

        @keyframes icon-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes icon-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .lp-logo-title {
          font-size: 1.45rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;
        }

        .lp-logo-title span { color: #0284c7; }

        .lp-logo-sub {
          font-size: 0.8rem; color: #64748b; margin-top: 0.2rem;
        }

        /* Role selector */
        .lp-roles {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 0.6rem; margin-bottom: 1.6rem;
        }

        .lp-role {
          padding: 0.9rem 0.4rem;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          background: white;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }

        .lp-role:hover {
          border-color: #7dd3fc;
          background: #f0f9ff;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(14,165,233,0.15);
        }

        .lp-role.active {
          border-color: #0ea5e9;
          background: linear-gradient(135deg, #f0f9ff, #eff6ff);
          transform: translateY(-4px) scale(1.03);
          box-shadow: 0 10px 28px rgba(14,165,233,0.25);
        }

        .lp-role-icon {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.4rem;
          color: #94a3b8;
          transition: color 0.3s;
        }

        .lp-role:hover .lp-role-icon { color: #0ea5e9; }
        .lp-role.active .lp-role-icon { color: #0284c7; }

        .lp-role-name {
          font-size: 0.8rem; font-weight: 700; color: #64748b; display: block;
          transition: color 0.3s;
        }

        .lp-role-desc {
          font-size: 0.65rem; color: #94a3b8; display: block; margin-top: 0.1rem;
          transition: color 0.3s;
        }

        .lp-role.active .lp-role-name { color: #0284c7; }
        .lp-role.active .lp-role-desc { color: #38bdf8; }

        /* Active dot */
        .lp-role.active::after {
          content: '';
          position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%);
          width: 5px; height: 5px; border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 8px #0ea5e9;
          animation: dot-pulse 1.5s ease-in-out infinite;
        }

        @keyframes dot-pulse {
          0%,100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.4); opacity: 0.7; }
        }

        /* Fields */
        .lp-fields { display: flex; flex-direction: column; gap: 0.9rem; margin-bottom: 1.1rem; }

        .lp-field label {
          display: block; font-size: 0.78rem; font-weight: 600;
          color: #475569; margin-bottom: 0.35rem; letter-spacing: 0.3px;
        }

        .lp-input-wrap { position: relative; }

        .lp-input-icon {
          position: absolute; left: 0.85rem; top: 50%;
          transform: translateY(-50%); color: #94a3b8; pointer-events: none;
          display: flex; align-items: center;
        }

        .lp-inp {
          width: 100%; padding: 0.78rem 1rem 0.78rem 2.5rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px; color: #0f172a; font-size: 0.9rem;
          outline: none; transition: all 0.25s; font-family: inherit;
        }

        .lp-inp::placeholder { color: #cbd5e1; }

        .lp-inp:focus {
          border-color: #0ea5e9;
          background: #f0f9ff;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }

        .lp-eye {
          position: absolute; right: 0.85rem; top: 50%;
          transform: translateY(-50%); background: none; border: none;
          cursor: pointer; color: #94a3b8; transition: color 0.2s;
          display: flex; align-items: center;
        }
        .lp-eye:hover { color: #0ea5e9; }

        /* Error */
        .lp-err {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 10px; padding: 0.65rem 0.9rem;
          color: #dc2626; font-size: 0.82rem; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.5rem;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Button */
        .lp-btn {
          width: 100%; padding: 0.85rem; border: none; border-radius: 13px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          transition: all 0.3s; font-family: inherit; letter-spacing: 0.2px;
          position: relative; overflow: hidden;
        }

        .lp-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .lp-spin {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white; border-radius: 50%;
          animation: spinning 0.7s linear infinite;
        }
        @keyframes spinning { to { transform: rotate(360deg); } }

        /* Divider */
        .lp-div { display: flex; align-items: center; gap: 0.75rem; margin: 0.9rem 0; }
        .lp-div-line { flex: 1; height: 1px; background: #e2e8f0; }
        .lp-div-txt { color: #94a3b8; font-size: 0.75rem; }

        /* Guest btn */
        .lp-guest {
          width: 100%; padding: 0.78rem; border: 1.5px solid #e2e8f0;
          border-radius: 12px; background: white;
          color: #64748b; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
        }
        .lp-guest:hover { background: #f0f9ff; border-color: #7dd3fc; color: #0284c7; }

        /* Footer */
        .lp-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
        .lp-footer a { color: #0284c7; text-decoration: none; font-size: 0.82rem; font-weight: 500; transition: color 0.2s; }
        .lp-footer a:hover { color: #0ea5e9; }
      `}</style>

      {/* Background circles */}
      <div className="lp-c1 lp-circle" />
      <div className="lp-c2 lp-circle" />
      <div className="lp-c3 lp-circle" />
      <div className="lp-c4 lp-circle" />

      {/* Floating dots */}
      {[{l:'10%',d:'9s',del:'0s'},{l:'22%',d:'13s',del:'2s'},{l:'38%',d:'10s',del:'5s'},
        {l:'55%',d:'15s',del:'1s'},{l:'68%',d:'11s',del:'4s'},{l:'80%',d:'12s',del:'7s'},
        {l:'90%',d:'8s',del:'3s'}].map((p,i) => (
        <div key={i} className="lp-dot" style={{left:p.l,animationDuration:p.d,animationDelay:p.del}} />
      ))}

      {/* Centered wrapper */}
      <div className="lp-wrap">
        <div className="lp-card">

          {/* Logo */}
          <div className="lp-logo">
            <div className="lp-logo-icon"><ShieldIcon /></div>
            <div className="lp-logo-title">Anti<span>Phishing</span></div>
            <div className="lp-logo-sub">Cybersecurity Protection Platform</div>
          </div>

          {/* Role Selector */}
          <div className="lp-roles">
            {roles.map(({ val, Icon, label, desc }) => (
              <div key={val} className={`lp-role ${role === val ? 'active' : ''}`} onClick={() => setRole(val)}>
                <div className="lp-role-icon"><Icon /></div>
                <span className="lp-role-name">{label}</span>
                <span className="lp-role-desc">{desc}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && <div className="lp-err">⚠ {error}</div>}

          {/* Form */}
          <form onSubmit={submit}>
            {role !== 'guest' && (
              <div className="lp-fields">
                <div className="lp-field">
                  <label>Email Address</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><EmailIcon /></span>
                    <input className="lp-inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="lp-field">
                  <label>Password</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon"><LockIcon /></span>
                    <input className="lp-inp" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="lp-eye" onClick={() => setShowPassword(!showPassword)}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="lp-btn" disabled={loading}
              style={{ background: btnColor, boxShadow: btnShadow }}>
              {loading
                ? <><div className="lp-spin" /> Signing In...</>
                : role === 'guest'
                  ? <> Continue as Guest</>
                  : <> Sign In to {role === 'admin' ? 'Admin Panel' : 'Dashboard'}</>
              }
            </button>
          </form>

          {role !== 'guest' && (
            <>
              <div className="lp-div">
                <div className="lp-div-line" /><span className="lp-div-txt">or</span><div className="lp-div-line" />
              </div>
              <button className="lp-guest" onClick={() => navigate('/guest')}>
                <GuestIcon /> Continue as Guest
              </button>
            </>
          )}

          <div className="lp-footer">
            <Link to="/register">New here? <strong>Sign Up</strong></Link>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

        </div>
      </div>
    </>
  );
}
