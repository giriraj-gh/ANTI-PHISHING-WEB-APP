import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PhoneChecker() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const checkPhone = () => {
    if (!phone.trim()) {
      alert("Please enter a phone number");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      const phonePattern = /^[+]?[0-9]{10,15}$/;
      const isValidFormat = phonePattern.test(cleanPhone);
      
      const scamPatterns = [
        /^0{5,}/,
        /^1{5,}/,
        /^(123456|111111|000000|999999|555555)/,
        /^(\d)\1{9,}/,
      ];
      
      const scamPrefixes = ['1800', '1888', '1900', '1976', '+234', '+233', '+254', '0000', '1111', '9999'];
      const hasScamPattern = scamPatterns.some(pattern => pattern.test(cleanPhone));
      const hasScamPrefix = scamPrefixes.some(prefix => cleanPhone.startsWith(prefix));
      
      const countryCode = cleanPhone.startsWith('+') ? cleanPhone.substring(0, 3) : 
                         cleanPhone.length > 10 ? cleanPhone.substring(0, cleanPhone.length - 10) : '';
      
      const validCountryCodes = ['+1', '+44', '+91', '+86', '+81', '+49', '+33', '+39', '+61', '+55'];
      const hasValidCountryCode = validCountryCodes.some(code => cleanPhone.startsWith(code));
      
      const isRobocall = /^(1800|1888|1877|1866|1855|1844)/.test(cleanPhone);
      const isTelemarketer = /^(800|888|877|866|855|844)/.test(cleanPhone);
      
      let status, risk, score, confidence, type, callType;
      
      if (!isValidFormat) {
        status = "INVALID";
        risk = "HIGH";
        score = 100;
        confidence = 95;
        type = "Invalid Format";
        callType = "Cannot Determine";
      } else if (hasScamPattern || hasScamPrefix) {
        status = "SCAM";
        risk = "HIGH";
        score = 95;
        confidence = 90;
        type = "Potential Scam";
        callType = "Fraudulent Call";
      } else if (isRobocall) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 70;
        confidence = 75;
        type = "Robocall";
        callType = "Automated Call";
      } else if (isTelemarketer) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 60;
        confidence = 70;
        type = "Telemarketer";
        callType = "Marketing Call";
      } else if (cleanPhone.length < 10) {
        status = "INVALID";
        risk = "HIGH";
        score = 95;
        confidence = 90;
        type = "Too Short";
        callType = "Invalid Number";
      } else if (cleanPhone.length > 15) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 60;
        confidence = 70;
        type = "Too Long";
        callType = "Unusual Format";
      } else if (!hasValidCountryCode && cleanPhone.startsWith('+')) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 50;
        confidence = 65;
        type = "Unknown Country";
        callType = "International Call";
      } else {
        status = "ORIGINAL";
        risk = "LOW";
        score = 10;
        confidence = 80;
        type = "Appears Legitimate";
        callType = "Regular Call";
      }

      setResult({ 
        phone: cleanPhone, 
        originalPhone: phone,
        status, 
        risk, 
        score, 
        confidence, 
        type,
        callType,
        countryCode: countryCode || 'Not specified',
        length: cleanPhone.length
      });
      setLoading(false);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const history = JSON.parse(localStorage.getItem('phoneCheckHistory') || '[]');
      history.push({
        _id: Date.now().toString(),
        phone: cleanPhone,
        status,
        risk,
        score,
        callType,
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('phoneCheckHistory', JSON.stringify(history));
    }, 1500);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "HIGH": return "#dc2626";
      case "MEDIUM": return "#f59e0b";
      case "LOW": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ORIGINAL": return "✅";
      case "SCAM": return "🚨";
      case "SUSPICIOUS": return "⚠️";
      case "INVALID": return "🚫";
      default: return "❓";
    }
  };

  return (
    <div className={`checker-container ${isAdmin ? 'admin-theme' : 'user-theme'}`}>
      <div className="checker-header">
        <button onClick={() => nav(isAdmin ? "/admin" : "/home")} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1 className="checker-title">📱 Phone Number Checker</h1>
      </div>

      <div className="checker-card">
        <div className="checker-intro">
          <h2>🔍 Scam & Spam Call Detector</h2>
          <p>Check if a phone number is legitimate, scam, or spam call</p>
        </div>

        <div className="input-section">
          <div className="input-group">
            <div className="input-icon">📱</div>
            <input
              type="text"
              className="checker-input"
              placeholder="Enter phone number (e.g., +1234567890 or 1234567890)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && checkPhone()}
            />
            <button onClick={checkPhone} disabled={loading} className="check-button">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Checking...
                </>
              ) : (
                <>🔍 Check Number</>
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <div className="result-card" style={{ borderColor: getRiskColor(result.risk) }}>
              <div className="result-header">
                <div className="status-indicator" style={{ backgroundColor: getRiskColor(result.risk) }}>
                  <span className="status-icon">{getStatusIcon(result.status)}</span>
                  <span className="status-text">{result.status}</span>
                </div>
                <div className="score-display">
                  <span className="score-label">Risk Score</span>
                  <span className="score-value" style={{ color: getRiskColor(result.risk) }}>
                    {result.score}/100
                  </span>
                </div>
              </div>

              <div className="phone-display">
                <strong>Checked Number:</strong>
                <div className="checked-phone">{result.originalPhone}</div>
                <div className="cleaned-phone">Cleaned: {result.phone}</div>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-icon">📞</span>
                  <span>Call Type: {result.callType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌍</span>
                  <span>Country: {result.countryCode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📏</span>
                  <span>Length: {result.length} digits</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📊</span>
                  <span>Confidence: {result.confidence}%</span>
                </div>
              </div>

              <div className="recommendations">
                <h4>💡 Analysis:</h4>
                {result.status === "ORIGINAL" && (
                  <ul className="rec-list low-risk">
                    <li>✅ Phone number appears legitimate</li>
                    <li>✅ No scam patterns detected</li>
                    <li>✅ Safe to answer this call</li>
                    <li>🔒 Regular phone number format</li>
                  </ul>
                )}
                {result.status === "SCAM" && (
                  <ul className="rec-list high-risk">
                    <li>🚨 HIGH RISK - Potential scam call</li>
                    <li>❌ Do NOT answer or return this call</li>
                    <li>🚫 Do NOT share personal information</li>
                    <li>📱 Block this number immediately</li>
                    <li>⚠️ Report to authorities if contacted</li>
                  </ul>
                )}
                {result.status === "SUSPICIOUS" && (
                  <ul className="rec-list medium-risk">
                    <li>⚠️ {result.callType} detected</li>
                    <li>🔍 Exercise caution when answering</li>
                    <li>📱 May be spam or marketing call</li>
                    <li>🚫 Consider blocking if unwanted</li>
                    <li>✉️ Verify caller identity before sharing info</li>
                  </ul>
                )}
                {result.status === "INVALID" && (
                  <ul className="rec-list high-risk">
                    <li>🚫 Invalid phone number format</li>
                    <li>❌ Cannot be a real phone number</li>
                    <li>⚠️ Check for typos and try again</li>
                    <li>🔄 Verify the number source</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3 className="info-title">🛡️ Scam Call Protection Tips</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🚨</div>
            <h4>Scam Indicators</h4>
            <p>Repeated digits, toll-free numbers, unknown country codes</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📞</div>
            <h4>Robocalls</h4>
            <p>Automated calls from 1-800, 1-888, 1-877 numbers</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔒</div>
            <h4>Never Share</h4>
            <p>Don't give personal info, passwords, or OTPs over phone</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🚫</div>
            <h4>Block & Report</h4>
            <p>Block suspicious numbers and report to authorities</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checker-container {
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

        .checker-header {
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
          color: white;
        }

        .user-theme .back-btn {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        }

        .admin-theme .back-btn {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }

        .checker-title {
          margin: 0;
          font-size: 2rem;
        }

        .user-theme .checker-title {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-theme .checker-title {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .checker-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .checker-intro {
          text-align: center;
          margin-bottom: 2rem;
        }

        .checker-intro h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
        }

        .checker-intro p {
          margin: 0;
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .input-section {
          margin-bottom: 2rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 12px;
          padding: 0.5rem;
          gap: 1rem;
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        .input-icon {
          font-size: 1.5rem;
          margin-left: 0.5rem;
        }

        .checker-input {
          flex: 1;
          padding: 1rem;
          border: none;
          background: transparent;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .checker-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .check-button {
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
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
        }

        .check-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .check-button:disabled {
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

        .status-indicator {
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

        .phone-display {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }

        .checked-phone {
          font-family: monospace;
          font-size: 1.3rem;
          margin-top: 0.5rem;
          color: #60a5fa;
          font-weight: 600;
        }

        .cleaned-phone {
          font-family: monospace;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          opacity: 0.7;
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

        .info-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .info-title {
          margin: 0 0 1.5rem 0;
          color: #3b82f6;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-card {
          background: rgba(15, 23, 42, 0.5);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-4px);
        }

        .info-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .info-card h4 {
          margin: 0 0 0.5rem 0;
          color: #3b82f6;
        }

        .info-card p {
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
          .checker-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
