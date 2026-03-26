const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/all', async (req, res) => {
  const Lesson = require('../models/Lesson');
  try {
    const lessons = await Lesson.find().sort({ createdAt: 1 });
    res.json(lessons);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/create', auth, async (req, res) => {
  const Lesson = require('../models/Lesson');
  try {
    const lesson = await Lesson.create({ ...req.body, status: 'active' });
    res.json(lesson);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const Lesson = require('../models/Lesson');
  try {
    await Lesson.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Lesson updated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const Lesson = require('../models/Lesson');
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/activate/:id', auth, async (req, res) => {
  const Lesson = require('../models/Lesson');
  try {
    await Lesson.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.json({ message: 'Lesson activated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
