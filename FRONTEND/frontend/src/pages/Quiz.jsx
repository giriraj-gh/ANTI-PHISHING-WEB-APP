import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Quiz() {
  const nav = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const token = localStorage.getItem("token");
  const isGuest = !token;

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const res = await api.get("/quiz/all");
      const role = localStorage.getItem('role');
      const all = Array.isArray(res.data) ? res.data : [];
      // Admin sees all 20, users only see active quizzes (10)
      setQuizzes(role === 'admin' ? all : all.filter(q => q.status === 'active'));
    } catch (e) {
      console.log("Error loading quizzes");
    }
  };

  const startQuiz = (quiz) => {
    if (isGuest && !quiz.isDemo) {
      alert("Please register to take full quizzes");
      nav("/register");
      return;
    }
    setCurrentQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const selectAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    let correct = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    
    const totalQuestions = currentQuiz.questions.length;
    const percentage = (correct / totalQuestions) * 100;
    const isPassed = percentage >= 80;
    
    setScore(correct);
    setPassed(isPassed);
    setShowResult(true);

    if (!isGuest) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const result = {
        quizTitle: currentQuiz.title,
        userName: user.name,
        score: correct,
        total: totalQuestions,
        percentage: percentage,
        passed: isPassed
      };
      try {
        await api.post('/results/save', result);
      } catch (e) { console.log('Error saving result'); }
    }
  };

  if (showResult) {
    const percentage = (score / currentQuiz.questions.length) * 100;
    return (
      <div className="quiz-page">
        <div className="result-card">
          <div className={`result-icon ${passed ? 'passed' : 'failed'}`}>
            {passed ? '🎉' : '😔'}
          </div>
          <h2>{passed ? 'Congratulations! You Passed!' : 'Keep Learning!'}</h2>
          <div className="score-display">
            <div className={`score-circle ${passed ? 'passed' : 'failed'}`}>
              <span className="score-text">{percentage.toFixed(0)}%</span>
            </div>
          </div>
          <p className="score-details">You scored {score} out of {currentQuiz.questions.length}</p>
          <div className={`pass-status ${passed ? 'passed' : 'failed'}`}>
            {passed ? '✅ PASSED - Minimum 80% Required' : '❌ FAILED - Minimum 80% Required'}
          </div>
          {!passed && (
            <p className="retry-message">Review the lesson and try again to pass!</p>
          )}
          <div className="result-actions">
            <button onClick={() => setCurrentQuiz(null)} className="btn-primary">Back to Quizzes</button>
            <button onClick={() => nav("/lessons")} className="btn-secondary">Review Lessons</button>
            {!isGuest && <button onClick={() => nav("/home")} className="btn-home">View Dashboard</button>}
          </div>
        </div>
        <style jsx>{`
          .quiz-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .result-card {
            background: rgba(31, 41, 55, 0.9);
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            color: white;
            max-width: 600px;
            width: 100%;
          }
          .result-icon {
            font-size: 5rem;
            margin-bottom: 1rem;
          }
          .result-icon.passed {
            animation: bounce 1s ease;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .score-circle {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 2rem auto;
            border: 8px solid;
          }
          .score-circle.passed {
            background: linear-gradient(45deg, #10b981, #059669);
            border-color: #34d399;
          }
          .score-circle.failed {
            background: linear-gradient(45deg, #dc2626, #b91c1c);
            border-color: #f87171;
          }
          .score-text {
            font-size: 3.5rem;
            font-weight: 700;
          }
          .score-details {
            font-size: 1.2rem;
            margin: 1rem 0;
          }
          .pass-status {
            padding: 1rem;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.1rem;
            margin: 1.5rem 0;
          }
          .pass-status.passed {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 2px solid #10b981;
          }
          .pass-status.failed {
            background: rgba(220, 38, 38, 0.2);
            color: #dc2626;
            border: 2px solid #dc2626;
          }
          .retry-message {
            color: #f59e0b;
            font-style: italic;
            margin: 1rem 0;
          }
          .result-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
          }
          .btn-primary, .btn-secondary, .btn-home {
            flex: 1;
            min-width: 150px;
            padding: 1rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
          }
          .btn-primary {
            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
            color: white;
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
          .btn-home {
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
          }
          .btn-primary:hover, .btn-secondary:hover, .btn-home:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  if (currentQuiz) {
    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;
    
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-header">
            <div className="quiz-info">
              <span className="quiz-title">{currentQuiz.title}</span>
              <span className="question-counter">Question {currentQuestion + 1} of {currentQuiz.questions.length}</span>
            </div>
            <button onClick={() => setCurrentQuiz(null)} className="close-btn">✕</button>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="pass-requirement">
            ⚠️ Pass Requirement: 80% ({Math.ceil(currentQuiz.questions.length * 0.8)} correct answers)
          </div>
          <h2 className="question-text">{question.question}</h2>
          <div className="answers-grid">
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`answer-option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                onClick={() => selectAnswer(option)}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
          <button
            onClick={nextQuestion}
            disabled={!answers[currentQuestion]}
            className="next-btn"
          >
            {currentQuestion === currentQuiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question →'}
          </button>
        </div>
        <style jsx>{`
          .quiz-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .quiz-container {
            background: rgba(31, 41, 55, 0.9);
            padding: 2rem;
            border-radius: 20px;
            max-width: 800px;
            width: 100%;
            color: white;
          }
          .quiz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .quiz-info {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .quiz-title {
            font-weight: 700;
            font-size: 1.2rem;
          }
          .question-counter {
            font-size: 0.9rem;
            opacity: 0.7;
          }
          .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
          }
          .progress-bar {
            height: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            margin-bottom: 1rem;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(45deg, #10b981, #059669);
            border-radius: 5px;
            transition: width 0.3s ease;
          }
          .pass-requirement {
            background: rgba(245, 158, 11, 0.2);
            border: 1px solid #f59e0b;
            color: #fbbf24;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
            font-weight: 600;
          }
          .question-text {
            margin-bottom: 2rem;
            font-size: 1.3rem;
            line-height: 1.6;
          }
          .answers-grid {
            display: grid;
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .answer-option {
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .answer-option:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #3b82f6;
            transform: translateX(5px);
          }
          .answer-option.selected {
            background: rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          .option-letter {
            width: 40px;
            height: 40px;
            background: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
          }
          .option-text {
            flex: 1;
          }
          .next-btn {
            width: 100%;
            padding: 1.2rem;
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .next-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          }
          .next-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-list-header">
        <button onClick={() => nav(-1)} className="back-btn">← Back</button>
        <h1>📝 Phishing Quizzes</h1>
      </div>
      <div className="quiz-list">
        {quizzes.map((quiz, idx) => (
          <div key={idx} className="quiz-card" onClick={() => startQuiz(quiz)}>
            <div className="quiz-icon">📝</div>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <div className="quiz-meta">
              <span>📊 {quiz.questions?.length || 20} Questions</span>
              <span>⚠️ Pass: 80%</span>
              {quiz.isDemo && <span className="demo-badge">DEMO</span>}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .quiz-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 2rem;
        }
        .quiz-list-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .back-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .quiz-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }
        .quiz-card {
          background: rgba(31, 41, 55, 0.8);
          padding: 2rem;
          border-radius: 16px;
          cursor: pointer;
          transition: transform 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .quiz-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
        }
        .quiz-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .quiz-meta {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
        }
        .demo-badge {
          background: #f59e0b;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
