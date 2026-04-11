const router = require('express').Router();
const auth = require('../middleware/auth');

const COOLDOWN_MINUTES = 30;

router.post('/save', auth, async (req, res) => {
  const QuizResult = require('../models/QuizResult');
  const User = require('../models/User');
  try {
    const { quizTitle, quizId } = req.body;
    const user = await User.findById(req.user.id);

    // Quiz cooldown check
    if (quizId) {
      const lastAttempt = user.quizCooldowns?.get(quizId);
      if (lastAttempt) {
        const diffMs = Date.now() - new Date(lastAttempt).getTime();
        const diffMin = diffMs / 60000;
        if (diffMin < COOLDOWN_MINUTES) {
          const remaining = Math.ceil(COOLDOWN_MINUTES - diffMin);
          return res.status(429).json({ message: `Please wait ${remaining} more minute(s) before retrying this quiz.`, cooldown: true, remaining });
        }
      }
      // Update cooldown
      await User.findByIdAndUpdate(req.user.id, { [`quizCooldowns.${quizId}`]: new Date() });
    }

    await QuizResult.create({ ...req.body, userId: req.user.id });
    res.json({ message: 'Result saved' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', auth, async (req, res) => {
  const QuizResult = require('../models/QuizResult');
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const results = await QuizResult.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(results);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/leaderboard/:quizTitle', auth, async (req, res) => {
  const QuizResult = require('../models/QuizResult');
  try {
    const title = decodeURIComponent(req.params.quizTitle);
    const results = await QuizResult.find({ quizTitle: title }).sort({ score: -1, createdAt: 1 }).limit(10);
    res.json(results);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Check cooldown status ─────────────────────────────────────────────────────
router.get('/cooldown/:quizId', auth, async (req, res) => {
  const User = require('../models/User');
  try {
    const user = await User.findById(req.user.id);
    const lastAttempt = user.quizCooldowns?.get(req.params.quizId);
    if (!lastAttempt) return res.json({ canAttempt: true });
    const diffMin = (Date.now() - new Date(lastAttempt).getTime()) / 60000;
    if (diffMin >= COOLDOWN_MINUTES) return res.json({ canAttempt: true });
    res.json({ canAttempt: false, remaining: Math.ceil(COOLDOWN_MINUTES - diffMin) });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
