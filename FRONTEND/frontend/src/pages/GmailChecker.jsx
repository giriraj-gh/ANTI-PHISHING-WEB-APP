import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GmailChecker() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const checkEmail = () => {
    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValidFormat = emailPattern.test(email);
      
      const parts = email.split('@');
      const localPart = parts[0] || '';
      const domain = parts[1]?.toLowerCase() || '';
      
      // Disposable/temporary email domains
      const disposableDomains = [
        'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
        '10minutemail.com', 'throwaway.email', 'fakeinbox.com', 'trashmail.com',
        'yopmail.com', 'maildrop.cc', 'getnada.com', 'temp-mail.io',
        'dispostable.com', 'throwawaymail.com', 'tempinbox.com'
      ];
      
      // Trusted email providers
      const trustedDomains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
        'protonmail.com', 'aol.com', 'mail.com', 'zoho.com', 'gmx.com',
        'live.com', 'msn.com', 'yandex.com', 'inbox.com'
      ];
      
      // Suspicious patterns in local part
      const suspiciousPatterns = [
        /\d{5,}/,                    // 5+ consecutive numbers
        /[._-]{2,}/,                 // Multiple dots/underscores
        /^[0-9]/,                    // Starts with number
        /(temp|fake|test|spam|trash|disposable|throw|dummy)/i,  // Suspicious keywords
        /[^a-zA-Z0-9@._-]/,         // Special characters
        /^(admin|root|noreply|no-reply|info|support)$/i,  // Generic names
        /(.)\1{3,}/                  // Repeated characters (aaaa)
      ];
      
      // Domain validation
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      const isValidDomain = domainPattern.test(domain);
      
      const isDisposable = disposableDomains.some(d => domain.includes(d));
      const isTrusted = trustedDomains.includes(domain);
      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(localPart));
      
      // Check for typosquatting (common misspellings)
      const typoSquatting = [
        'gmai.com', 'gmial.com', 'gmaill.com', 'yahooo.com', 'yaho.com',
        'outlok.com', 'hotmial.com', 'iclod.com'
      ];
      const isTypoSquat = typoSquatting.includes(domain);
      
      // Email length validation
      const isTooShort = localPart.length < 3;
      const isTooLong = email.length > 254;
      
      // Check for role-based emails
      const roleBasedEmails = ['admin', 'info', 'support', 'sales', 'contact', 'help', 'noreply', 'no-reply'];
      const isRoleBased = roleBasedEmails.some(role => localPart.toLowerCase().startsWith(role));
      
      let status, risk, score, confidence, type, emailType;
      
      if (!isValidFormat) {
        status = "INVALID";
        risk = "HIGH";
        score = 100;
        confidence = 95;
        type = "Invalid Format";
        emailType = "Malformed Email";
      } else if (!isValidDomain) {
        status = "INVALID";
        risk = "HIGH";
        score = 98;
        confidence = 93;
        type = "Invalid Domain";
        emailType = "Bad Domain Format";
      } else if (isDisposable) {
        status = "FAKE";
        risk = "HIGH";
        score = 95;
        confidence = 90;
        type = "Disposable Email";
        emailType = "Temporary/Throwaway";
      } else if (isTypoSquat) {
        status = "FAKE";
        risk = "HIGH";
        score = 92;
        confidence = 88;
        type = "Typosquatting";
        emailType = "Misspelled Domain";
      } else if (hasSuspiciousPattern) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 70;
        confidence = 75;
        type = "Suspicious Pattern";
        emailType = "Potentially Fake";
      } else if (isTooShort) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 65;
        confidence = 70;
        type = "Too Short";
        emailType = "Unusual Length";
      } else if (isTooLong) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 60;
        confidence = 68;
        type = "Too Long";
        emailType = "Excessive Length";
      } else if (isRoleBased) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 50;
        confidence = 65;
        type = "Role-Based";
        emailType = "Generic/Business Email";
      } else if (!isTrusted) {
        status = "SUSPICIOUS";
        risk = "MEDIUM";
        score = 45;
        confidence = 60;
        type = "Unknown Provider";
        emailType = "Uncommon Domain";
      } else {
        status = "ORIGINAL";
        risk = "LOW";
        score = 5;
        confidence = 85;
        type = "Legitimate";
        emailType = "Trusted Provider";
      }

      setResult({ 
        email, 
        status, 
        risk, 
        score, 
        confidence, 
        domain,
        localPart,
        type,
        emailType,
        isTrusted,
        isDisposable,
        isRoleBased
      });
      setLoading(false);

      // Store check history
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const history = JSON.parse(localStorage.getItem('emailCheckHistory') || '[]');
      history.push({
        _id: Date.now().toString(),
        email,
        status,
        risk,
        score,
        emailType,
        userId: user.id,
        userName: user.name,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('emailCheckHistory', JSON.stringify(history));
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
      case "FAKE": return "❌";
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
        <h1 className="checker-title">📧 Gmail Checker</h1>
      </div>

      <div className="checker-card">
        <div className="checker-intro">
          <h2>🔍 Advanced Email Verification</h2>
          <p>Comprehensive email validation with spam & disposable email detection</p>
        </div>

        <div className="input-section">
          <div className="input-group">
            <div className="input-icon">📧</div>
            <input
              type="text"
              className="checker-input"
              placeholder="Enter email address (e.g., example@gmail.com)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && checkEmail()}
            />
            <button onClick={checkEmail} disabled={loading} className="check-button">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Checking...
                </>
              ) : (
                <>🔍 Check Email</>
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

              <div className="email-display">
                <strong>Checked Email:</strong>
                <div className="checked-email">{result.email}</div>
              </div>

              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-icon">📧</span>
                  <span>Type: {result.emailType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌐</span>
                  <span>Domain: {result.domain}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👤</span>
                  <span>Username: {result.localPart}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📊</span>
                  <span>Confidence: {result.confidence}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🔒</span>
                  <span>Trusted: {result.isTrusted ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🗑️</span>
                  <span>Disposable: {result.isDisposable ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="recommendations">
                <h4>💡 Detailed Analysis:</h4>
                {result.status === "ORIGINAL" && (
                  <ul className="rec-list low-risk">
                    <li>✅ Email format is valid and correct</li>
                    <li>✅ Uses trusted email provider ({result.domain})</li>
                    <li>✅ No suspicious patterns detected</li>
                    <li>✅ Not a disposable/temporary email</li>
                    <li>🔒 Safe for registration and communication</li>
                  </ul>
                )}
                {result.status === "FAKE" && (
                  <ul className="rec-list high-risk">
                    <li>❌ {result.type} detected</li>
                    <li>🚫 {result.isDisposable ? 'Disposable/temporary email service' : 'Fake email pattern'}</li>
                    <li>⚠️ Not recommended for important accounts</li>
                    <li>🔍 User may be hiding real identity</li>
                    <li>📧 Request alternative email address</li>
                  </ul>
                )}
                {result.status === "SUSPICIOUS" && (
                  <ul className="rec-list medium-risk">
                    <li>⚠️ {result.type} - {result.emailType}</li>
                    <li>🔍 {result.isRoleBased ? 'Generic/role-based email address' : 'Uncommon email pattern'}</li>
                    <li>📧 Requires additional verification</li>
                    <li>✉️ Consider requesting confirmation</li>
                    <li>🔒 Proceed with caution for sensitive operations</li>
                  </ul>
                )}
                {result.status === "INVALID" && (
                  <ul className="rec-list high-risk">
                    <li>🚫 Invalid email format or structure</li>
                    <li>❌ Does not meet email standards (RFC 5322)</li>
                    <li>⚠️ Cannot be used for communication</li>
                    <li>🔄 Check for typos and try again</li>
                    <li>📝 Verify the email source</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3 className="info-title">🛡️ Email Security & Verification Guide</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">✅</div>
            <h4>Valid Format</h4>
            <p>Proper structure with @ symbol, valid domain, and TLD</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🗑️</div>
            <h4>Disposable Emails</h4>
            <p>Temporary emails from services like TempMail, Guerrilla Mail</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🌐</div>
            <h4>Trusted Providers</h4>
            <p>Gmail, Yahoo, Outlook, iCloud, ProtonMail verified</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚠️</div>
            <h4>Red Flags</h4>
            <p>Excessive numbers, special chars, temp/fake keywords</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎭</div>
            <h4>Typosquatting</h4>
            <p>Misspelled domains like gmai.com, yahooo.com</p>
          </div>
          <div className="info-card">
            <div className="info-icon">👔</div>
            <h4>Role-Based</h4>
            <p>Generic emails: admin@, info@, support@, noreply@</p>
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

        .email-display {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px;
        }

        .checked-email {
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
