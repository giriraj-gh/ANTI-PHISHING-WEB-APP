const router = require('express').Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');

router.get('/all', async (req, res) => {
  try {
    res.json(await Quiz.find().sort({ createdAt: 1 }));
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/create', auth, async (req, res) => {
  try {
    res.json(await Quiz.create({ ...req.body, status: 'active' }));
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// activate MUST be before /:id to avoid conflict
router.put('/activate/:id', auth, async (req, res) => {
  try {
    await Quiz.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.json({ message: 'Quiz launched successfully' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    await Quiz.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Quiz updated' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
