import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ScanHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const role = localStorage.getItem("role");

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    let data = history;
    if (filter !== "ALL") data = data.filter(h => h.risk === filter);
    if (search) data = data.filter(h => h.url.toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [search, filter, history]);

  const loadHistory = async () => {
    try {
      const res = await api.get("/phish/all");
      setHistory(res.data);
      setFiltered(res.data);
    } catch (e) { console.log(e); }
  };

  const getRiskColor = (risk) => risk === 'HIGH' ? '#dc2626' : risk === 'MEDIUM' ? '#f59e0b' : '#10b981';
  const getRiskIcon = (risk) => risk === 'HIGH' ? '🚨' : risk === 'MEDIUM' ? '⚠️' : '✅';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(role === 'admin' ? '/admin' : '/home')}
          style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📋 Scan History
        </h1>
        <span style={{ background: 'rgba(139,92,246,0.3)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.9rem' }}>
          {filtered.length} records
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search URL..."
          style={{ flex: 1, minWidth: '200px', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(31,41,55,0.8)', color: 'white', fontSize: '1rem' }} />
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
              background: filter === f ? (f === 'HIGH' ? '#dc2626' : f === 'MEDIUM' ? '#f59e0b' : f === 'LOW' ? '#10b981' : '#8b5cf6') : 'rgba(31,41,55,0.8)',
              color: 'white' }}>
            {f === 'ALL' ? '📋 All' : `${getRiskIcon(f)} ${f}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(31,41,55,0.8)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.2)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(139,92,246,0.2)' }}>
                {['#', 'URL', 'Risk', 'Score', 'User', 'Date'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#a78bfa', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>No scan history found</td></tr>
              ) : filtered.map((item, i) => (
                <tr key={item._id} style={{ borderTop: '1px solid rgba(139,92,246,0.1)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', opacity: 0.6 }}>{i + 1}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: getRiskColor(item.risk), color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {getRiskIcon(item.risk)} {item.risk}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: getRiskColor(item.risk), fontWeight: 700 }}>{item.score}/100</td>
                  <td style={{ padding: '1rem', opacity: 0.8 }}>{item.userName || '-'}</td>
                  <td style={{ padding: '1rem', opacity: 0.7, whiteSpace: 'nowrap' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
