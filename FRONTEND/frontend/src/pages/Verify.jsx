import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Verify() {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");

  const verifyToken = async (t) => {
    try {
      await api.get(`/auth/verify/${t}`);
      setStatus("✅ Email verified successfully. You can login now.");
    } catch (e) {
      setStatus("❌ Verification failed or token expired.");
    }
  };

  useEffect(() => {
    if (token) verifyToken(token);
  }, [token]);

  return (
    <div style={{ padding: 40 }}>
      <h2>{status}</h2>
    </div>
  );
}
