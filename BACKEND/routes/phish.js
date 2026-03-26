const router = require('express').Router();
const ScanLog = require('../models/ScanLog');
const auth = require('../middleware/auth');

router.post('/check', auth, async (req, res) => {
  try {
    const { url } = req.body;
    const risk = url.includes('fake') || url.includes('phish') ? 'HIGH' :
                 url.includes('suspicious') ? 'MEDIUM' : 'LOW';
    const score = risk === 'HIGH' ? 100 : risk === 'MEDIUM' ? 50 : 0;
    await ScanLog.create({ url, risk, score, userId: req.user.id, userName: req.body.userName, userEmail: req.body.userEmail });
    res.json({ url, risk, score });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const logs = await ScanLog.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/report', auth, async (req, res) => {
  res.json({ message: 'Report submitted successfully' });
});

module.exports = router;
