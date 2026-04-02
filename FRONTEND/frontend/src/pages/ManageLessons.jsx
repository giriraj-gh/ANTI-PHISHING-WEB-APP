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

  useEffect(() => { loadLessons(); }, []);

  const loadLessons = async () => {
    try {
      const res = await api.get("/lessons/all");
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setLessons([]); }
  };

  const saveLesson = async () => {
    try {
      if (editId) { await api.put(`/lessons/${editId}`, form); }
      else { await api.post("/lessons/create", { ...form, status: 'waiting' }); }
      setShowForm(false);
      setForm({ title: '', description: '', content: '', icon: '📚', level: 'Beginner', duration: '10 min', isFree: false });
      setEditId(null);
      loadLessons();
    } catch (e) { alert('Error saving lesson'); }
  };

  const activateLesson = async (id) => {
    try { await api.put(`/lessons/activate/${id}`); loadLessons(); }
    catch (e) { alert('Error launching lesson'); }
  };

  const activateAll = async () => {
    const waiting = lessons.filter(l => l.status === 'waiting' || l.status === 'pending');
    for (const l of waiting) { await api.put(`/lessons/activate/${l._id}`); }
    loadLessons();
    alert(`✅ ${waiting.length} lessons activated!`);
  };

  const deleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) { await api.delete(`/lessons/${id}`); loadLessons(); }
  };

  const editLesson = (lesson) => { setForm(lesson); setEditId(lesson._id); setShowForm(true); };

  const waitingCount = lessons.filter(l => l.status === 'waiting' || l.status === 'pending').length;

  // View lesson content
  if (viewLesson) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(31,41,55,0.9)', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)' }}>
        <button onClick={() => setViewLesson(null)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem' }}>← Back to Manage</button>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '3rem' }}>{viewLesson.icon}</span>
          <div>
            <h2 style={{ margin: 0 }}>{viewLesson.title}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ background: viewLesson.status === 'active' ? '#10b981' : '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>{viewLesson.status === 'active' ? '✅ Active' : '⏳ Waiting'}</span>
              <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>{viewLesson.level}</span>
              <span style={{ background: 'rgba(139,92,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>⏱️ {viewLesson.duration}</span>
            </div>
          </div>
        </div>
        <div style={{ lineHeight: 1.9, fontSize: '1.05rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }} dangerouslySetInnerHTML={{ __html: viewLesson.content || '<p>No content yet.</p>' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => nav("/admin")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h1 style={{ margin: 0 }}>⚙️ Manage Lessons ({lessons.length})</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {waitingCount > 0 && <button onClick={activateAll} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#f59e0b,#d97706)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>🚀 Launch All ({waitingCount})</button>}
          <button onClick={() => setShowForm(true)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Add Lesson</button>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '16px', maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem' }}>{editId ? 'Edit Lesson' : 'Add New Lesson'}</h2>
            {[['Title', 'title', 'text'], ['Description', 'description', 'text']].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{label}</label>
                <input type={type} placeholder={label} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }} />
              </div>
            ))}
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Content</label>
            <textarea placeholder="Content (HTML supported)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box', resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input placeholder="Icon (emoji)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
              <input placeholder="Duration" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} /> Free for guests
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={saveLesson} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lessons.map(lesson => (
          <div key={lesson._id} style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>{lesson.icon}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem' }}>{lesson.title}</h3>
              <p style={{ margin: '0 0 0.75rem', opacity: 0.7, fontSize: '0.9rem' }}>{lesson.description}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ background: lesson.status === 'active' ? '#10b981' : '#f59e0b', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>{lesson.status === 'active' ? '✅ Active' : '⏳ Waiting'}</span>
                <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{lesson.level} • {lesson.duration}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setViewLesson(lesson)} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>👁️ View</button>
              {(lesson.status === 'waiting' || lesson.status === 'pending') && (
                <button onClick={() => activateLesson(lesson._id)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🚀 Launch</button>
              )}
              <button onClick={() => editLesson(lesson)} style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>✏️ Edit</button>
              <button onClick={() => deleteLesson(lesson._id)} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
