import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Quiz() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isGuest = !token;
  const isAdmin = role === "admin";

  useEffect(() => {
    api.get("/quiz/all").then(res => {
      const all = Array.isArray(res.data) ? res.data : [];
      setQuizzes(isAdmin ? all : all.filter(q => !q.status || q.status === 'active'));
    }).catch(() => {});
  }, [isAdmin]);

  const startQuiz = (q) => {
    if (isGuest && !q.isDemo) { alert("Please register to take full quizzes"); nav("/register"); return; }
    setQuiz(q); setQIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false);
  };

  const pick = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === quiz.questions[qIdx].correctAnswer) setScore(s => s + 1);
  };

  const next = async () => {
    if (qIdx < quiz.questions.length - 1) {
      setQIdx(i => i + 1); setSelected(null); setAnswered(false);
    } else {
      const total = quiz.questions.length;
      const finalScore = score + (selected === quiz.questions[qIdx].correctAnswer ? 1 : 0);
      const pct = Math.round((finalScore / total) * 100);
      setScore(finalScore);
      setDone(true);
      if (!isGuest) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try { await api.post('/results/save', { quizTitle: quiz.title, userName: user.name, score: finalScore, total, percentage: pct, passed: pct >= 80 }); }
        catch (e) {}
      }
    }
  };

  const optionStyle = (option) => {
    const correct = quiz.questions[qIdx].correctAnswer;
    const base = { padding: '1rem 1.5rem', borderRadius: '12px', border: '2px solid', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', transition: 'all 0.2s', cursor: answered ? 'default' : 'pointer' };
    if (!answered) return { ...base, background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' };
    if (option === correct) return { ...base, background: 'rgba(16,185,129,0.25)', borderColor: '#10b981' };
    if (option === selected) return { ...base, background: 'rgba(220,38,38,0.25)', borderColor: '#dc2626' };
    return { ...base, background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 };
  };

  // Result screen
  if (done) {
    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 80;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ background: 'rgba(31,41,55,0.9)', padding: '3rem', borderRadius: '20px', textAlign: 'center', color: 'white', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '5rem' }}>{passed ? '🎉' : '😔'}</div>
            <h2>{passed ? 'Congratulations! You Passed!' : 'Keep Learning!'}</h2>
            <div style={{ width: 160, height: 160, borderRadius: '50%', background: passed ? 'linear-gradient(45deg,#10b981,#059669)' : 'linear-gradient(45deg,#dc2626,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1.5rem auto', border: `8px solid ${passed ? '#34d399' : '#f87171'}` }}>
              <span style={{ fontSize: '3rem', fontWeight: 700 }}>{pct}%</span>
            </div>
            <p style={{ fontSize: '1.2rem' }}>You scored {score} out of {total}</p>
            <div style={{ padding: '1rem', borderRadius: '8px', fontWeight: 700, background: passed ? 'rgba(16,185,129,0.2)' : 'rgba(220,38,38,0.2)', color: passed ? '#10b981' : '#dc2626', border: `2px solid ${passed ? '#10b981' : '#dc2626'}`, margin: '1rem 0 2rem' }}>
              {passed ? '✅ PASSED - Minimum 80% Required' : '❌ FAILED - Minimum 80% Required'}
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => { setQuiz(null); setDone(false); }} style={{ flex: 1, padding: '1rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Back to Quizzes</button>
              <button onClick={() => nav("/lessons")} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Review Lessons</button>
              {!isGuest && <button onClick={() => nav(isAdmin ? "/admin" : "/home")} style={{ flex: 1, padding: '1rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Dashboard</button>}
            </div>
          </div>
          {/* Leaderboard */}
          {!isGuest && <Leaderboard quizTitle={quiz.title} currentUser={JSON.parse(localStorage.getItem('user') || '{}')} />}
        </div>
      </div>
    );
  }

  // Question screen
  if (quiz) {
    const q = quiz.questions[qIdx];
    const correct = q.correctAnswer;
    const progress = ((qIdx + 1) / quiz.questions.length) * 100;
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(31,41,55,0.9)', padding: '2rem', borderRadius: '20px', maxWidth: 800, width: '100%', color: 'white' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{quiz.title}</div>
              <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>Question {qIdx + 1} of {quiz.questions.length}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 600 }}>Score: {score}</span>
              <button onClick={() => setQuiz(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
          </div>

          {/* Progress */}
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(45deg,#10b981,#059669)', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>

          <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
            ⚠️ Pass: 80% ({Math.ceil(quiz.questions.length * 0.8)} correct needed)
          </div>

          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', lineHeight: 1.6 }}>{q.question}</h2>

          {/* Options A, B, C, D */}
          {q.options.map((option, idx) => (
            <div key={idx} style={optionStyle(option)} onClick={() => pick(option)}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span style={{ flex: 1 }}>{option}</span>
              {answered && option === correct && <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.2rem' }}>✓</span>}
              {answered && option === selected && option !== correct && <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.2rem' }}>✗</span>}
            </div>
          ))}

          {/* Feedback */}
          {answered && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, background: selected === correct ? 'rgba(16,185,129,0.15)' : 'rgba(220,38,38,0.15)', border: `1px solid ${selected === correct ? '#10b981' : '#dc2626'}`, color: selected === correct ? '#10b981' : '#dc2626' }}>
              {selected === correct ? '✅ Correct!' : `❌ Wrong! Correct answer: ${correct}`}
            </div>
          )}

          {/* Next button appears only after answering */}
          {answered && (
            <button onClick={next} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(45deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }}>
              {qIdx === quiz.questions.length - 1 ? '🏁 Finish Quiz' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz list
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: 'white', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => nav(isAdmin ? "/admin" : isGuest ? "/" : "/home")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>← Back</button>
        <h1 style={{ margin: 0 }}>📝 Phishing Quizzes</h1>
        {isAdmin && <button onClick={() => nav("/admin/manage-quiz")} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(45deg,#8b5cf6,#7c3aed)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>⚙️ Manage Quiz</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.5rem' }}>
        {quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1', opacity: 0.6 }}><h3>No quizzes available yet</h3></div>
        ) : quizzes.map(q => (
          <div key={q._id} onClick={() => startQuiz(q)}
            style={{ background: 'rgba(31,41,55,0.8)', padding: '1.5rem', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(59,130,246,0.2)', transition: 'transform 0.2s', position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            {isAdmin && <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: q.status === 'waiting' ? '#f59e0b' : '#10b981', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{q.status === 'waiting' ? '⏳ Waiting' : '✅ Active'}</span>}
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>{q.title}</h3>
            <p style={{ opacity: 0.7, margin: '0 0 1rem', fontSize: '0.9rem' }}>{q.description}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
              <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>📊 {q.questions?.length || 0} Questions</span>
              <span style={{ background: 'rgba(245,158,11,0.2)', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>⚠️ Pass: 80%</span>
              {q.isDemo && <span style={{ background: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>DEMO</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leaderboard({ quizTitle, currentUser }) {
  const [board, setBoard] = React.useState([]);
  React.useEffect(() => {
    api.get(`/results/leaderboard/${encodeURIComponent(quizTitle)}`)
      .then(res => setBoard(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [quizTitle]);
  if (board.length === 0) return null;
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div style={{ background: 'rgba(31,41,55,0.9)', padding: '1.5rem', borderRadius: '20px', color: 'white', border: '1px solid rgba(139,92,246,0.2)' }}>
      <h3 style={{ margin: '0 0 1rem', color: '#f59e0b', textAlign: 'center' }}>🏆 Leaderboard - {quizTitle}</h3>
      {board.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: r.userName === currentUser?.name ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem', border: r.userName === currentUser?.name ? '1px solid #8b5cf6' : '1px solid transparent' }}>
          <span style={{ fontSize: '1.5rem', width: 36, textAlign: 'center' }}>{medals[i] || `#${i + 1}`}</span>
          <span style={{ flex: 1, fontWeight: r.userName === currentUser?.name ? 700 : 400 }}>{r.userName} {r.userName === currentUser?.name ? '(You)' : ''}</span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>{r.score}/{r.total}</span>
          <span style={{ background: r.passed ? 'rgba(16,185,129,0.2)' : 'rgba(220,38,38,0.2)', color: r.passed ? '#10b981' : '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>{Math.round(r.percentage)}%</span>
        </div>
      ))}
    </div>
  );
}
