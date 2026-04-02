const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/all', async (req, res) => {
  const Quiz = require('../models/Quiz');
  try {
    const quizzes = await Quiz.find().sort({ createdAt: 1 });
    res.json(quizzes);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/create', auth, async (req, res) => {
  const Quiz = require('../models/Quiz');
  try {
    const quiz = await Quiz.create(req.body);
    res.json(quiz);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/activate/:id', auth, async (req, res) => {
  const Quiz = require('../models/Quiz');
  try {
    await Quiz.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.json({ message: 'Quiz activated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const Quiz = require('../models/Quiz');
  try {
    await Quiz.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Quiz updated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const Quiz = require('../models/Quiz');
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
