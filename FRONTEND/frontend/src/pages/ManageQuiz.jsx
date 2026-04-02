import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ManageQuiz() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    isDemo: false,
    questions: Array(20).fill().map(() => ({ question: "", options: ["", "", "", ""], correctAnswer: "" }))
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const res = await api.get("/quiz/all");
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log("Error loading quizzes");
      setQuizzes([]);
    }
  };

  const activateQuiz = async (id) => {
    try {
      await api.put(`/quiz/activate/${id}`);
      loadQuizzes();
    } catch (e) { alert('Error launching quiz'); }
  };

  const saveQuiz = async () => {
    try {
      if (editId) {
        await api.put(`/quiz/${editId}`, form);
      } else {
        await api.post('/quiz/create', { ...form, status: 'waiting' });
      }
      setShowForm(false);
      resetForm();
      loadQuizzes();
    } catch (e) { alert('Error saving quiz'); }
  };

  const resetForm = () => {
    setForm({ 
      title: "", 
      description: "", 
      isDemo: false,
      questions: Array(20).fill().map(() => ({ question: "", options: ["", "", "", ""], correctAnswer: "" }))
    });
    setEditId(null);
  };

  const editQuiz = (quiz) => {
    setForm(quiz);
    setEditId(quiz._id);
    setShowForm(true);
  };

  const deleteQuiz = async (id) => {
    if (window.confirm('Delete this quiz?')) {
      await api.delete(`/quiz/${id}`);
      loadQuizzes();
    }
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...form.questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setForm({ ...form, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    if (form.questions.length > 1) {
      const newQuestions = form.questions.filter((_, i) => i !== index);
      setForm({ ...form, questions: newQuestions });
    }
  };

  return (
    <div className="manage-page">
      <div className="page-header">
        <button onClick={() => nav("/admin")} className="back-btn">← Back</button>
        <h1>📝 Manage Quiz</h1>
        <button onClick={() => setShowForm(true)} className="add-btn">+ Add Quiz</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? "Edit Quiz" : "Add New Quiz"}</h2>
            
            <input
              placeholder="Quiz Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="form-input"
            />
            
            <textarea
              placeholder="Quiz Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-textarea"
              rows={3}
            />
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isDemo}
                onChange={(e) => setForm({ ...form, isDemo: e.target.checked })}
              />
              Demo Quiz (accessible to guests)
            </label>

            <div className="questions-section">
              <h3>Questions</h3>
              {form.questions.map((q, index) => (
                <div key={index} className="question-form">
                  <div className="question-header">
                    <h4>Question {index + 1}</h4>
                    {form.questions.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeQuestion(index)}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <input
                    placeholder="Question text"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="form-input"
                  />
                  
                  <div className="options-grid">
                    {q.options.map((option, optIndex) => (
                      <input
                        key={optIndex}
                        placeholder={`Option ${optIndex + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(index, 'options', newOptions);
                        }}
                        className="form-input-small"
                      />
                    ))}
                  </div>
                  
                  <select
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select correct answer</option>
                    {q.options.map((option, optIndex) => (
                      <option key={optIndex} value={option}>{option || `Option ${optIndex + 1}`}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              <button type="button" onClick={addQuestion} className="add-question-btn" disabled>
                20 Questions (Fixed)
              </button>
            </div>

            <div className="modal-actions">
              <button onClick={saveQuiz} className="save-btn">Save Quiz</button>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="quizzes-table">
        {Array.isArray(quizzes) && quizzes.map((quiz) => (
          <div key={quiz._id} className="quiz-row">
            <div className="quiz-info">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="quiz-meta">
                <span className={`badge ${quiz.isDemo ? 'demo' : 'premium'}`}>{quiz.isDemo ? 'DEMO' : 'PREMIUM'}</span>
                <span className={`badge ${quiz.status === 'waiting' ? 'waiting' : 'active-badge'}`}>
                  {quiz.status === 'waiting' ? '⏳ Waiting' : '✅ Active'}
                </span>
                <span className="question-count">{quiz.questions?.length || 0} Questions</span>
              </div>
            </div>
            <div className="quiz-actions">
              {quiz.status === 'waiting' && (
                <button onClick={() => activateQuiz(quiz._id)} className="activate-btn">🚀 Launch</button>
              )}
              <button onClick={() => editQuiz(quiz)} className="edit-btn">✏️ Edit</button>
              <button onClick={() => deleteQuiz(quiz._id)} className="delete-btn">🗑️ Delete</button>
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
          max-width: 800px;
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

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .questions-section {
          margin: 2rem 0;
        }

        .question-form {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .remove-btn {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .add-question-btn {
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
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

        .quizzes-table {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .quiz-row {
          background: rgba(31, 41, 55, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .quiz-info h3 {
          margin: 0 0 0.5rem 0;
        }

        .quiz-info p {
          margin: 0 0 1rem 0;
          opacity: 0.7;
        }

        .quiz-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge.demo {
          background: #f59e0b;
        }

        .badge.premium {
          background: #8b5cf6;
        }

        .badge.waiting {
          background: #f59e0b;
          color: white;
        }

        .badge.active-badge {
          background: #10b981;
          color: white;
        }

        .activate-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          background: #10b981;
          color: white;
        }

        .question-count {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .quiz-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .delete-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
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