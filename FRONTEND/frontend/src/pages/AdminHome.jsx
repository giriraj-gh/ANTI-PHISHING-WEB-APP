import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminHome(){
  const nav = useNavigate();
  const [stats, setStats] = useState({ high:0, medium:0, low:0, total:0, users:0 });
  const [recentScans, setRecentScans] = useState([]);
  const [urlCounts, setUrlCounts] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/phish/all");
      const high = res.data.filter(r => r.risk === "HIGH").length;
      const medium = res.data.filter(r => r.risk === "MEDIUM").length;
      const low = res.data.filter(r => r.risk === "LOW").length;
      
      setStats({ high, medium, low, total: res.data.length, users: 0 });
      setRecentScans(res.data.slice(0, 10));
      
      const urlMap = {};
      res.data.forEach(r => {
        urlMap[r.url] = (urlMap[r.url] || 0) + 1;
      });
      const topUrls = Object.entries(urlMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url, count }));
      setUrlCounts(topUrls);
    } catch (e) {
      console.log("Error loading data");
    }
  };

  const chartData = [
    { name: "High", value: stats.high, color: "#dc2626" },
    { name: "Medium", value: stats.medium, color: "#f59e0b" },
    { name: "Low", value: stats.low, color: "#10b981" }
  ];

  const trendData = recentScans.slice(0, 10).reverse().map((r, i) => ({
    name: i + 1,
    value: r.risk === "HIGH" ? 3 : r.risk === "MEDIUM" ? 2 : 1
  }));

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-left">
          <h1 className="admin-title">⚡ Admin Control Center</h1>
          <p className="admin-subtitle">System Monitoring & Analytics</p>
        </div>
        <div className="header-actions">
          <button onClick={() => nav("/profile")} className="btn-admin-profile">Profile</button>
          <button onClick={() => { localStorage.clear(); nav("/"); }} className="btn-admin-logout">Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <AdminStatCard title="Total Threats" value={stats.total} icon="🎯" color="#8b5cf6" />
        <AdminStatCard title="High Risk" value={stats.high} icon="🚨" color="#dc2626" />
        <AdminStatCard title="Medium Risk" value={stats.medium} icon="⚠️" color="#f59e0b" />
        <AdminStatCard title="Low Risk" value={stats.low} icon="✅" color="#10b981" />
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h3 className="chart-title">📊 Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3 className="chart-title">🎯 Risk Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={90}
                label
              >
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3 className="chart-title">📈 Threat Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="data-section">
        <div className="url-counts">
          <h3 className="section-title">🔝 Most Scanned URLs</h3>
          {urlCounts.map((item, i) => (
            <div key={i} className="url-item">
              <div className="url-rank">{i + 1}</div>
              <div className="url-text">{item.url}</div>
              <div className="url-count">{item.count} scans</div>
            </div>
          ))}
          {urlCounts.length === 0 && <div className="no-data">No data available</div>}
        </div>

        <div className="recent-activity">
          <h3 className="section-title">🕒 Recent Activity</h3>
          {recentScans.slice(0, 8).map((scan, i) => (
            <div key={scan._id} className="activity-item">
              <div className="activity-url">{scan.url}</div>
              <div className={`activity-risk risk-${scan.risk.toLowerCase()}`}>
                {scan.risk}
              </div>
            </div>
          ))}
          {recentScans.length === 0 && <div className="no-data">No activity yet</div>}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a002b 0%, #2e1065 50%, #1a002b 100%);
          color: white;
          padding: 2rem;
          animation: fadeIn 0.8s ease-in;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .admin-title {
          margin: 0;
          font-size: 2rem;
          background: linear-gradient(45deg, #8b5cf6, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-subtitle {
          margin: 0.5rem 0 0 0;
          opacity: 0.8;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-admin-profile, .btn-admin-logout {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-admin-profile {
          background: linear-gradient(45deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .btn-admin-logout {
          background: linear-gradient(45deg, #dc2626, #b91c1c);
          color: white;
        }

        .btn-admin-profile:hover, .btn-admin-logout:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-box {
          background: rgba(59, 7, 100, 0.6);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .chart-title, .section-title {
          margin: 0 0 1rem 0;
          color: #a78bfa;
          font-size: 1.1rem;
        }

        .data-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .url-counts, .recent-activity {
          background: rgba(59, 7, 100, 0.6);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .url-item, .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          margin-bottom: 0.75rem;
          border-left: 4px solid #8b5cf6;
          animation: slideIn 0.5s ease-out;
        }

        .url-rank {
          width: 30px;
          height: 30px;
          background: linear-gradient(45deg, #8b5cf6, #7c3aed);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .url-text, .activity-url {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .url-count {
          background: rgba(139, 92, 246, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .activity-risk {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .risk-high { background: #dc2626; }
        .risk-medium { background: #f59e0b; }
        .risk-low { background: #10b981; }

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

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .charts-row, .data-section {
            grid-template-columns: 1fr;
          }
          .admin-header {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

function AdminStatCard({ title, value, icon, color }) {
  return (
    <div className="admin-stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-content">
        <h4 className="stat-title">{title}</h4>
        <h2 className="stat-value">{value}</h2>
      </div>
      <style jsx>{`
        .admin-stat-card {
          background: rgba(59, 7, 100, 0.6);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
          animation: slideUp 0.5s ease-out;
        }
        .admin-stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.3);
        }
        .stat-icon {
          font-size: 2.5rem;
          animation: pulse 2s infinite;
        }
        .stat-title {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }
        .stat-value {
          margin: 0.5rem 0 0 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #fff, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
