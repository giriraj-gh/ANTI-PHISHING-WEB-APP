import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ManageLessons() {
  const nav = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", content: "", icon: "📚", level: "Beginner", duration: "10 min", isFree: false });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const res = await api.get("/lessons/all");
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("Error loading lessons");
      setLessons([]);
    }
  };

  const saveLesson = async () => {
    try {
      if (editId) {
        await api.put(`/lessons/${editId}`, form);
      } else {
        await api.post("/lessons/create", { ...form, status: 'waiting' });
      }
      setShowForm(false);
      setForm({ title: '', description: '', content: '', icon: '📚', level: 'Beginner', duration: '10 min', isFree: false });
      setEditId(null);
      loadLessons();
    } catch (e) { alert('Error saving lesson'); }
  };

  const editLesson = (lesson) => {
    setForm(lesson);
    setEditId(lesson._id);
    setShowForm(true);
  };

  const deleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      await api.delete(`/lessons/${id}`);
      loadLessons();
    }
  };

  const activateLesson = async (id) => {
    try {
      await api.put(`/lessons/activate/${id}`);
      loadLessons();
    } catch (e) { alert('Error launching lesson'); }
  };

  return (
    <div className="manage-page">
      <div className="page-header">
        <button onClick={() => nav("/admin")} className="back-btn">← Back</button>
        <h1>⚙️ Manage Lessons</h1>
        <button onClick={() => setShowForm(true)} className="add-btn">+ Add Lesson</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? "Edit Lesson" : "Add New Lesson"}</h2>
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="Content (HTML supported)"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="form-textarea"
              rows={6}
            />
            <div className="form-row">
              <input
                placeholder="Icon (emoji)"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="form-input-small"
              />
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="form-select"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <input
                placeholder="Duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="form-input-small"
              />
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              />
              Free for guests
            </label>
            <div className="modal-actions">
              <button onClick={saveLesson} className="save-btn">Save</button>
              <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="lessons-table">
        {Array.isArray(lessons) && lessons.map((lesson) => (
          <div key={lesson._id} className="lesson-row">
            <span className="lesson-icon">{lesson.icon}</span>
            <div className="lesson-info">
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <div className="lesson-meta">
                <span className={`status-badge ${lesson.status}`}>
                  {lesson.status === 'pending' ? '⏳ Pending' : lesson.status === 'waiting' ? '⏳ Waiting' : '✅ Active'}
                </span>
                <span className="lesson-level">{lesson.level}</span>
                <span className="lesson-duration">{lesson.duration}</span>
              </div>
            </div>
            <div className="lesson-actions">
              {(lesson.status === 'waiting' || lesson.status === 'pending') && (
                <button onClick={() => activateLesson(lesson._id)} className="activate-btn">🚀 Launch</button>
              )}
              <button onClick={() => editLesson(lesson)} className="edit-btn">✏️ Edit</button>
              <button onClick={() => deleteLesson(lesson._id)} className="delete-btn">🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .manage-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          color: white;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-btn, .add-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .back-btn {
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          color: white;
        }

        .add-btn {
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1f2937;
          padding: 2rem;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-input, .form-textarea, .form-select, .form-input-small {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
        }

        .save-btn, .cancel-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .save-btn {
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .lessons-table {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .lesson-row {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .lesson-icon {
          font-size: 2rem;
        }

        .lesson-info {
          flex: 1;
        }

        .lesson-info h3 {
          margin: 0 0 0.5rem 0;
        }

        .lesson-info p {
          margin: 0 0 1rem 0;
          opacity: 0.7;
        }

        .lesson-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.waiting, .status-badge.pending {
          background: #f59e0b;
          color: white;
        }

        .status-badge.active {
          background: #10b981;
          color: white;
        }

        .lesson-level, .lesson-duration {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .lesson-actions {
          display: flex;
          gap: 0.5rem;
        }

        .activate-btn, .edit-btn, .delete-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .activate-btn {
          background: #10b981;
          color: white;
        }

        .edit-btn {
          background: #3b82f6;
          color: white;
        }

        .delete-btn {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </div>
  );
}
