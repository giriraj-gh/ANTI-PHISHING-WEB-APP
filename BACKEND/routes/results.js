const router = require('express').Router();
const auth = require('../middleware/auth');

router.post('/save', auth, async (req, res) => {
  const QuizResult = require('../models/QuizResult');
  try {
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
    const results = await QuizResult.find(filter).sort({ createdAt: -1 });
    res.json(results);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
