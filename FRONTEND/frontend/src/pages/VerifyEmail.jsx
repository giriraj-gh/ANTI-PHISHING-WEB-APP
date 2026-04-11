import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function VerifyEmail() {
  const { token } = useParams();
  const nav = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(res => { setStatus("success"); setMsg(res.data.message); })
      .catch(err => { setStatus("error"); setMsg(err.response?.data?.message || "Verification failed."); });
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <div style={{ background: 'rgba(31,41,55,0.9)', padding: '3rem', borderRadius: '20px', textAlign: 'center', maxWidth: 420, width: '90%', border: '1px solid rgba(59,130,246,0.2)' }}>
        {status === 'verifying' && (
          <>
            <div style={{ width: 60, height: 60, border: '5px solid rgba(59,130,246,0.2)', borderTop: '5px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
            <h2>Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Email Verified!</h2>
            <p style={{ opacity: 0.8, marginBottom: '2rem' }}>{msg}</p>
            <button onClick={() => nav('/')} style={{ padding: '0.9rem 2rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              Go to Login →
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Verification Failed</h2>
            <p style={{ opacity: 0.8, marginBottom: '2rem' }}>{msg}</p>
            <button onClick={() => nav('/')} style={{ padding: '0.9rem 2rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
              Back to Login
            </button>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
