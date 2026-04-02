import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ManageQuiz() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", isDemo: false, questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }] });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    try {
      const res = await api.get("/quiz/all");
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setQuizzes([]); }
  };

  const saveQuiz = async () => {
    if (!form.title.trim()) return alert("Title is required");
    if (form.questions.length === 0) return alert("Add at least one question");
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/quiz/${editId}`, { ...form, status: 'active' });
      } else {
        await api.post('/quiz/create', { ...form, status: 'active' });
      }
      setShowForm(false); resetForm(); loadQuizzes();
    } catch (e) { alert('Error saving quiz'); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", isDemo: false, questions: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }] });
    setEditId(null);
  };

  const deleteQuiz = async (id) => {
    if (window.confirm('Delete this quiz?')) { await api.delete(`/quiz/${id}`); loadQuizzes(); }
  };

  const editQuiz = (quiz) => {
    setForm({ title: quiz.title, description: quiz.description, isDemo: quiz.isDemo, questions: quiz.questions || [] });
    setEditId(quiz._id);
    setShowForm(true);
  };

  const updateQuestion = (idx, field, value) => {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], [field]: value };
    setForm({ ...form, questions: qs });
  };

  if (viewQuiz) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button onClick={() => setViewQuiz(null)} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem' }}>← Back to Manage</button>
        <div style={{ background: 'rgba(31,41,55,0.9)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem' }}>📝 {viewQuiz.title}</h2>
          <p style={{ opacity: 0.7, margin: '0 0 1rem' }}>{viewQuiz.description}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ background: '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>✅ Active</span>
            <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>📊 {viewQuiz.questions?.length} Questions</span>
            {viewQuiz.isDemo && <span style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>DEMO</span>}
          </div>
        </div>
        {viewQuiz.questions?.map((q, i) => (
          <div key={i} style={{ background: 'rgba(31,41,55,0.9)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#a78bfa' }}>Q{i + 1}. {q.question}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {q.options?.map((opt, j) => (
                <div key={j} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: `2px solid ${opt === q.correctAnswer ? '#10b981' : 'rgba(255,255,255,0.1)'}`, background: opt === q.correctAnswer ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{String.fromCharCode(65 + j)}.</span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {opt === q.correctAnswer && <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => nav("/admin")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#a855f7)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h1 style={{ margin: 0 }}>📝 Manage Quiz ({quizzes.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Add Quiz</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#1f2937', padding: '2rem', borderRadius: '16px', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1.5rem', color: 'white' }}>{editId ? '✏️ Edit Quiz' : '+ Add New Quiz'}</h2>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontWeight: 600 }}>Quiz Title *</label>
            <input placeholder="Quiz title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }} />
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#a78bfa', fontWeight: 600 }}>Description</label>
            <textarea placeholder="Quiz description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', color: 'white' }}>
              <input type="checkbox" checked={form.isDemo} onChange={e => setForm({ ...form, isDemo: e.target.checked })} /> Demo Quiz (accessible to guests)
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#a78bfa' }}>Questions ({form.questions.length})</h3>
              <button onClick={() => setForm({ ...form, questions: [...form.questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }] })}
                style={{ padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.3)', color: 'white', border: '1px solid #3b82f6', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Add Question</button>
            </div>
            {form.questions.map((q, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#a78bfa' }}>Q{i + 1}</strong>
                  {form.questions.length > 1 && <button onClick={() => setForm({ ...form, questions: form.questions.filter((_, j) => j !== i) })} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 700 }}>✕</button>}
                </div>
                <input placeholder="Enter question" value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'white', boxSizing: 'border-box' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {q.options.map((opt, j) => (
                    <input key={j} placeholder={`Option ${String.fromCharCode(65 + j)}`} value={opt}
                      onChange={e => { const opts = [...q.options]; opts[j] = e.target.value; updateQuestion(i, 'options', opts); }}
                      style={{ padding: '0.6rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
                  ))}
                </div>
                <select value={q.correctAnswer} onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
                  <option value="">✓ Select correct answer</option>
                  {q.options.map((opt, j) => <option key={j} value={opt}>{opt || `Option ${String.fromCharCode(65 + j)}`}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={saveQuiz} disabled={loading} style={{ flex: 1, padding: '0.85rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
                {loading ? 'Saving...' : editId ? '✅ Update Quiz' : '✅ Save Quiz'}
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, padding: '0.85rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3>No quizzes yet. Click "+ Add Quiz" to create one.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {quizzes.map(quiz => (
            <div key={quiz._id} style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.25rem' }}>{quiz.title}</h3>
                <p style={{ margin: '0 0 0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>{quiz.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>📊 {quiz.questions?.length || 0} Questions</span>
                  {quiz.isDemo && <span style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>DEMO</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setViewQuiz(quiz)} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>👁️ View</button>
                <button onClick={() => editQuiz(quiz)} style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>✏️ Edit</button>
                <button onClick={() => deleteQuiz(quiz._id)} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
