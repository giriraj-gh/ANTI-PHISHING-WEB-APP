import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("guest");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Handle guest access
    if (role === 'guest') {
      navigate("/guest");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-icon">🛡️</div>
              <div className="logo-pulse"></div>
            </div>
            <h1 className="app-title">Anti-Phishing App</h1>
            <p className="app-subtitle">Advanced Threat Detection & Protection Platform</p>
          </div>

          <form onSubmit={submit} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required={role !== 'guest'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input password-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required={role !== 'guest'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎭</span>
                Login As
              </label>
              <div className="role-selector">
                <div 
                  className={`role-option ${role === 'guest' ? 'active' : ''}`}
                  onClick={() => setRole('guest')}
                >
                  <div className="role-icon">👥</div>
                  <div className="role-text">
                    <div className="role-title">Guest</div>
                    <div className="role-desc">Browse & Learn</div>
                  </div>
                </div>
                <div 
                  className={`role-option ${role === 'user' ? 'active' : ''}`}
                  onClick={() => setRole('user')}
                >
                  <div className="role-icon">👤</div>
                  <div className="role-text">
                    <div className="role-title">User</div>
                    <div className="role-desc">Scan & Report URLs</div>
                  </div>
                </div>
                <div 
                  className={`role-option ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  <div className="role-icon">👨💼</div>
                  <div className="role-text">
                    <div className="role-title">Administrator</div>
                    <div className="role-desc">Full System Access</div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`login-button ${role === 'admin' ? 'admin-style' : 'user-style'}`}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Sign In to {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </>
              )}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-button"
              onClick={() => alert("Google OAuth integration coming soon!")}
            >
              <span className="google-icon">🌐</span>
              Continue with Google
            </button>

            <div className="form-footer">
              <Link to="/register" className="register-link">
                Don't have an account? <strong>Sign Up</strong>
              </Link>
              <Link to="/guest" className="guest-link">
                Continue as Guest
              </Link>
            </div>
          </form>
        </div>

        <div className="features-section">
          <h3 className="features-title">🛡️ Why Choose Our Platform?</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div className="feature-text">
                <h4>Advanced Scanning</h4>
                <p>AI-powered URL analysis</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <h4>Real-time Protection</h4>
                <p>Instant threat detection</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h4>Detailed Analytics</h4>
                <p>Comprehensive reports</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <div className="feature-text">
                <h4>Community Driven</h4>
                <p>Collaborative security</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #312e81 75%, #1e1b4b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 100px;
          height: 100px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 80px;
          height: 80px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 120px;
          height: 120px;
          top: 10%;
          right: 30%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          width: 100%;
          z-index: 1;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInLeft 0.8s ease-out;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .logo-icon {
          font-size: 4rem;
          position: relative;
          z-index: 2;
        }

        .logo-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          opacity: 0.2;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
        }

        .app-title {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .error-message {
          background: linear-gradient(45deg, #fef2f2, #fee2e2);
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #fecaca;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .password-input-container {
          position: relative;
        }

        .password-input {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .role-option {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .role-option:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .role-option.active {
          border-color: #3b82f6;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
        }

        .role-icon {
          font-size: 1.5rem;
        }

        .role-title {
          font-weight: 600;
          color: #374151;
        }

        .role-desc {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .login-button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: white;
        }

        .user-style {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        }

        .admin-style {
          background: linear-gradient(45deg, #8b5cf6, #7c3aed);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .divider {
          text-align: center;
          position: relative;
          margin: 1rem 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .google-button {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .google-button:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .register-link, .forgot-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .register-link:hover, .forgot-link:hover {
          color: #1d4ed8;
        }

        .features-section {
          color: white;
          animation: slideInRight 0.8s ease-out;
        }

        .features-title {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .feature-item {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease;
        }

        .feature-item:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 2rem;
        }

        .feature-text h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }

        .feature-text p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .login-card {
            padding: 2rem;
          }
          .role-selector {
            grid-template-columns: 1fr;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
