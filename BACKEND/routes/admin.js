const router = require('express').Router();
const User = require('../models/User');
const ScanLog = require('../models/ScanLog');
const auth = require('../middleware/auth');

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pending-users', auth, async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password');
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/approve-user/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: 'User approved' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/reject-user/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ message: 'User rejected' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const logs = await ScanLog.find();
    const high = logs.filter(s => s.risk === 'HIGH').length;
    const medium = logs.filter(s => s.risk === 'MEDIUM').length;
    const low = logs.filter(s => s.risk === 'LOW').length;
    res.json({ high, medium, low });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
