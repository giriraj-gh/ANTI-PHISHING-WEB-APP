import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Profile() {
  const nav = useNavigate();
  const [form, setForm] = useState({ 
    name: "", 
    email: "",
    dob: "", 
    age: "", 
    profilePicture: "",
    bio: ""
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setForm(res.data);
      if (res.data.profilePicture) setImagePreview(res.data.profilePicture);
    } catch (e) {
      console.log("Profile not found");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setForm({ ...form, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const save = async () => {
    setLoading(true);
    try {
      await api.put("/auth/profile", form);
      // Update localStorage with latest data
      const updated = { 
        ...JSON.parse(localStorage.getItem("user") || '{}'), 
        name: form.name, 
        profilePicture: form.profilePicture,
        dob: form.dob,
        age: form.age,
        bio: form.bio
      };
      localStorage.setItem("user", JSON.stringify(updated));
      alert("✅ Profile Updated Successfully!");
    } catch (e) {
      alert("Error updating profile");
    }
    setLoading(false);
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleDobChange = (dob) => {
    setForm({ ...form, dob, age: calculateAge(dob) });
  };

  return (
    <div className={`profile-container ${isAdmin ? 'admin-theme' : 'user-theme'}`}>
      <div className="profile-header">
        <button 
          onClick={() => nav(isAdmin ? "/admin" : "/home")} 
          className="back-btn"
        >
          ← Back to Dashboard
        </button>
        <h1 className="profile-title">
          {isAdmin ? "👨‍💼 Admin Profile" : "👤 User Profile"}
        </h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="avatar-placeholder">
                {isAdmin ? "👨‍💼" : "👤"}
              </div>
            )}
            <div className="avatar-overlay">
              <label htmlFor="image-upload" className="upload-btn">
                📷 Change Photo
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              placeholder="Enter your full name"
              value={form.name || ""}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                className="form-input"
                type="date"
                value={form.dob || ""}
                onChange={e => handleDobChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="number"
                placeholder="Auto-calculated"
                value={form.age || ""}
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-input"
              placeholder="Tell us about yourself..."
              rows="3"
              value={form.bio || ""}
              onChange={e => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div className={`role-badge ${isAdmin ? 'admin-role' : 'user-role'}`}>
              {isAdmin ? "🛡️ Administrator" : "👤 User"}
            </div>
          </div>

          <button 
            onClick={save} 
            disabled={loading}
            className="save-btn"
          >
            {loading ? "Saving..." : "💾 Save Profile"}
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h4>Member Since</h4>
            <p>{form.createdAt ? new Date(form.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">{isAdmin ? "🔧" : "🔍"}</div>
          <div className="stat-content">
            <h4>{isAdmin ? "System Access" : "Role"}</h4>
            <p>{isAdmin ? "Full Access" : "User"}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <h4>Email</h4>
            <p style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{form.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
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

        .profile-header {
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

        .profile-title {
          margin: 0;
          font-size: 2rem;
        }

        .user-theme .profile-title {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-theme .profile-title {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 3rem;
          align-items: start;
        }

        .user-theme .profile-card {
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .admin-theme .profile-card {
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .profile-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .avatar-container {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .user-theme .avatar-container {
          border: 4px solid #3b82f6;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }

        .admin-theme .avatar-container {
          border: 4px solid #8b5cf6;
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
        }

        .user-theme .avatar-placeholder {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        }

        .admin-theme .avatar-placeholder {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
        }

        .avatar-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.8);
          padding: 0.5rem;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .avatar-container:hover .avatar-overlay {
          opacity: 1;
        }

        .upload-btn {
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          font-weight: 600;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          margin-bottom: 0.5rem;
          font-weight: 600;
          opacity: 0.9;
        }

        .form-input {
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(15, 23, 42, 0.8);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          resize: vertical;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .user-theme .form-input:focus {
          border-color: #3b82f6;
        }

        .admin-theme .form-input:focus {
          border-color: #8b5cf6;
        }

        .role-badge {
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-role {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        }

        .admin-role {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
        }

        .save-btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .user-theme .save-btn {
          background: linear-gradient(45deg, #10b981, #059669);
        }

        .admin-theme .save-btn {
          background: linear-gradient(45deg, #10b981, #059669);
        }

        .save-btn {
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-item {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease;
        }

        .user-theme .stat-item {
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .admin-theme .stat-item {
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .stat-item:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content h4 {
          margin: 0 0 0.5rem 0;
          opacity: 0.9;
        }

        .stat-content p {
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-theme .stat-content p {
          color: #3b82f6;
        }

        .admin-theme .stat-content p {
          color: #8b5cf6;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .profile-card {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
