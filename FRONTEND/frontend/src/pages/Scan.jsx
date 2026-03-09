import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

export default function Scan() {
  const nav = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    // Get URL from query params if coming from quick scan
    const params = new URLSearchParams(location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam));
    }
    loadHistory();
  }, [location]);

  const loadHistory = async () => {
    try {
      const res = await api.get("/phish/all");
      setHistory(res.data.slice(0, 5));
    } catch (e) {
      console.log("No history found");
    }
  };

  const scan = async () => {
    if (!url.trim()) {
      alert("Please enter a URL to scan");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/phish/check", { url: url.trim() });
      setResult(res.data);
      loadHistory(); // Refresh history
    } catch (e) {
      alert("Error scanning URL. Please try again.");
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "HIGH": return "#dc2626";
      case "MEDIUM": return "#f59e0b";
      case "LOW": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case "HIGH": return "🚨";
      case "MEDIUM": return "⚠️";
      case "LOW": return "✅";
      default: return "❓";
    }
  };

  return (
    <div className={`scan-container ${isAdmin ? 'admin-theme' : 'user-theme'}`}>
      <div className="scan-header">
        <button 
          onClick={() => nav(isAdmin ? "/admin" : "/home")} 
          className="back-btn"
        >
          ← Back to Dashboard
        </button>
        <h1 className="scan-title">
          🔍 {isAdmin ? "Advanced" : "Smart"} URL Scanner
        </h1>
      </div>

      <div className="scanner-card">
        <div className="scanner-header">
          <h2>🛡️ Phishing Detection Engine</h2>
          <p>Enter any URL to check for phishing threats and malicious content</p>
        </div>

        <div className="url-input-section">
          <div className="input-group">
            <div className="input-icon">🌐</div>
            <input
              type="text"
              className="url-input"
              placeholder="https://example.com or paste any suspicious link..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && scan()}
            />
            <button 
              onClick={scan} 
              disabled={loading || !url.trim()}
              className="scan-button"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Scanning...
                </>
              ) : (
                <>🔍 Scan Now</>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <div className="result-card" style={{ borderColor: getRiskColor(result.risk) }}>
              <div className="result-header">
                <div className="risk-indicator" style={{ backgroundColor: getRiskColor(result.risk) }}>
                  <span className="risk-icon">{getRiskIcon(result.risk)}</span>
                  <span className="risk-text">{result.risk} RISK</span>
                </div>
                <div className="score-display">
                  <span className="score-label">Threat Score</span>
                  <span className="score-value" style={{ color: getRiskColor(result.risk) }}>
                    {result.score}/100
                  </span>
                </div>
              </div>

              <div className="url-display">
                <strong>Scanned URL:</strong>
                <div className="scanned-url">{result.url || url}</div>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>Scanned: {new Date().toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🔒</span>
                  <span>SSL Status: {url.startsWith('https://') ? 'Secure' : 'Unsecured'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌍</span>
                  <span>Domain Analysis: Complete</span>
                </div>
              </div>

              <div className="recommendations">
                <h4>🛡️ Security Recommendations:</h4>
                {result.risk === "HIGH" && (
                  <ul className="rec-list high-risk">
                    <li>⛔ Do not visit this website</li>
                    <li>🚫 Do not enter personal information</li>
                    <li>📱 Report this URL to authorities</li>
                    <li>🔄 Run antivirus scan if already visited</li>
                  </ul>
                )}
                {result.risk === "MEDIUM" && (
                  <ul className="rec-list medium-risk">
                    <li>⚠️ Exercise extreme caution</li>
                    <li>🔍 Verify website authenticity</li>
                    <li>🛡️ Use additional security measures</li>
                    <li>📞 Contact official sources to verify</li>
                  </ul>
                )}
                {result.risk === "LOW" && (
                  <ul className="rec-list low-risk">
                    <li>✅ Website appears safe</li>
                    <li>🔒 Still verify HTTPS connection</li>
                    <li>👀 Stay vigilant for suspicious content</li>
                    <li>🔄 Regular security scans recommended</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-section">
          <h3 className="history-title">📋 Recent Scans</h3>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-url">{item.url}</div>
                <div className="history-risk" style={{ color: getRiskColor(item.risk) }}>
                  {getRiskIcon(item.risk)} {item.risk}
                </div>
                <div className="history-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tips-section">
        <h3 className="tips-title">💡 Phishing Detection Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🔍</div>
            <h4>Check Domain Carefully</h4>
            <p>Look for misspellings, extra characters, or suspicious domains</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔒</div>
            <h4>Verify HTTPS</h4>
            <p>Ensure the website uses HTTPS, but remember it's not foolproof</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📧</div>
            <h4>Email Links</h4>
            <p>Be extra cautious with links from emails, especially urgent ones</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🔗</div>
            <h4>Shortened URLs</h4>
            <p>Expand shortened URLs before clicking to see the real destination</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scan-container {
          min-height: 100vh;
          padding: 2rem;
          animation: fadeIn 0.8s ease-in;
        }

        .user-theme {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: white;
        }

        .admin-theme {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
          color: white;
        }

        .scan-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .back-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .user-theme .back-btn {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .admin-theme .back-btn {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          color: white;
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .scan-title {
          margin: 0;
          font-size: 2rem;
        }

        .user-theme .scan-title {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-theme .scan-title {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .scanner-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
        }

        .user-theme .scanner-card {
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .admin-theme .scanner-card {
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .scanner-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .scanner-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
        }

        .scanner-header p {
          margin: 0;
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .url-input-section {
          margin-bottom: 2rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 12px;
          padding: 0.5rem;
          gap: 1rem;
        }

        .user-theme .input-group {
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        .admin-theme .input-group {
          border: 2px solid rgba(139, 92, 246, 0.3);
        }

        .input-icon {
          font-size: 1.5rem;
          margin-left: 0.5rem;
        }

        .url-input {
          flex: 1;
          padding: 1rem;
          border: none;
          background: transparent;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .url-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .scan-button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-theme .scan-button {
          background: linear-gradient(45deg, #10b981, #059669);
        }

        .admin-theme .scan-button {
          background: linear-gradient(45deg, #10b981, #059669);
        }

        .scan-button {
          color: white;
        }

        .scan-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .scan-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .result-section {
          margin-top: 2rem;
        }

        .result-card {
          background: rgba(15, 23, 42, 0.9);
          border-radius: 16px;
          padding: 2rem;
          border-left: 6px solid;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .risk-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 700;
          color: white;
        }

        .score-display {
          text-align: right;
        }

        .score-label {
          display: block;
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 0.25rem;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 700;
        }

        .url-display {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }

        .scanned-url {
          font-family: monospace;
          font-size: 1.1rem;
          margin-top: 0.5rem;
          word-break: break-all;
          color: #60a5fa;
        }

        .result-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }

        .recommendations {
          background: rgba(31, 41, 55, 0.5);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .recommendations h4 {
          margin: 0 0 1rem 0;
          color: #fbbf24;
        }

        .rec-list {
          margin: 0;
          padding-left: 1rem;
        }

        .rec-list li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .high-risk li { color: #fca5a5; }
        .medium-risk li { color: #fcd34d; }
        .low-risk li { color: #86efac; }

        .history-section, .tips-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
        }

        .user-theme .history-section, .user-theme .tips-section {
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .admin-theme .history-section, .admin-theme .tips-section {
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .history-title, .tips-title {
          margin: 0 0 1rem 0;
        }

        .user-theme .history-title, .user-theme .tips-title {
          color: #3b82f6;
        }

        .admin-theme .history-title, .admin-theme .tips-title {
          color: #8b5cf6;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 8px;
        }

        .history-url {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
          margin-right: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .history-risk {
          font-weight: 600;
          margin-right: 1rem;
        }

        .history-date {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .tip-card {
          background: rgba(15, 23, 42, 0.5);
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
        }

        .user-theme .tip-card h4 {
          color: #3b82f6;
        }

        .admin-theme .tip-card h4 {
          color: #8b5cf6;
        }

        .tip-card p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .result-header {
            flex-direction: column;
            gap: 1rem;
          }
          .input-group {
            flex-direction: column;
            align-items: stretch;
          }
          .scan-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
