import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [admin, setAdmin] = useState(null);

  const chartData = [
    { name: 'High Risk', value: stats.high, color: '#dc2626' },
    { name: 'Medium Risk', value: stats.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: stats.low, color: '#10b981' }
  ];

  const trendData = [
    { day: 'Mon', threats: 12 },
    { day: 'Tue', threats: 19 },
    { day: 'Wed', threats: 8 },
    { day: 'Thu', threats: 15 },
    { day: 'Fri', threats: 22 },
    { day: 'Sat', threats: 7 },
    { day: 'Sun', threats: 11 }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      const [usersRes, pendingRes, statsRes] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/pending-users`, { headers }),
        fetch(`${API}/api/admin/stats`, { headers })
      ]);
      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setPendingUsers(Array.isArray(pendingData) ? pendingData : []);
      setStats(statsData);
      setAdmin(JSON.parse(localStorage.getItem('user')));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/approve-user/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/reject-user/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="admin-avatar">
            {admin?.profilePicture ? (
              <img src={admin.profilePicture} alt="Admin" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">👨💼</div>
            )}
          </div>
          <div className="admin-info">
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome back, {admin?.name || 'Admin'}</p>
            {admin?.age && <p className="admin-age">Age: {admin.age}</p>}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-profile" onClick={() => navigate('/profile')}>👤 Profile</button>
          <button className="btn-lessons" onClick={() => navigate('/admin/manage-lessons')}>📚 Lessons</button>
          <button className="btn-quiz" onClick={() => navigate('/admin/manage-quiz')}>📝 Quiz</button>
          <button className="btn-scan" onClick={() => navigate('/scan')}>🔍 Quick Scan</button>
          <button className="btn-logout" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="High Risk" value={stats.high} icon="🚨" color="#dc2626" />
        <StatCard title="Medium Risk" value={stats.medium} icon="⚡" color="#f59e0b" />
        <StatCard title="Active Users" value={users.length} icon="👥" color="#10b981" />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3 className="chart-title">📊 Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">🥧 Risk Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="trend-section">
        <h3 className="chart-title">📈 Threat Trends (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <XAxis dataKey="day" stroke="#e5e7eb" />
            <YAxis stroke="#e5e7eb" />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="threats" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Reports */}
      <div className="reports-section">
        <h3 className="section-title">🔍 Recent URL Scans</h3>
        <div className="reports-list">
          {reports.length > 0 ? reports.slice(0, 5).map(report => (
            <div key={report._id} className="report-item">
              <div className="report-user">👤 {report.userName}</div>
              <div className="report-url">{report.url}</div>
              <div className={`report-risk risk-${report.risk.toLowerCase()}`}>
                {report.risk}
              </div>
              <div className="report-date">
                {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          )) : (
            <div className="no-data">No scan history yet</div>
          )}
        </div>
      </div>

      {/* Quiz Results */}
      <div className="quiz-results-section">
        <h3 className="section-title">📝 Recent Quiz Results</h3>
        <div className="quiz-results-list">
          {quizResults.length > 0 ? quizResults.slice(0, 5).map(result => (
            <div key={result.id} className="quiz-result-item">
              <div className="result-user">👤 {result.userName}</div>
              <div className="result-quiz">{result.quizTitle}</div>
              <div className="result-score">
                <span className={`score-badge ${result.percentage >= 80 ? 'excellent' : result.percentage >= 60 ? 'good' : 'needs-improvement'}`}>
                  {result.score}/{result.total} ({result.percentage}%)
                </span>
              </div>
              <div className="result-date">
                {new Date(result.completedAt).toLocaleDateString()}
              </div>
            </div>
          )) : (
            <div className="no-data">No quiz results yet</div>
          )}
        </div>
      </div>

      {/* Pending Users Approval */}
      <div className="users-section" style={{ borderLeft: '4px solid #f59e0b' }}>
        <h3 className="section-title">⏳ Pending Approval ({pendingUsers.length})</h3>
        <div className="users-list">
          {pendingUsers.length === 0 ? (
            <div className="no-data">No pending requests</div>
          ) : pendingUsers.map(user => (
            <div key={user._id} className="user-item">
              <div className="user-info">
                <div className="user-name">👤 {user.name}</div>
                <div className="user-email">{user.email}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Role: {user.role}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => handleApprove(user._id)} style={{ padding: '0.5rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>✅ Approve</button>
                <button onClick={() => handleReject(user._id)} style={{ padding: '0.5rem 1.25rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Tracking with Stats */}
      <div className="users-section">
        <h3 className="section-title">👥 Registered Users & Activity</h3>
        <div className="users-list">
          {users.map(user => {
            const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
            return (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <div className="user-name">👤 {user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <div className="user-stats">
                  <span className="stat-badge">📊 {userStats.totalScans || 0} scans</span>
                  <span className="stat-badge high">🚨 {userStats.highRisk || 0}</span>
                  <span className="stat-badge medium">⚠️ {userStats.mediumRisk || 0}</span>
                  <span className="stat-badge low">✅ {userStats.lowRisk || 0}</span>
                </div>
                <div className="user-date">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="no-data">No users registered yet</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
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
          background: rgba(139, 92, 246, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #8b5cf6;
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
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          font-size: 24px;
        }

        .admin-info h1 {
          margin: 0;
          font-size: 1.8rem;
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-subtitle {
          margin: 0.5rem 0;
          opacity: 0.8;
        }

        .admin-age {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-profile, .btn-lessons, .btn-quiz, .btn-scan, .btn-logout {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-profile {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          color: white;
        }

        .btn-lessons {
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
        }

        .btn-quiz {
          background: linear-gradient(45deg, #f59e0b, #d97706);
          color: white;
        }

        .btn-scan {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .btn-logout {
          background: linear-gradient(45deg, #dc2626, #b91c1c);
          color: white;
        }

        .btn-profile:hover, .btn-lessons:hover, .btn-quiz:hover, .btn-scan:hover, .btn-logout:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .reports-section, .quiz-results-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.2);
          margin-bottom: 2rem;
        }

        .chart-title, .section-title {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          color: #8b5cf6;
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .report-item {
          display: grid;
          grid-template-columns: 150px 2fr 100px 120px;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border-left: 4px solid #8b5cf6;
        }

        .report-user {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .report-url {
          font-family: monospace;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .report-risk {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .risk-high { background: #dc2626; }
        .risk-medium { background: #f59e0b; }
        .risk-low { background: #10b981; }

        .quiz-results-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quiz-result-item {
          display: grid;
          grid-template-columns: 150px 2fr 120px 120px;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border-left: 4px solid #8b5cf6;
        }

        .result-user {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .result-quiz {
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .score-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .score-badge.excellent {
          background: #10b981;
          color: white;
        }

        .score-badge.good {
          background: #f59e0b;
          color: white;
        }

        .score-badge.needs-improvement {
          background: #dc2626;
          color: white;
        }

        .result-date {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .users-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.2);
          margin-top: 2rem;
        }

        .users-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .user-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border-left: 4px solid #10b981;
          gap: 1rem;
        }

        .user-info {
          flex: 1;
        }

        .user-stats {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .stat-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(139, 92, 246, 0.3);
        }

        .stat-badge.high {
          background: rgba(220, 38, 38, 0.3);
          color: #fca5a5;
        }

        .stat-badge.medium {
          background: rgba(245, 158, 11, 0.3);
          color: #fcd34d;
        }

        .stat-badge.low {
          background: rgba(16, 185, 129, 0.3);
          color: #86efac;
        }

        .user-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .user-email {
          font-size: 0.9rem;
          opacity: 0.7;
          font-family: monospace;
        }

        .user-date {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
          font-style: italic;
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
          .charts-section {
            grid-template-columns: 1fr;
          }
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }
          .report-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-content">
        <h4 className="stat-title">{title}</h4>
        <h2 className="stat-value">{value}</h2>
      </div>
      <style jsx>{`
        .stat-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
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