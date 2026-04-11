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
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Back button */}
        <button onClick={() => setSelected(null)}
          style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1.25rem', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', cursor:'pointer', fontWeight:600, marginBottom:'2rem', transition:'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
          ← Back to Lessons
        </button>

        {/* Lesson Header */}
        <div style={{ background:'rgba(31,41,55,0.9)', borderRadius:'20px', overflow:'hidden', border:'1px solid rgba(59,130,246,0.15)', marginBottom:'1.5rem' }}>

          {/* Top color bar */}
          <div style={{ height:6, background:'linear-gradient(90deg,#3b82f6,#8b5cf6,#10b981)' }} />

          <div style={{ padding:'2rem' }}>
            {/* Icon + Title */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
              <div style={{ width:60, height:60, borderRadius:'16px', background:'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', border:'1px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>
                {selected.icon || '📚'}
              </div>
              <div>
                <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, lineHeight:1.2 }}>{selected.title}</h1>
                <p style={{ margin:'0.3rem 0 0', opacity:0.5, fontSize:'0.9rem' }}>{selected.description}</p>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
              <span style={{ background:'rgba(59,130,246,0.15)', color:'#93c5fd', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600, border:'1px solid rgba(59,130,246,0.2)' }}>
                📊 {selected.level}
              </span>
              <span style={{ background:'rgba(139,92,246,0.15)', color:'#c4b5fd', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600, border:'1px solid rgba(139,92,246,0.2)' }}>
                ⏱️ {selected.duration}
              </span>
              {selected.isFree && (
                <span style={{ background:'rgba(16,185,129,0.15)', color:'#6ee7b7', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600, border:'1px solid rgba(16,185,129,0.2)' }}>
                  ✓ Free
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div style={{ background:'rgba(31,41,55,0.9)', borderRadius:'20px', padding:'2rem', border:'1px solid rgba(59,130,246,0.15)', marginBottom:'1.5rem' }}>
          <h3 style={{ margin:'0 0 1.25rem', color:'#93c5fd', fontSize:'1rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ width:3, height:18, background:'#3b82f6', borderRadius:2, display:'inline-block' }} />
            Lesson Content
          </h3>
          <div style={{ lineHeight:2, fontSize:'1rem', color:'rgba(255,255,255,0.85)' }}
            dangerouslySetInnerHTML={{ __html: (selected.content || '<p>Content coming soon...</p>')
              .replace(/<h3>/g, '<h3 style="color:#93c5fd;font-size:1.1rem;margin:1.5rem 0 0.75rem;font-weight:700">')
              .replace(/<ul>/g, '<ul style="padding-left:1.5rem;margin:0.5rem 0">')
              .replace(/<li>/g, '<li style="margin-bottom:0.5rem;color:rgba(255,255,255,0.8)">')
              .replace(/<p>/g, '<p style="margin-bottom:1rem;color:rgba(255,255,255,0.8)">')
            }} />
        </div>

        {/* Start Quiz Button - ONLY button at bottom */}
        <button onClick={() => nav("/quiz")}
          style={{ width:'100%', padding:'1.1rem', background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'white', border:'none', borderRadius:'16px', fontWeight:700, fontSize:'1.1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', boxShadow:'0 8px 24px rgba(59,130,246,0.35)', transition:'all 0.3s', letterSpacing:'0.3px' }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(59,130,246,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(59,130,246,0.35)'; }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,8 16,12 12,16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Start Quiz
        </button>

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
