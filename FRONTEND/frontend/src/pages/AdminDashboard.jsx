import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ high: 0, medium: 0, low: 0 });
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [selected, setSelected] = useState([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState(0);
  const [adminRequests, setAdminRequests] = useState([]);
  const [loginStats, setLoginStats] = useState({ totalLogins: 0, recentLogins: [], onlineCount: 0 });

  const chartData = [
    { name: 'High Risk', value: stats.high, color: '#dc2626' },
    { name: 'Medium Risk', value: stats.medium, color: '#f59e0b' },
    { name: 'Low Risk', value: stats.low, color: '#10b981' }
  ];

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const [usersRes, pendingRes, statsRes, trendsRes, notifRes, adminReqRes, loginStatsRes] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/pending-users`, { headers }),
        fetch(`${API}/api/admin/stats`, { headers }),
        fetch(`${API}/api/admin/trends`, { headers }),
        fetch(`${API}/api/admin/notifications`, { headers }),
        fetch(`${API}/api/admin/admin-requests`, { headers }),
        fetch(`${API}/api/admin/login-stats`, { headers })
      ]);
      setUsers(await usersRes.json());
      setPendingUsers(await pendingRes.json());
      setStats(await statsRes.json());
      setTrendData(await trendsRes.json());
      setNotifications((await notifRes.json()).pendingCount);
      setAdminRequests(await adminReqRes.json());
      setLoginStats(await loginStatsRes.json());
      const profileRes = await fetch(`${API}/api/auth/profile`, { headers });
      const profileData = await profileRes.json();
      setAdmin(profileData);
      localStorage.setItem('user', JSON.stringify(profileData));
    } catch (e) { console.error(e); }
  };

  const isSuperAdmin = admin?.email === 'giriraja.ec23@bitsathy.ac.in';

  const handleApprove = async (id) => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/approve-user/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchData();
  };

  const handleReject = async (id) => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/reject-user/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchData();
  };

  const handleBulkAction = async (action) => {
    if (selected.length === 0) return alert('Select users first');
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/bulk-action`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ ids: selected, action }) });
    setSelected([]);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/delete-user/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchData();
  };

  const handleAdminRequest = async (id, action) => {
    const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    await fetch(`${API}/api/admin/${action}-admin-request/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  const bg = darkMode ? 'linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)' : 'linear-gradient(135deg,#f0f4ff,#e8eaf6,#f0f4ff)';
  const cardBg = darkMode ? 'rgba(31,41,55,0.8)' : 'rgba(255,255,255,0.9)';
  const textColor = darkMode ? 'white' : '#1f2937';
  const borderColor = darkMode ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.3)';
  const tooltipStyle = darkMode ? { background: '#1f2937', border: 'none', borderRadius: '8px' } : { background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' };

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, padding: '1.5rem', transition: 'all 0.3s' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: cardBg, borderRadius: '16px', border: `1px solid ${borderColor}`, flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '3px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', fontSize: 24 }}>
            {admin?.profilePicture ? <img src={admin.profilePicture} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍💼'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</h1>
            <p style={{ margin: 0, opacity: 0.7 }}>Welcome back, {admin?.name || 'Admin'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '0.6rem 1rem', background: darkMode ? '#f59e0b' : '#1e1b4b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => navigate('/admin/scan-history')} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>📋 History</button>
            {notifications > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{notifications}</span>}
          </div>
          <button onClick={() => navigate('/profile')} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>👤 Profile</button>
          <button onClick={() => navigate('/admin/manage-lessons')} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>📚 Lessons</button>
          <button onClick={() => navigate('/admin/manage-quiz')} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(45deg,#f59e0b,#d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>📝 Quiz</button>
          <button onClick={() => navigate('/scan')} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>🔍 Scan</button>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1rem', background: 'linear-gradient(45deg,#dc2626,#b91c1c)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>🚪 Logout</button>
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          {title:'High Risk',value:stats.high,icon:'🚨',color:'#dc2626'},
          {title:'Medium Risk',value:stats.medium,icon:'⚡',color:'#f59e0b'},
          {title:'Low Risk',value:stats.low,icon:'✅',color:'#10b981'},
          {title:'Active Users',value:users.length,icon:'👥',color:'#10b981'},
          {title:'Pending',value:notifications,icon:'⏳',color:'#f59e0b'},
          {title:'Online Now',value:loginStats.onlineCount,icon:'🟢',color:'#10b981'},
          {title:'Total Logins',value:loginStats.totalLogins,icon:'🔑',color:'#3b82f6'}
        ].map(s => (
          <div key={s.title} style={{ background: cardBg, padding: '1.5rem', borderRadius: '12px', border: `1px solid ${borderColor}`, borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{s.icon}</span>
            <div><p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{s.title}</p><h2 style={{ margin: 0, color: s.color }}>{s.value}</h2></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}` }}>
          <h3 style={{ margin: '0 0 1rem', color: '#8b5cf6' }}>📊 Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke={darkMode ? '#e5e7eb' : '#374151'} />
              <YAxis stroke={darkMode ? '#e5e7eb' : '#374151'} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}` }}>
          <h3 style={{ margin: '0 0 1rem', color: '#8b5cf6' }}>🥧 Risk Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}:${value}`}>
              {chartData.map((e,i) => <Cell key={i} fill={e.color} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real Trend Chart */}
      <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}`, marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#8b5cf6' }}>📈 Threat Trends (Last 7 Days - Real Data)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <XAxis dataKey="day" stroke={darkMode ? '#e5e7eb' : '#374151'} />
            <YAxis stroke={darkMode ? '#e5e7eb' : '#374151'} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="threats" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Admin Role Requests - Super Admin Only */}
      {isSuperAdmin && adminRequests.length > 0 && (
        <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `2px solid #8b5cf6`, marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#8b5cf6' }}>👑 Admin Role Requests ({adminRequests.length})</h3>
          {adminRequests.map(user => (
            <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', borderLeft: '4px solid #8b5cf6', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>👤 {user.name}</div>
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{user.email}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => handleAdminRequest(user._id, 'approve')} style={{ padding: '0.5rem 1.25rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>✅ Approve Admin</button>
                <button onClick={() => handleAdminRequest(user._id, 'reject')} style={{ padding: '0.5rem 1.25rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Users with Bulk Actions - Super Admin Only */}
      {isSuperAdmin && (
      <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}`, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, color: '#f59e0b' }}>⏳ Pending Approval ({pendingUsers.length})</h3>
          {selected.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ opacity: 0.7, alignSelf: 'center' }}>{selected.length} selected</span>
              <button onClick={() => handleBulkAction('approve')} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>✅ Bulk Approve</button>
              <button onClick={() => handleBulkAction('reject')} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>❌ Bulk Reject</button>
            </div>
          )}
        </div>
        {pendingUsers.length === 0 ? <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>No pending requests</p> :
          pendingUsers.map(user => (
            <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" checked={selected.includes(user._id)} onChange={e => setSelected(e.target.checked ? [...selected, user._id] : selected.filter(id => id !== user._id))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>👤 {user.name}</div>
                  <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{user.email} • {user.role}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => handleApprove(user._id)} style={{ padding: '0.5rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>✅ Approve</button>
                <button onClick={() => handleReject(user._id)} style={{ padding: '0.5rem 1.25rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>❌ Reject</button>
              </div>
            </div>
          ))
        }
      </div>

      )}

      {/* User Search History */}
      <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}`, marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#8b5cf6' }}>🔍 User URL Search History</h3>
        <UserSearchHistory API={process.env.REACT_APP_API_URL || 'http://localhost:5000'} token={localStorage.getItem('token')} cardBg={cardBg} borderColor={borderColor} darkMode={darkMode} />
      </div>

      {/* Login History */}
      <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}`, marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#3b82f6' }}>🔑 Recent Login History</h3>
        {loginStats.recentLogins?.length === 0 ? <p style={{ opacity: 0.6, textAlign: 'center', padding: '1rem' }}>No logins yet</p> :
          loginStats.recentLogins?.map(user => (
            <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>👤 {user.name}</div>
                <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>{user.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>Last Login: {new Date(user.lastLogin).toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Total Logins: {user.loginCount}</div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Users List with Delete */}
      <div style={{ background: cardBg, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${borderColor}` }}>
        <h3 style={{ margin: '0 0 1rem', color: '#8b5cf6' }}>👥 Registered Users</h3>
        {users.length === 0 ? <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>No users yet</p> :
          users.map(user => (
            <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', borderLeft: '4px solid #10b981', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600 }}>👤 {user.name}</div>
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{user.email}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Joined: {new Date(user.createdAt).toLocaleDateString()} • Status: <span style={{ color: user.status === 'approved' ? '#10b981' : '#f59e0b' }}>{user.status}</span></div>
              </div>
              <button onClick={() => handleDelete(user._id)} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>🗑️ Delete</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

function UserSearchHistory({ API, token }) {
  const [scans, setScans] = React.useState([]);
  const getRiskColor = (risk) => risk === 'HIGH' ? '#dc2626' : risk === 'MEDIUM' ? '#f59e0b' : '#10b981';
  const getRiskIcon = (risk) => risk === 'HIGH' ? '🚨' : risk === 'MEDIUM' ? '⚠️' : '✅';
  React.useEffect(() => {
    fetch(`${API}/api/phish/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setScans(Array.isArray(data) ? data.slice(0, 20) : [])).catch(() => {});
  }, [API, token]);
  if (scans.length === 0) return <p style={{ opacity: 0.6, textAlign: 'center', padding: '1rem' }}>No search history yet</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.2)' }}>
            {['User', 'URL Searched', 'Risk', 'Score', 'Date'].map(h => (
              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#a78bfa', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((s, i) => (
            <tr key={i} style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>👤 {s.userName || 'Unknown'}</td>
              <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</td>
              <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: getRiskColor(s.risk), color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{getRiskIcon(s.risk)} {s.risk}</span></td>
              <td style={{ padding: '0.75rem 1rem', color: getRiskColor(s.risk), fontWeight: 700 }}>{s.score}/100</td>
              <td style={{ padding: '0.75rem 1rem', opacity: 0.7, whiteSpace: 'nowrap' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}