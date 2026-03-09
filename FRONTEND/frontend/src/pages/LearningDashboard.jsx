import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const nav = useNavigate();
  const [progress, setProgress] = useState({ lessonsCompleted: 0, quizzesTaken: 0, avgScore: 0 });
  const [results, setResults] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard/progress");
      setProgress(res.data.progress);
      setResults(res.data.results);
      setRecentActivity(res.data.activity);
    } catch (e) {
      console.log("Error loading dashboard");
    }
  };

  const chartData = results.map((r, i) => ({
    name: `Quiz ${i + 1}`,
    score: r.percentage
  }));

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 My Learning Dashboard</h1>
        <button onClick={() => nav("/home")} className="back-btn">← Back to Home</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Lessons Completed</h3>
            <p className="stat-value">{progress.lessonsCompleted}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Quizzes Taken</h3>
            <p className="stat-value">{progress.quizzesTaken}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Average Score</h3>
            <p className="stat-value">{progress.avgScore}%</p>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h2>📈 Quiz Performance Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ background: '#1f2937', border: 'none' }} />
            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="activity-section">
        <h2>🕐 Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <span className="activity-icon">{activity.type === 'lesson' ? '📚' : '📝'}</span>
              <span className="activity-text">{activity.title}</span>
              <span className="activity-date">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .stat-icon {
          font-size: 3rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0.5rem 0 0 0;
          color: #10b981;
        }

        .chart-section, .activity-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
        }

        .activity-icon {
          font-size: 1.5rem;
        }

        .activity-text {
          flex: 1;
        }

        .activity-date {
          opacity: 0.7;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
