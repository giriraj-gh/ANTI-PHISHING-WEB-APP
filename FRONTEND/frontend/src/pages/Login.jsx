import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");
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
      setError(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 25%,#312e81 75%,#1e1b4b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      {/* Floating background shapes */}
      {[{w:100,h:100,t:'20%',l:'5%',d:'0s'},{w:150,h:150,t:'60%',r:'10%',d:'2s'},{w:80,h:80,b:'15%',l:'15%',d:'4s'},{w:120,h:120,t:'10%',r:'25%',d:'1s'}].map((s,i) => (
        <div key={i} style={{ position:'absolute', width:s.w, height:s.h, borderRadius:'50%', background:'linear-gradient(45deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))', top:s.t, left:s.l, right:s.r, bottom:s.b, animation:`float 6s ease-in-out ${s.d} infinite`, pointerEvents:'none' }} />
      ))}

      {/* ── TOP BANNER ── */}
      <div style={{ width:'100%', maxWidth:'1200px', marginBottom:'2rem', borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', position:'relative', zIndex:1 }}>
        <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e293b 30%,#312e81 60%,#4c1d95 80%,#1e1b4b 100%)', padding:'2.5rem 3rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'2rem', position:'relative', overflow:'hidden' }}>

          {/* Glow effects */}
          <div style={{ position:'absolute', width:300, height:300, background:'radial-gradient(circle,rgba(59,130,246,0.25) 0%,transparent 70%)', top:-100, left:-50, pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:250, height:250, background:'radial-gradient(circle,rgba(139,92,246,0.25) 0%,transparent 70%)', bottom:-80, right:-50, pointerEvents:'none' }} />

          {/* Left: Logo + Title */}
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', zIndex:1 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(45deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', boxShadow:'0 0 30px rgba(59,130,246,0.5)', animation:'pulse-logo 2s ease-in-out infinite' }}>
              🛡️
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'2rem', fontWeight:800, color:'white', letterSpacing:'1px', textShadow:'0 0 20px rgba(59,130,246,0.5)' }}>
                Anti-Phishing App
              </h1>
              <p style={{ margin:'0.25rem 0 0', color:'rgba(255,255,255,0.7)', fontSize:'0.95rem', letterSpacing:'0.5px' }}>
                Advanced Threat Detection & Protection Platform
              </p>
            </div>
          </div>

          {/* Right: Feature badges */}
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', zIndex:1 }}>
            {[
              { icon:'🔍', label:'Real-Time Detection' },
              { icon:'🎓', label:'Security Education' },
              { icon:'📊', label:'Analytics Dashboard' },
              { icon:'🔒', label:'JWT Protected' }
            ].map(f => (
              <div key={f.label} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(10px)', padding:'0.5rem 1rem', borderRadius:'25px', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:'0.85rem', fontWeight:600 }}>
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background:'rgba(15,23,42,0.9)', padding:'0.75rem 3rem', display:'flex', gap:'3rem', flexWrap:'wrap', borderTop:'1px solid rgba(59,130,246,0.2)' }}>
          {[
            { label:'URLs Scanned', value:'10K+', color:'#3b82f6' },
            { label:'Threats Detected', value:'2.5K+', color:'#dc2626' },
            { label:'Users Protected', value:'500+', color:'#10b981' },
            { label:'Lessons Available', value:'10', color:'#8b5cf6' }
          ].map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span style={{ color:s.color, fontWeight:700, fontSize:'1.1rem' }}>{s.value}</span>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', maxWidth:'1200px', width:'100%', zIndex:1 }}>

        {/* Login Card */}
        <div style={{ background:'rgba(255,255,255,0.97)', borderRadius:'24px', padding:'2.5rem', boxShadow:'0 25px 50px rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.2)', animation:'slideInLeft 0.6s ease-out' }}>

          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <h2 style={{ margin:'0 0 0.25rem', fontSize:'1.5rem', fontWeight:700, background:'linear-gradient(45deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Welcome Back!</h2>
            <p style={{ margin:0, color:'#6b7280', fontSize:'0.9rem' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {error && (
              <div style={{ background:'#fef2f2', color:'#dc2626', padding:'0.75rem 1rem', borderRadius:'10px', border:'1px solid #fecaca', display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:500, fontSize:'0.9rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.4rem', fontWeight:600, color:'#374151', fontSize:'0.9rem' }}>📧 Email Address</label>
              <input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} required={role !== 'guest'}
                style={{ width:'100%', padding:'0.85rem 1rem', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'0.95rem', background:'white', boxSizing:'border-box', outline:'none', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
            </div>

            <div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.4rem', fontWeight:600, color:'#374151', fontSize:'0.9rem' }}>🔒 Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required={role !== 'guest'}
                  style={{ width:'100%', padding:'0.85rem 3rem 0.85rem 1rem', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'0.95rem', background:'white', boxSizing:'border-box', outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem' }}>
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.4rem', fontWeight:600, color:'#374151', fontSize:'0.9rem' }}>🎭 Login As</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem' }}>
                {[
                  { val:'guest', icon:'👥', title:'Guest', desc:'Browse & Learn' },
                  { val:'user', icon:'👤', title:'User', desc:'Scan & Report' },
                  { val:'admin', icon:'👨‍💼', title:'Admin', desc:'Full Access' }
                ].map(r => (
                  <div key={r.val} onClick={() => setRole(r.val)}
                    style={{ padding:'0.75rem', border:`2px solid ${role===r.val?'#3b82f6':'#e5e7eb'}`, borderRadius:'10px', cursor:'pointer', textAlign:'center', background:role===r.val?'linear-gradient(45deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))':'white', transition:'all 0.2s' }}>
                    <div style={{ fontSize:'1.3rem', marginBottom:'0.2rem' }}>{r.icon}</div>
                    <div style={{ fontWeight:600, color:'#374151', fontSize:'0.85rem' }}>{r.title}</div>
                    <div style={{ color:'#6b7280', fontSize:'0.7rem' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ padding:'0.9rem', border:'none', borderRadius:'12px', fontSize:'1rem', fontWeight:700, cursor:loading?'not-allowed':'pointer', background:role==='admin'?'linear-gradient(45deg,#8b5cf6,#7c3aed)':'linear-gradient(45deg,#3b82f6,#1d4ed8)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', opacity:loading?0.7:1, transition:'all 0.2s' }}>
              {loading ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 1s linear infinite' }} />Signing In...</> : <>🚀 Sign In to {role==='admin'?'Admin Panel':'Dashboard'}</>}
            </button>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'0.5rem' }}>
              <Link to="/register" style={{ color:'#3b82f6', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 }}>Don't have an account? <strong>Sign Up</strong></Link>
              <Link to="/forgot-password" style={{ color:'#3b82f6', textDecoration:'none', fontSize:'0.85rem' }}>Forgot Password?</Link>
            </div>
          </form>
        </div>

        {/* Right Features Panel */}
        <div style={{ color:'white', animation:'slideInRight 0.6s ease-out', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
          <div>
            <h3 style={{ margin:'0 0 1.5rem', fontSize:'1.4rem', textAlign:'center' }}>🛡️ Why Choose Our Platform?</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {[
                { icon:'🔍', title:'Advanced Scanning', desc:'Google Safe Browsing + PhishTank + Heuristic AI' },
                { icon:'⚡', title:'Real-time Protection', desc:'Instant threat detection & alerts' },
                { icon:'📚', title:'Security Education', desc:'10 lessons + 5 quizzes with leaderboard' },
                { icon:'📊', title:'Analytics Dashboard', desc:'Comprehensive scan history & reports' },
                { icon:'👥', title:'Role-Based Access', desc:'Guest, User & Admin roles' },
                { icon:'🔒', title:'JWT Secured', desc:'Token-based authentication system' }
              ].map(f => (
                <div key={f.title} style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(10px)', padding:'1.25rem', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.15)', transition:'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{ fontSize:'1.8rem', marginBottom:'0.5rem' }}>{f.icon}</div>
                  <h4 style={{ margin:'0 0 0.25rem', fontSize:'0.9rem' }}>{f.title}</h4>
                  <p style={{ margin:0, fontSize:'0.78rem', opacity:0.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security badges */}
          <div style={{ display:'flex', justifyContent:'center', gap:'1rem', flexWrap:'wrap' }}>
            {['🔒 SSL Encrypted','🛡️ GDPR Compliant','⚡ 99.9% Uptime','🌐 Cloud Hosted'].map(b => (
              <span key={b} style={{ background:'rgba(255,255,255,0.1)', padding:'0.4rem 0.9rem', borderRadius:'20px', fontSize:'0.8rem', border:'1px solid rgba(255,255,255,0.2)' }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(180deg)} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse-logo { 0%,100%{box-shadow:0 0 30px rgba(59,130,246,0.5)} 50%{box-shadow:0 0 50px rgba(139,92,246,0.8)} }
        @media(max-width:768px){
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
          div[style*="gap: 3rem"]{gap:1.5rem!important}
        }
      `}</style>
    </div>
  );
}
