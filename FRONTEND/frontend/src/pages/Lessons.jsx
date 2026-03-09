import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Lessons() {
  const nav = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const isGuest = !token;

  const loadLessons = useCallback(async () => {
    try {
      const res = await api.get("/lessons/all");
      console.log('API Response:', res.data);
      console.log('User role:', role);
      // Show all active lessons for users
      const filteredLessons = res.data.filter(lesson => lesson.status === 'active');
      console.log('Filtered lessons:', filteredLessons);
      setLessons(filteredLessons);
    } catch (e) {
      console.log("Error loading lessons:", e);
    }
  }, [role]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const viewLesson = (lesson) => {
    if (isGuest && !lesson.isFree) {
      alert("Please register to access this lesson");
      nav("/register");
      return;
    }
    setSelectedLesson(lesson);
  };

  return (
    <div className="lessons-page">
      <div className="lessons-header">
        <button onClick={() => nav(role === "admin" ? "/admin" : isGuest ? "/" : "/home")} className="back-btn">
          ← Back
        </button>
        <h1>🎓 Phishing Education Lessons</h1>
        {role === "admin" && (
          <button onClick={() => nav("/admin/manage-lessons")} className="manage-btn">
            ⚙️ Manage Lessons
          </button>
        )}
      </div>

      {!selectedLesson ? (
        <div className="lessons-grid">
          {lessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1' }}>
              <h3>No lessons available</h3>
              <p>Check console for debugging info</p>
            </div>
          ) : (
            lessons.map((lesson, idx) => (
              <div key={idx} className="lesson-card" onClick={() => viewLesson(lesson)}>
                <div className="lesson-icon">{lesson.icon || "📚"}</div>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
                <div className="lesson-meta">
                  <span className="duration">⏱️ {lesson.duration || "10 min"}</span>
                  <span className="level">{lesson.level || "Beginner"}</span>
                  {lesson.isFree && <span className="free-badge">FREE</span>}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="lesson-content">
          <button onClick={() => setSelectedLesson(null)} className="close-btn">✕ Close</button>
          <h2>{selectedLesson.icon} {selectedLesson.title}</h2>
          <div className="content-body" dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
          <button onClick={() => nav("/quiz")} className="quiz-btn">
            Take Quiz →
          </button>
        </div>
      )}

      <style jsx>{`
        .lessons-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 2rem;
        }

        .lessons-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-btn, .manage-btn, .close-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
          transition: transform 0.3s ease;
        }

        .back-btn:hover, .manage-btn:hover, .close-btn:hover {
          transform: translateY(-2px);
        }

        .lessons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .lesson-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .lesson-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
        }

        .lesson-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .lesson-meta {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .free-badge {
          background: #10b981;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .lesson-content {
          background: rgba(31, 41, 55, 0.8);
          padding: 3rem;
          border-radius: 16px;
          max-width: 900px;
          margin: 0 auto;
        }

        .content-body {
          line-height: 1.8;
          margin: 2rem 0;
        }

        .quiz-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}
