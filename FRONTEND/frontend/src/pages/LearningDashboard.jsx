import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function LearningDashboard() {
  const nav = useNavigate();
  const [results, setResults] = useState([]);
  const [scans, setScans] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/results/all").catch(() => ({ data: [] })),
      api.get("/phish/all").catch(() => ({ data: [] }))
    ]).then(([resData, scanData]) => {
      setResults(Array.isArray(resData.data) ? resData.data : []);
      setScans(Array.isArray(scanData.data) ? scanData.data : []);
      setLoading(false);
    });
  }, []);

  const totalQuizzes = results.length;
  const passed = results.filter(r => r.passed).length;
  const avgScore = totalQuizzes > 0 ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / totalQuizzes) : 0;
  const totalScans = scans.length;

  const chartData = results.slice(0, 10).reverse().map((r, i) => ({
    name: `Q${i + 1}`,
    score: Math.round(r.percentage || 0)
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, background: 'linear-gradient(45deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 My Learning Dashboard</h1>
        <button onClick={() => nav("/home")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back to Home</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { icon: '📝', label: 'Quizzes Taken', value: totalQuizzes, color: '#3b82f6' },
          { icon: '✅', label: 'Quizzes Passed', value: passed, color: '#10b981' },
          { icon: '🎯', label: 'Average Score', value: `${avgScore}%`, color: '#8b5cf6' },
          { icon: '🔍', label: 'URLs Scanned', value: totalScans, color: '#f59e0b' }
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '16px', border: `1px solid rgba(59,130,246,0.2)`, borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{s.icon}</span>
            <div>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{s.label}</p>
              <h2 style={{ margin: 0, color: s.color, fontSize: '2rem' }}>{s.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#3b82f6' }}>📈 Quiz Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quiz Results */}
      <div style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#3b82f6' }}>📝 Quiz History</h3>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
            <p>No quizzes taken yet.</p>
            <button onClick={() => nav('/quiz')} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginTop: '1rem' }}>Take a Quiz →</button>
          </div>
        ) : results.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', borderLeft: `4px solid ${r.passed ? '#10b981' : '#dc2626'}`, marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.quizTitle}</div>
              <div style={{ opacity: 0.6, fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: r.passed ? '#10b981' : '#dc2626', fontSize: '1.2rem' }}>{Math.round(r.percentage)}%</span>
              <span style={{ background: r.passed ? 'rgba(16,185,129,0.2)' : 'rgba(220,38,38,0.2)', color: r.passed ? '#10b981' : '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>{r.passed ? '✅ PASSED' : '❌ FAILED'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
        <button onClick={() => nav('/lessons')} style={{ padding: '1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#7c3aed)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>📚 Study Lessons</button>
        <button onClick={() => nav('/quiz')} style={{ padding: '1.5rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>📝 Take Quiz</button>
        <button onClick={() => nav('/scan')} style={{ padding: '1.5rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>🔍 Scan URL</button>
        <button onClick={() => nav('/scan-history')} style={{ padding: '1.5rem', background: 'linear-gradient(45deg,#f59e0b,#d97706)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>📋 Scan History</button>
      </div>
    </div>
  );
}
