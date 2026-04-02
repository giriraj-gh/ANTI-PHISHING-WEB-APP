import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ManageLessons() {
  const nav = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewLesson, setViewLesson] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", content: "", icon: "📚", level: "Beginner", duration: "10 min", isFree: false });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadLessons(); }, []);

  const loadLessons = async () => {
    try {
      const res = await api.get("/lessons/all");
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setLessons([]); }
  };

  const saveLesson = async () => {
    if (!form.title.trim()) return alert("Title is required");
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/lessons/${editId}`, { ...form, status: 'active' });
      } else {
        await api.post("/lessons/create", { ...form, status: 'active' });
      }
      setShowForm(false);
      setForm({ title: '', description: '', content: '', icon: '📚', level: 'Beginner', duration: '10 min', isFree: false });
      setEditId(null);
      loadLessons();
    } catch (e) { alert('Error saving lesson'); }
    setLoading(false);
  };

  const deleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      await api.delete(`/lessons/${id}`);
      loadLessons();
    }
  };

  const editLesson = (lesson) => {
    setForm({ title: lesson.title, description: lesson.description, content: lesson.content, icon: lesson.icon, level: lesson.level, duration: lesson.duration, isFree: lesson.isFree });
    setEditId(lesson._id);
    setShowForm(true);
  };

  if (viewLesson) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(31,41,55,0.9)', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)' }}>
        <button onClick={() => setViewLesson(null)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem' }}>← Back to Manage</button>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '3rem' }}>{viewLesson.icon}</span>
          <div>
            <h2 style={{ margin: 0 }}>{viewLesson.title}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ background: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>✅ Active</span>
              <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>{viewLesson.level}</span>
              <span style={{ background: 'rgba(139,92,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>⏱️ {viewLesson.duration}</span>
              {viewLesson.isFree && <span style={{ background: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>FREE</span>}
            </div>
          </div>
        </div>
        <div style={{ lineHeight: 1.9, fontSize: '1.05rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}
          dangerouslySetInnerHTML={{ __html: viewLesson.content || '<p>No content yet.</p>' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => nav("/admin")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h1 style={{ margin: 0 }}>📚 Manage Lessons ({lessons.length})</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', description: '', content: '', icon: '📚', level: 'Beginner', duration: '10 min', isFree: false }); }}
          style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Add Lesson</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '16px', maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem', color: 'white' }}>{editId ? '✏️ Edit Lesson' : '+ Add New Lesson'}</h2>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontWeight: 600 }}>Title *</label>
            <input placeholder="Lesson title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontWeight: 600 }}>Description</label>
            <input placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontWeight: 600 }}>Content</label>
            <textarea placeholder="Lesson content (HTML supported)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box', resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontSize: '0.85rem' }}>Icon</label>
                <input placeholder="📚" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontSize: '0.85rem' }}>Level</label>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontSize: '0.85rem' }}>Duration</label>
                <input placeholder="15 min" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', color: 'white' }}>
              <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} /> Free for guests
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={saveLesson} disabled={loading} style={{ flex: 1, padding: '0.85rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                {loading ? 'Saving...' : editId ? '✅ Update Lesson' : '✅ Save Lesson'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.85rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
          <h3>No lessons yet. Click "+ Add Lesson" to create one.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessons.map(lesson => (
            <div key={lesson._id} onClick={() => setViewLesson(lesson)}
              style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='#8b5cf6'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.2)'; }}>
              <span style={{ fontSize: '2.5rem' }}>{lesson.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.25rem' }}>{lesson.title}</h3>
                <p style={{ margin: '0 0 0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>{lesson.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>{lesson.level}</span>
                  <span style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>⏱️ {lesson.duration}</span>
                  {lesson.isFree && <span style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>FREE</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => editLesson(lesson)} style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>✏️ Edit</button>
                <button onClick={() => deleteLesson(lesson._id)} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
