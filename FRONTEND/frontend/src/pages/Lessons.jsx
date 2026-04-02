import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Lessons() {
  const nav = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState(null);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const isAdmin = role === "admin";
  const isGuest = !token;

  useEffect(() => {
    api.get("/lessons/all").then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setLessons(isAdmin ? data : data.filter(l => !l.status || l.status === 'active'));
    }).catch(() => {});
  }, [isAdmin]);

  const open = (lesson) => {
    if (isGuest && !lesson.isFree) { alert("Please register to access this lesson"); nav("/register"); return; }
    setSelected(lesson);
  };

  if (selected) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(31,41,55,0.9)', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.2)' }}>
        <button onClick={() => setSelected(null)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem' }}>← Back to Lessons</button>
        <h2 style={{ margin: '0 0 0.5rem' }}>{selected.icon} {selected.title}</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{selected.level}</span>
          <span style={{ background: 'rgba(139,92,246,0.2)', padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>⏱️ {selected.duration}</span>
        </div>
        <div style={{ lineHeight: 1.9, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: selected.content || '<p>Content coming soon...</p>' }} />
        <button onClick={() => nav("/quiz")} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', marginTop: '2rem' }}>📝 Take Quiz →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => nav(isAdmin ? "/admin" : isGuest ? "/" : "/home")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h1 style={{ margin: 0 }}>🎓 Phishing Education Lessons</h1>
        {isAdmin && <button onClick={() => nav("/admin/manage-lessons")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>⚙️ Manage Lessons</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
        {lessons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1', opacity: 0.6 }}>
            <h3>No lessons available yet</h3>
            {isAdmin && <p>Go to Manage Lessons to launch lessons</p>}
          </div>
        ) : lessons.map(lesson => (
          <div key={lesson._id} onClick={() => open(lesson)}
            style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(59,130,246,0.2)', transition: 'transform 0.2s', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            {isAdmin && <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: lesson.status === 'waiting' ? '#f59e0b' : '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{lesson.status === 'waiting' ? '⏳ Waiting' : '✅ Active'}</span>}
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{lesson.icon || '📚'}</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>{lesson.title}</h3>
            <p style={{ opacity: 0.7, margin: '0 0 1rem', fontSize: '0.9rem' }}>{lesson.description}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
              <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>⏱️ {lesson.duration}</span>
              <span style={{ background: 'rgba(139,92,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>{lesson.level}</span>
              {lesson.isFree && <span style={{ background: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>FREE</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
