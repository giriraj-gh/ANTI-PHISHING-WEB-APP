const router = require('express').Router();
const auth = require('../middleware/auth');
const Lesson = require('../models/Lesson');

router.get('/all', async (req, res) => {
  try {
    res.json(await Lesson.find().sort({ createdAt: 1 }));
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/create', auth, async (req, res) => {
  try {
    res.json(await Lesson.create(req.body));
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// activate MUST be before /:id to avoid conflict
router.put('/activate/:id', auth, async (req, res) => {
  try {
    await Lesson.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.json({ message: 'Lesson launched successfully' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    await Lesson.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Lesson updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
