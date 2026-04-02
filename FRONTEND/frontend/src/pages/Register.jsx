import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="register-page">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="register-container">
        <div className="register-card">
          <div className="card-header">
            <div className="logo-container">
              <div className="logo-icon">🛡️</div>
              <div className="logo-pulse"></div>
            </div>
            <h1 className="app-title">Join Anti-Phishing</h1>
            <p className="app-subtitle">Create your account to start protecting yourself online</p>
          </div>

          <form onSubmit={submit} className="register-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={form.name}
                onChange={e => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email address"
                value={form.email}
                onChange={e => handleInputChange('email', e.target.value)}
                required
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
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              <div className="password-strength">
                <div className={`strength-bar ${form.password.length >= 6 ? 'strong' : form.password.length >= 3 ? 'medium' : 'weak'}`}></div>
                <span className="strength-text">
                  {form.password.length >= 6 ? 'Strong' : form.password.length >= 3 ? 'Medium' : 'Weak'}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔐</span>
                Confirm Password
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input password-input"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {form.confirmPassword && (
                <div className={`password-match ${form.password === form.confirmPassword ? 'match' : 'no-match'}`}>
                  {form.password === form.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎭</span>
                Account Type
              </label>
              <div className="role-selector">
                <div 
                  className={`role-option ${form.role === 'user' ? 'active' : ''}`}
                  onClick={() => handleInputChange('role', 'user')}
                >
                  <div className="role-icon">👤</div>
                  <div className="role-text">
                    <div className="role-title">User Account</div>
                    <div className="role-desc">Scan URLs & Report Threats</div>
                  </div>
                </div>
                <div 
                  className={`role-option ${form.role === 'admin' ? 'active' : ''}`}
                  onClick={() => handleInputChange('role', 'admin')}
                >
                  <div className="role-icon">👨‍💼</div>
                  <div className="role-text">
                    <div className="role-title">Administrator</div>
                    <div className="role-desc">Requires approval from super admin</div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`register-button ${form.role === 'admin' ? 'admin-style' : 'user-style'}`}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Create {form.role === 'admin' ? 'Admin' : 'User'} Account
                </>
              )}
            </button>

            <div className="form-footer">
              <Link to="/" className="login-link">
                Already have an account? <strong>Sign In</strong>
              </Link>
            </div>
          </form>
        </div>

        <div className="benefits-section">
          <h3 className="benefits-title">🌟 What You'll Get</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon">🔍</div>
              <div className="benefit-text">
                <h4>Advanced URL Scanning</h4>
                <p>AI-powered threat detection with real-time analysis</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📊</div>
              <div className="benefit-text">
                <h4>Detailed Reports</h4>
                <p>Comprehensive security analytics and insights</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🛡️</div>
              <div className="benefit-text">
                <h4>24/7 Protection</h4>
                <p>Continuous monitoring and threat prevention</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🌐</div>
              <div className="benefit-text">
                <h4>Community Support</h4>
                <p>Join thousands of users fighting cyber threats</p>
              </div>
            </div>
          </div>

          <div className="security-badges">
            <div className="badge">🔒 SSL Encrypted</div>
            <div className="badge">🛡️ GDPR Compliant</div>
            <div className="badge">⚡ 99.9% Uptime</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #10b981 75%, #059669 100%);
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
          background: linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
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

        .register-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          width: 100%;
          z-index: 1;
        }

        .register-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInLeft 0.8s ease-out;
          max-height: 90vh;
          overflow-y: auto;
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
          font-size: 3rem;
          position: relative;
          z-index: 2;
        }

        .logo-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #10b981, #059669);
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
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(45deg, #10b981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
        }

        .register-form {
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
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

        .password-strength {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .strength-bar {
          height: 4px;
          width: 100px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-bar.weak { background: #dc2626; }
        .strength-bar.medium { background: #f59e0b; }
        .strength-bar.strong { background: #10b981; }

        .strength-text {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .password-match {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .password-match.match { color: #10b981; }
        .password-match.no-match { color: #dc2626; }

        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
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
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .role-option.active {
          border-color: #10b981;
          background: linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
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

        .register-button {
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
          background: linear-gradient(45deg, #10b981, #059669);
        }

        .admin-style {
          background: linear-gradient(45deg, #8b5cf6, #7c3aed);
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .register-button:disabled {
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

        .form-footer {
          text-align: center;
          margin-top: 1rem;
        }

        .login-link {
          color: #10b981;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .login-link:hover {
          color: #059669;
        }

        .benefits-section {
          color: white;
          animation: slideInRight 0.8s ease-out;
        }

        .benefits-title {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .benefit-item {
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

        .benefit-item:hover {
          transform: translateY(-4px);
        }

        .benefit-icon {
          font-size: 2rem;
        }

        .benefit-text h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }

        .benefit-text p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .security-badges {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.3);
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
          .register-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .register-card {
            padding: 2rem;
          }
          .role-selector {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}