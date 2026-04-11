import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ScanHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;
  const role = localStorage.getItem("role");

  const loadHistory = useCallback(async (p = 1) => {
    try {
      const res = await api.get(`/phish/all?page=${p}&limit=${LIMIT}`);
      // Handle both paginated and non-paginated response
      if (res.data.logs) {
        setHistory(res.data.logs);
        setFiltered(res.data.logs);
        setTotal(res.data.total);
        setTotalPages(res.data.pages);
      } else {
        setHistory(res.data);
        setFiltered(res.data);
        setTotal(res.data.length);
        setTotalPages(1);
      }
    } catch (e) { console.log(e); }
  }, []);

  useEffect(() => { loadHistory(page); }, [page, loadHistory]);

  useEffect(() => {
    let data = history;
    if (filter === 'HIGH') data = data.filter(h => h.risk === 'HIGH' || h.risk === 'Phishing');
    else if (filter === 'MEDIUM') data = data.filter(h => h.risk === 'MEDIUM' || h.risk === 'Suspicious');
    else if (filter === 'LOW') data = data.filter(h => h.risk === 'LOW' || h.risk === 'Safe');
    if (search) data = data.filter(h => h.url.toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [search, filter, history]);

  const getRiskColor = (risk) => (risk === 'HIGH' || risk === 'Phishing') ? '#dc2626' : (risk === 'MEDIUM' || risk === 'Suspicious') ? '#f59e0b' : '#10b981';
  const getRiskIcon = (risk) => (risk === 'HIGH' || risk === 'Phishing') ? '🚨' : (risk === 'MEDIUM' || risk === 'Suspicious') ? '⚠️' : '✅';
  const getRiskLabel = (risk) => risk === 'Phishing' ? 'HIGH' : risk === 'Suspicious' ? 'MEDIUM' : risk === 'Safe' ? 'LOW' : risk;

  const highCount = history.filter(h => h.risk === 'HIGH' || h.risk === 'Phishing').length;
  const mediumCount = history.filter(h => h.risk === 'MEDIUM' || h.risk === 'Suspicious').length;
  const lowCount = history.filter(h => h.risk === 'LOW' || h.risk === 'Safe').length;

  const exportCSV = () => {
    const headers = ['#', 'URL', 'Risk', 'Score', 'User', 'Date'];
    const rows = filtered.map((item, i) => [
      i + 1,
      `"${item.url}"`,
      getRiskLabel(item.risk),
      item.score,
      item.userName || '-',
      new Date(item.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `scan-history-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

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
          {total} total records
        </span>
        <button onClick={exportCSV}
          style={{ marginLeft: 'auto', padding: '0.6rem 1.25rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
          📥 Export CSV
        </button>
      </div>

      {/* Count Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', count: total, color: '#8b5cf6', icon: '📋', f: 'ALL' },
          { label: 'High Risk', count: highCount, color: '#dc2626', icon: '🚨', f: 'HIGH' },
          { label: 'Medium Risk', count: mediumCount, color: '#f59e0b', icon: '⚠️', f: 'MEDIUM' },
          { label: 'Low Risk', count: lowCount, color: '#10b981', icon: '✅', f: 'LOW' }
        ].map(c => (
          <div key={c.label} onClick={() => setFilter(c.f)}
            style={{ background: 'rgba(31,41,55,0.8)', padding: '1rem', borderRadius: '12px', border: `2px solid ${filter === c.f ? c.color : 'transparent'}`, borderLeft: `4px solid ${c.color}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '1.5rem' }}>{c.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{c.label}</div>
          </div>
        ))}
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
      <div style={{ background: 'rgba(31,41,55,0.8)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.2)', overflow: 'hidden', marginBottom: '1.5rem' }}>
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
                  <td style={{ padding: '1rem', opacity: 0.6 }}>{(page - 1) * LIMIT + i + 1}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: getRiskColor(item.risk), color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {getRiskIcon(item.risk)} {getRiskLabel(item.risk)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '0.5rem 1rem', background: page === 1 ? 'rgba(31,41,55,0.4)' : 'rgba(139,92,246,0.3)', color: 'white', border: 'none', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            ← Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: '0.5rem 0.9rem', background: page === p ? '#8b5cf6' : 'rgba(31,41,55,0.8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '0.5rem 1rem', background: page === totalPages ? 'rgba(31,41,55,0.4)' : 'rgba(139,92,246,0.3)', color: 'white', border: 'none', borderRadius: '8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
