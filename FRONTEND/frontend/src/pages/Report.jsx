import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Report() {
  const nav = useNavigate();
  const [form, setForm] = useState({ url: "", description: "", category: "phishing" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    // reports endpoint not needed - removed
  }, []);

  const submit = async () => {
    if (!form.url.trim()) { setMsg('Please enter a URL to report'); return; }
    try {
      setLoading(true); setMsg('');
      await api.post('/phish/report', form);
      setMsg('✅ Report submitted successfully! Thank you for helping keep the internet safe.');
      setForm({ url: '', description: '', category: 'phishing' });
    } catch (e) {
      setMsg('❌ Failed to submit report. Please try again.');
    } finally { setLoading(false); }
  };

  const validateUrl = (url) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`report-container ${isAdmin ? 'admin-theme' : 'user-theme'}`}>
      <div className="report-header">
        <button 
          onClick={() => nav(isAdmin ? "/admin" : "/home")} 
          className="back-btn"
        >
          ← Back to Dashboard
        </button>
        <h1 className="report-title">
          🚨 Report Suspicious URL
        </h1>
      </div>

      <div className="report-card">
        <div className="card-header">
          <h2>🛡️ Help Protect Others</h2>
          <p>Report suspicious websites, phishing attempts, and malicious content to help keep the internet safe for everyone.</p>
        </div>

        <div className="report-form">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🌐</span>
              Suspicious URL *
            </label>
            <input
              type="text"
              className="form-input url-input"
              placeholder="https://suspicious-website.com or paste any malicious link..."
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
            />
            {form.url && !validateUrl(form.url) && (
              <div className="validation-error">
                ⚠️ Please enter a valid URL
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Description (Optional)
            </label>
            <textarea
              className="form-textarea"
              placeholder="Describe what makes this URL suspicious (e.g., fake login page, malware download, phishing email link)..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🏷️</span>
              Threat Category
            </label>
            <select
              className="form-select"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="phishing">Phishing Website</option>
              <option value="malware">Malware Distribution</option>
              <option value="scam">Online Scam</option>
              <option value="fake">Fake Website</option>
              <option value="spam">Spam/Unwanted Content</option>
              <option value="other">Other Suspicious Activity</option>
            </select>
          </div>

          <button 
            onClick={submit} 
            disabled={loading || !form.url.trim() || !validateUrl(form.url)}
            className="submit-btn"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Submitting Report...
              </>
            ) : (
              <>🚨 Submit Report</>
            )}
          </button>

          {msg && (
            <div className={`message ${msg.includes('✅') ? 'success' : 'error'}`}>
              {msg}
            </div>
          )}
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>🔍 What to Report</h3>
          <ul>
            <li>🎯 Fake login pages mimicking legitimate sites</li>
            <li>📧 Suspicious links from emails or messages</li>
            <li>💰 Websites asking for personal/financial information</li>
            <li>🦠 Sites distributing malware or viruses</li>
            <li>🎭 Fake online stores or auction sites</li>
            <li>📱 Tech support scam websites</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>⚡ Why Report?</h3>
          <ul>
            <li>🛡️ Protect other users from falling victim</li>
            <li>📊 Help improve our detection algorithms</li>
            <li>🌐 Contribute to internet security</li>
            <li>👮 Support law enforcement efforts</li>
            <li>💯 Build a safer online community</li>
          </ul>
        </div>
      </div>

 jsx>{`
        .report-container {
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

        .report-header {
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

        .report-title {
          margin: 0;
          font-size: 2rem;
        }

        .user-theme .report-title {
          background: linear-gradient(45deg, #dc2626, #b91c1c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-theme .report-title {
          background: linear-gradient(45deg, #dc2626, #b91c1c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .report-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
        }

        .user-theme .report-card {
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .admin-theme .report-card {
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .card-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          color: #dc2626;
        }

        .card-header p {
          margin: 0;
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .report-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #dc2626;
        }

        .label-icon {
          font-size: 1.2rem;
        }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 1rem;
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.8);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .form-input::placeholder, .form-textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .url-input {
          font-family: monospace;
        }

        .validation-error {
          color: #fca5a5;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(45deg, #dc2626, #b91c1c);
          color: white;
          margin-top: 1rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.3);
        }

        .submit-btn:disabled {
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

        .message {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
        }

        .message.success {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .message.error {
          background: rgba(220, 38, 38, 0.2);
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.3);
        }

        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .info-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .user-theme .info-card {
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .admin-theme .info-card {
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .info-card h3 {
          margin: 0 0 1rem 0;
          color: #dc2626;
        }

        .info-card ul {
          margin: 0;
          padding-left: 1rem;
        }

        .info-card li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .recent-reports {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .user-theme .recent-reports {
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .admin-theme .recent-reports {
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .reports-title {
          margin: 0 0 1rem 0;
          color: #dc2626;
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .report-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 8px;
          border-left: 4px solid #dc2626;
        }

        .report-url {
          flex: 1;
          font-family: monospace;
          font-size: 0.9rem;
          margin-right: 1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .report-category {
          background: rgba(220, 38, 38, 0.2);
          color: #dc2626;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-right: 1rem;
          text-transform: capitalize;
        }

        .report-date {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .info-section {
            grid-template-columns: 1fr;
          }
          .report-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .report-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
