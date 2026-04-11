import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function Home() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState({ name: "User", age: "", dob: "", profilePicture: "" });
  const [urlInput, setUrlInput] = useState("");
  const [quizResults, setQuizResults] = useState([]);
  const [userStats, setUserStats] = useState({ totalScans: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 });
  const [adminRequestStatus, setAdminRequestStatus] = useState('none');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('userDarkMode') === 'true');
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  async function load() {
    try {
      const r = await api.get("/phish/all");
      const data = Array.isArray(r.data) ? r.data : [];
      setRows(data);
      setHistory(data.slice(0, 10).reverse());
      setUserStats({
        totalScans: data.length,
        highRisk: data.filter(s => s.risk === 'HIGH' || s.risk === 'Phishing').length,
        mediumRisk: data.filter(s => s.risk === 'MEDIUM' || s.risk === 'Suspicious').length,
        lowRisk: data.filter(s => s.risk === 'LOW' || s.risk === 'Safe').length
      });
    } catch (e) {
      console.log("No reports yet");
    }
  }

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data);
      setAdminRequestStatus(res.data.adminRequest || 'none');
      if (res.data.darkMode !== undefined) {
        setDarkMode(res.data.darkMode);
        localStorage.setItem('userDarkMode', res.data.darkMode);
      }
    } catch (e) {
      console.log("Profile not found");
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('/auth/my-notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {}
  };

  const markNotificationsRead = async () => {
    try {
      await api.put('/auth/mark-notifications-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('userDarkMode', next);
    try { await api.put('/auth/dark-mode', { darkMode: next }); } catch (e) {}
  };

  const requestAdmin = async () => {
    try {
      await api.post('/admin/request-admin');
      setAdminRequestStatus('pending');
      alert('Admin request sent! Wait for approval from the super admin.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const loadQuizResults = async () => {
    try {
      const res = await api.get('/results/all');
      setQuizResults(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (e) { console.log('No quiz results'); }
  };

  const quickScan = async () => {
    if (!urlInput.trim()) return;
    nav(`/scan?url=${encodeURIComponent(urlInput)}`);
  };

  useEffect(() => {
    load();
    loadProfile();
    loadQuizResults();
    loadNotifications();
  }, []);

  const high = userStats.highRisk;
  const med = userStats.mediumRisk;
  const low = userStats.lowRisk;

  const chartData = history.map((r, i) => ({
    name: i + 1,
    value: (r.risk === 'HIGH' || r.risk === 'Phishing') ? 3 : (r.risk === 'MEDIUM' || r.risk === 'Suspicious') ? 2 : 1,
    risk: r.risk
  }));

  return (
    <div className="user-dashboard" style={{ background: darkMode ? 'linear-gradient(135deg,#0f172a,#1e293b,#0f172a)' : 'linear-gradient(135deg,#f0f4ff,#e8eaf6,#f0f4ff)', color: darkMode ? 'white' : '#1f2937' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="user-avatar">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="User" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          <div className="user-info">
            <h1 className="user-title">🛡️ Security Dashboard</h1>
            <p className="user-subtitle">Welcome back, {profile.name || "User"}</p>
            {profile.age && <span className="user-age">Age: {profile.age}</span>}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => nav("/scan-history")} className="btn-history">📋 History</button>
          <button onClick={() => nav("/profile")} className="btn-profile">👤 Profile</button>
          <button onClick={() => nav("/report")} className="btn-report">🚨 Report</button>
          <button onClick={() => nav("/scan")} className="btn-history" style={{ background: 'linear-gradient(45deg,#10b981,#059669)' }}>🔍 Bulk Scan</button>
          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) markNotificationsRead(); }}
              style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', position: 'relative' }}>🔔</button>
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
            {showNotif && (
              <div style={{ position: 'absolute', right: 0, top: '110%', width: 300, background: darkMode ? '#1f2937' : 'white', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(59,130,246,0.1)', fontWeight: 700, color: '#3b82f6' }}>🔔 Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.6, color: darkMode ? 'white' : '#374151' }}>No notifications</div>
                ) : notifications.slice(0, 5).map((n, i) => (
                  <div key={i} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(59,130,246,0.05)', background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)', color: darkMode ? 'white' : '#374151', fontSize: '0.85rem' }}>
                    {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️'} {n.message}
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.2rem' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Dark Mode Toggle */}
          <button onClick={toggleDarkMode}
            style={{ padding: '0.75rem 1rem', background: darkMode ? '#f59e0b' : '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          {adminRequestStatus === 'none' && (
            <button onClick={requestAdmin} className="btn-admin-req">👑 Request Admin</button>
          )}
          {adminRequestStatus === 'pending' && (
            <button disabled className="btn-admin-pending">⏳ Admin Request Pending</button>
          )}
          {adminRequestStatus === 'approved' && (
            <button disabled className="btn-admin-approved">✅ Admin Approved</button>
          )}
          {adminRequestStatus === 'rejected' && (
            <button onClick={requestAdmin} className="btn-admin-req">🔄 Re-request Admin</button>
          )}
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user');
            nav("/");
          }} className="btn-logout">🚪 Logout</button>
        </div>
      </div>

      {/* Quick URL Scanner */}
      <div className="quick-scanner">
        <h3 className="scanner-title">🔍 Quick URL Scanner</h3>
        <div className="scanner-input">
          <input
            type="text"
            placeholder="Enter URL to scan for phishing threats..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="url-input"
            onKeyPress={(e) => e.key === 'Enter' && quickScan()}
          />
          <button onClick={quickScan} className="scan-btn">Scan Now</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatBox title="Total Scans" value={userStats.totalScans} icon="📊" color="#3b82f6" />
        <StatBox title="High Risk" value={high} icon="⚠️" color="#dc2626" />
        <StatBox title="Medium Risk" value={med} icon="⚡" color="#f59e0b" />
        <StatBox title="Safe URLs" value={low} icon="✅" color="#10b981" />
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        <ActionCard 
          icon="🔍" 
          title="Advanced Scanner" 
          desc="Deep scan URLs with AI-powered threat detection" 
          onClick={() => nav("/scan")} 
          gradient="linear-gradient(45deg, #3b82f6, #1d4ed8)"
        />
        <ActionCard 
          icon="🚨" 
          title="Report Threat" 
          desc="Help protect others by reporting suspicious sites" 
          onClick={() => nav("/report")} 
          gradient="linear-gradient(45deg, #dc2626, #b91c1c)"
        />
        <ActionCard 
          icon="📚" 
          title="Learn Security" 
          desc="Take lessons and quizzes on phishing detection" 
          onClick={() => nav("/lessons")} 
          gradient="linear-gradient(45deg, #8b5cf6, #7c3aed)"
        />
        <ActionCard 
          icon="📊" 
          title="My Progress" 
          desc="Track your learning progress and quiz scores" 
          onClick={() => nav("/learning-dashboard")} 
          gradient="linear-gradient(45deg, #06b6d4, #0891b2)"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3 className="chart-title">📈 Scan History Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip 
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value) => [value === 3 ? 'HIGH' : value === 2 ? 'MEDIUM' : 'LOW', 'Risk Level']}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorGradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="recent-scans">
          <h3 className="section-title">🔍 Recent Scans</h3>
          <div className="scans-list">
            {Array.isArray(rows) && rows.slice(0, 5).map(r => (
              <div key={r._id} className="scan-item">
                <div className="scan-url">{r.url}</div>
                <div className={`scan-risk risk-${r.risk === 'Phishing' ? 'high' : r.risk === 'Suspicious' ? 'medium' : r.risk === 'Safe' ? 'low' : r.risk.toLowerCase()}`}>
                  {r.risk}
                </div>
              </div>
            ))}
            {(!Array.isArray(rows) || rows.length === 0) && (
              <div className="no-scans">No scans yet. Start by scanning a URL above!</div>
            )}
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="security-tips">
        <h3 className="tips-title">🛡️ Security Best Practices</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🔍</div>
            <h4>Check URLs Carefully</h4>
            <p>Always verify domain spelling and look for suspicious characters</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📧</div>
            <h4>Email Vigilance</h4>
            <p>Never trust urgent emails asking for login credentials</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔒</div>
            <h4>HTTPS Verification</h4>
            <p>Ensure websites use HTTPS before entering sensitive data</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔑</div>
            <h4>Password Security</h4>
            <p>Never share passwords or OTPs with anyone</p>
          </div>
        </div>
      </div>

      {/* Quiz Results */}
      {quizResults.length > 0 && (
        <div className="quiz-results-section">
          <h3 className="section-title">📝 Recent Quiz Results</h3>
          <div className="results-list">
            {quizResults.map((result, idx) => (
              <div key={idx} className="result-item">
                <div className="result-info">
                  <h4>{result.quizTitle}</h4>
                  <span className="result-date">{new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="result-score">
                  <div className={`score-badge ${result.passed ? 'passed' : 'failed'}`}>
                    {result.percentage?.toFixed(0)}%
                  </div>
                  <span className={`status ${result.passed ? 'passed' : 'failed'}`}>
                    {result.passed ? '✅ PASSED' : '❌ FAILED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .user-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: white;
          padding: 2rem;
          animation: fadeIn 0.8s ease-in;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #3b82f6;
          animation: pulse 2s infinite;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          font-size: 24px;
        }

        .user-info h1 {
          margin: 0;
          font-size: 1.8rem;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .user-subtitle {
          margin: 0.5rem 0;
          opacity: 0.8;
        }

        .user-age {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-profile, .btn-report, .btn-logout, .btn-history {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-history {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .btn-profile {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .btn-report {
          background: linear-gradient(45deg, #f59e0b, #d97706);
          color: white;
        }

        .btn-logout {
          background: linear-gradient(45deg, #6b7280, #4b5563);
          color: white;
        }

        .btn-profile:hover, .btn-report:hover, .btn-logout:hover, .btn-history:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .btn-admin-req {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          background: linear-gradient(45deg, #8b5cf6, #7c3aed);
          color: white;
        }
        .btn-admin-req:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(139,92,246,0.3); }
        .btn-admin-pending {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          background: rgba(245,158,11,0.3);
          color: #f59e0b;
          cursor: not-allowed;
        }
        .btn-admin-approved {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          background: rgba(16,185,129,0.3);
          color: #10b981;
          cursor: not-allowed;
        }

        .quick-scanner {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .scanner-title {
          margin: 0 0 1rem 0;
          color: #3b82f6;
        }

        .scanner-input {
          display: flex;
          gap: 1rem;
        }

        .url-input {
          flex: 1;
          padding: 1rem;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.8);
          color: white;
          font-size: 1rem;
        }

        .url-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .scan-btn {
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .scan-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-container, .recent-scans {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .chart-title, .section-title {
          margin: 0 0 1rem 0;
          color: #3b82f6;
        }

        .scans-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .scan-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .scan-url {
          font-family: monospace;
          font-size: 0.9rem;
          flex: 1;
          margin-right: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .scan-risk {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .risk-high { background: #dc2626; }
        .risk-medium { background: #f59e0b; }
        .risk-low { background: #10b981; }

        .no-scans {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
          font-style: italic;
        }

        .security-tips {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .tips-title {
          margin: 0 0 1.5rem 0;
          color: #3b82f6;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .tip-card {
          background: rgba(59, 130, 246, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .tip-card:hover {
          transform: translateY(-4px);
        }

        .tip-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .tip-card h4 {
          margin: 0 0 0.5rem 0;
          color: #3b82f6;
        }

        .tip-card p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .quiz-results-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          margin-top: 2rem;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }

        .result-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .result-date {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .result-score {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .score-badge {
          font-size: 1.5rem;
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .score-badge.passed {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .score-badge.failed {
          background: rgba(220, 38, 38, 0.2);
          color: #dc2626;
        }

        .status {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status.passed {
          color: #10b981;
        }

        .status.failed {
          color: #dc2626;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .action-cards, .charts-section {
            grid-template-columns: 1fr;
          }
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }
          .scanner-input {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, gradient }) {
  return (
    <div className="action-card" onClick={onClick}>
      <div className="card-content">
        <h2 className="card-title">{icon} {title}</h2>
        <p className="card-desc">{desc}</p>
      </div>
      <style jsx>{`
        .action-card {
          background: ${gradient};
          padding: 2rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }
        .action-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .action-card:hover:before {
          opacity: 1;
        }
        .card-title {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }
        .card-desc {
          margin: 0;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

function StatBox({ title, value, icon, color }) {
  return (
    <div className="stat-box" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-content">
        <h4 className="stat-title">{title}</h4>
        <h2 className="stat-value">{value}</h2>
      </div>
      <style jsx>{`
        .stat-box {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          transition: transform 0.3s ease;
        }
        .stat-box:hover {
          transform: translateY(-4px);
        }
        .stat-icon {
          font-size: 2rem;
        }
        .stat-title {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .stat-value {
          margin: 0.5rem 0 0 0;
          font-size: 1.8rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

