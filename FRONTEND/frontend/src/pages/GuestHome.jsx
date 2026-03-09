import { useNavigate } from "react-router-dom";

export default function GuestHome() {
  const nav = useNavigate();

  return (
    <div className="guest-home">
      <div className="guest-header">
        <div className="logo">🛡️ Anti-Phishing App</div>
        <div className="auth-buttons">
          <button onClick={() => nav("/register")} className="btn-register">Sign Up</button>
          <button onClick={() => nav("/")} className="btn-login">Back to Login</button>
        </div>
      </div>

      <div className="hero-section">
        <h1>🎓 Learn Phishing Detection</h1>
        <p>Start learning for free as a guest. Register for full access!</p>
      </div>

      <div className="guest-features">
        <div className="feature-card" onClick={() => nav("/lessons")}>
          <div className="feature-icon">📚</div>
          <h3>Free Lessons</h3>
          <p>Access beginner lessons on phishing detection</p>
          <span className="badge-free">FREE ACCESS</span>
        </div>

        <div className="feature-card" onClick={() => nav("/quiz")}>
          <div className="feature-icon">📝</div>
          <h3>Demo Quiz</h3>
          <p>Try our phishing basics quiz</p>
          <span className="badge-demo">DEMO</span>
        </div>

        <div className="feature-card locked" onClick={() => nav("/register")}>
          <div className="feature-icon">🔒</div>
          <h3>Full Access</h3>
          <p>Register to unlock all lessons and quizzes</p>
          <span className="badge-locked">REGISTER REQUIRED</span>
        </div>
      </div>

      <div className="benefits-section">
        <h2>✨ Why Register?</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">📚</span>
            <span>Access all lessons</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📝</span>
            <span>Take all quizzes</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📊</span>
            <span>Track your progress</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🏆</span>
            <span>Earn certificates</span>
          </div>
        </div>
        <button onClick={() => nav("/register")} className="cta-button">
          Get Started Free →
        </button>
      </div>

      <style jsx>{`
        .guest-home {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
        }

        .guest-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(10px);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .auth-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn-register, .btn-login {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .btn-register {
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
        }

        .btn-login {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-register:hover, .btn-login:hover {
          transform: translateY(-2px);
        }

        .hero-section {
          text-align: center;
          padding: 4rem 2rem;
        }

        .hero-section h1 {
          font-size: 3rem;
          margin: 0 0 1rem 0;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-section p {
          font-size: 1.2rem;
          opacity: 0.8;
        }

        .guest-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.2);
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
        }

        .feature-card.locked {
          opacity: 0.7;
          border-color: rgba(107, 114, 128, 0.3);
        }

        .feature-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        .feature-card p {
          opacity: 0.8;
          margin-bottom: 1rem;
        }

        .badge-free, .badge-demo, .badge-locked {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 1rem;
        }

        .badge-free {
          background: #10b981;
        }

        .badge-demo {
          background: #f59e0b;
        }

        .badge-locked {
          background: #6b7280;
        }

        .benefits-section {
          background: rgba(31, 41, 55, 0.8);
          padding: 3rem 2rem;
          margin: 2rem;
          border-radius: 20px;
          text-align: center;
        }

        .benefits-section h2 {
          margin: 0 0 2rem 0;
          font-size: 2rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .benefit-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .benefit-icon {
          font-size: 2.5rem;
        }

        .cta-button {
          padding: 1rem 3rem;
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.3);
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 2rem;
          }
          .guest-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
