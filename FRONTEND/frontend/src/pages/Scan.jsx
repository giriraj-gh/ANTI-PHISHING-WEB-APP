import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

export default function Scan() {
  const nav = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlParam = params.get('url');
    if (urlParam) setUrl(decodeURIComponent(urlParam));
    loadHistory();
  }, [location]);

  const loadHistory = async () => {
    try {
      const res = await api.get("/phish/all");
      setHistory(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (e) {}
  };

  const scan = async () => {
    if (!url.trim()) { setError("Please enter a URL to scan"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.post('/phish/scan', { url: url.trim(), userName: user.name, userEmail: user.email });
      setResult(res.data);
      loadHistory();
    } catch (e) {
      setError(e.response?.data?.message || 'Error scanning URL. Please try again.');
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    if (risk === 'Phishing' || risk === 'HIGH') return '#dc2626';
    if (risk === 'Suspicious' || risk === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const getRiskBg = (risk) => {
    if (risk === 'Phishing' || risk === 'HIGH') return 'rgba(220,38,38,0.15)';
    if (risk === 'Suspicious' || risk === 'MEDIUM') return 'rgba(245,158,11,0.15)';
    return 'rgba(16,185,129,0.15)';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'Phishing' || risk === 'HIGH') return '🚨';
    if (risk === 'Suspicious' || risk === 'MEDIUM') return '⚠️';
    return '✅';
  };

  const displayRisk = (risk) => {
    if (risk === 'HIGH') return 'Phishing';
    if (risk === 'MEDIUM') return 'Suspicious';
    if (risk === 'LOW') return 'Safe';
    return risk;
  };

  const getScoreColor = (score) => score >= 70 ? '#dc2626' : score >= 35 ? '#f59e0b' : '#10b981';

  return (
    <div style={{ minHeight: '100vh', background: isAdmin ? 'linear-gradient(135deg,#1e1b4b,#312e81)' : 'linear-gradient(135deg,#0f172a,#1e293b)', color: 'white', padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => nav(isAdmin ? "/admin" : "/home")}
          style={{ padding: '0.75rem 1.5rem', background: isAdmin ? 'linear-gradient(45deg,#8b5cf6,#a855f7)' : 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', background: 'linear-gradient(45deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🔍 Real-Time Phishing Detection
          </h1>
          <p style={{ margin: '0.25rem 0 0', opacity: 0.6, fontSize: '0.9rem' }}>
            Powered by Google Safe Browsing + PhishTank + Heuristic Analysis
          </p>
        </div>
      </div>

      {/* Scanner Input */}
      <div style={{ background: 'rgba(31,41,55,0.9)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem' }}>🛡️ Enter URL to Scan</h2>
        <p style={{ margin: '0 0 1.5rem', opacity: 0.6, fontSize: '0.9rem' }}>Paste any suspicious link to check for phishing threats</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🌐</span>
            <input type="text" placeholder="https://example.com or paste any suspicious link..."
              value={url} onChange={e => { setUrl(e.target.value); setError(''); }}
              onKeyPress={e => e.key === 'Enter' && scan()}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '2px solid rgba(59,130,246,0.3)', borderRadius: '12px', background: 'rgba(15,23,42,0.8)', color: 'white', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <button onClick={scan} disabled={loading || !url.trim()}
            style={{ padding: '1rem 2rem', background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
            {loading ? <><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Scanning...</> : '🔍 Scan Now'}
          </button>
        </div>
        {error && <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', borderRadius: '8px', color: '#fca5a5', fontWeight: 600 }}>⚠️ {error}</div>}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ background: 'rgba(31,41,55,0.9)', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, border: '5px solid rgba(59,130,246,0.2)', borderTop: '5px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>Analyzing URL...</h3>
          <p style={{ opacity: 0.6, margin: '0 0 1.5rem' }}>Checking multiple threat intelligence sources</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {['🔍 Google Safe Browsing', '🎣 PhishTank', '🧠 Heuristic Analysis'].map(s => (
              <span key={s} style={{ background: 'rgba(59,130,246,0.2)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ background: 'rgba(31,41,55,0.9)', padding: '2rem', borderRadius: '20px', border: `2px solid ${getRiskColor(result.risk)}`, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>{getRiskIcon(result.risk)}</span>
              <div>
                <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.25rem' }}>Risk Level</div>
                <span style={{ background: getRiskBg(result.risk), color: getRiskColor(result.risk), padding: '0.5rem 1.5rem', borderRadius: '25px', fontWeight: 700, fontSize: '1.3rem', border: `2px solid ${getRiskColor(result.risk)}` }}>
                  {displayRisk(result.risk)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.25rem' }}>Threat Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: getScoreColor(result.score) }}>{result.score}<span style={{ fontSize: '1rem', opacity: 0.6 }}>/100</span></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
              <span>0 - Safe</span><span>35 - Suspicious</span><span>70 - Phishing</span>
            </div>
            <div style={{ height: 14, background: 'rgba(255,255,255,0.1)', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${result.score}%`, background: `linear-gradient(90deg,#10b981,${getScoreColor(result.score)})`, borderRadius: 7, transition: 'width 1.2s ease' }} />
            </div>
          </div>

          {/* URL */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.25rem' }}>Scanned URL</div>
            <div style={{ fontFamily: 'monospace', color: '#60a5fa', wordBreak: 'break-all', fontSize: '0.95rem' }}>{result.url}</div>
          </div>

          {/* Message */}
          <div style={{ padding: '1rem 1.25rem', background: getRiskBg(result.risk), border: `1px solid ${getRiskColor(result.risk)}`, borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600, color: getRiskColor(result.risk), fontSize: '1rem' }}>
            {result.message}
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.75rem', fontWeight: 600 }}>🔎 Detected By:</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {result.sources.map(s => (
                  <span key={s} style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(220,38,38,0.4)' }}>
                    {s === 'Google Safe Browsing' ? '🔍 ' : s === 'PhishTank' ? '🎣 ' : '🧠 '}{s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Heuristic Flags */}
          {result.details && result.details.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.75rem', fontWeight: 600 }}>🧠 Heuristic Flags:</div>
              {result.details.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.4rem' }}>
                  <span style={{ color: '#f59e0b' }}>⚡</span> {d}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#fbbf24' }}>🛡️ Recommendations:</div>
            {(result.risk === 'Phishing' || result.risk === 'HIGH') && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#fca5a5', lineHeight: 2 }}>
                <li>⛔ Do NOT visit this website</li>
                <li>🚫 Do NOT enter any personal information</li>
                <li>📢 Report this URL to authorities</li>
                <li>🔄 Run antivirus scan if already visited</li>
              </ul>
            )}
            {(result.risk === 'Suspicious' || result.risk === 'MEDIUM') && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#fcd34d', lineHeight: 2 }}>
                <li>⚠️ Exercise extreme caution</li>
                <li>🔍 Verify website authenticity independently</li>
                <li>🛡️ Use additional security measures</li>
                <li>📞 Contact official sources to verify</li>
              </ul>
            )}
            {(result.risk === 'Safe' || result.risk === 'LOW') && (
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#86efac', lineHeight: 2 }}>
                <li>✅ Website appears safe to visit</li>
                <li>🔒 Always verify HTTPS connection</li>
                <li>👀 Stay vigilant for suspicious content</li>
                <li>🔄 Regular security scans recommended</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {history.length > 0 && (
        <div style={{ background: 'rgba(31,41,55,0.9)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#3b82f6' }}>📋 Recent Scans</h3>
            <button onClick={() => nav(isAdmin ? '/admin/scan-history' : '/scan-history')}
              style={{ padding: '0.4rem 0.8rem', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
              View All →
            </button>
          </div>
          {history.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>{item.url}</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ background: getRiskBg(item.risk), color: getRiskColor(item.risk), padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {getRiskIcon(item.risk)} {displayRisk(item.risk)}
                </span>
                <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{new Date(item.createdAt || item.scannedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div style={{ background: 'rgba(31,41,55,0.9)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#3b82f6' }}>💡 Phishing Detection Tips</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
          {[
            { icon: '🔍', title: 'Check Domain', desc: 'Look for misspellings and suspicious characters' },
            { icon: '🔒', title: 'Verify HTTPS', desc: 'Ensure the website uses HTTPS encryption' },
            { icon: '📧', title: 'Email Links', desc: 'Be extra cautious with links from emails' },
            { icon: '🔗', title: 'Shortened URLs', desc: 'Expand shortened URLs before clicking' }
          ].map(tip => (
            <div key={tip.title} style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tip.icon}</div>
              <h4 style={{ margin: '0 0 0.25rem', color: '#3b82f6', fontSize: '0.95rem' }}>{tip.title}</h4>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.8rem' }}>{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
