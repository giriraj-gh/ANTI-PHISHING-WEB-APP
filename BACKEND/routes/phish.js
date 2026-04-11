const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const validator = require('validator');
const ScanLog = require('../models/ScanLog');

// ── Heuristic Analysis ────────────────────────────────────────────────────────
function heuristicAnalysis(url) {
  let score = 0;
  const flags = [];
  if (url.length > 75) { score += 15; flags.push('Long URL (>75 chars)'); }
  if (/https?:\/\/(\d{1,3}\.){3}\d{1,3}/.test(url)) { score += 30; flags.push('IP address used instead of domain'); }
  const keywords = ['login', 'verify', 'bank', 'secure', 'update', 'account', 'password', 'signin', 'confirm', 'paypal', 'ebay', 'amazon'];
  const found = keywords.filter(k => url.toLowerCase().includes(k));
  if (found.length > 0) { score += found.length * 10; flags.push(`Suspicious keywords: ${found.join(', ')}`); }
  const atCount = (url.match(/@/g) || []).length;
  const dashCount = (url.match(/-/g) || []).length;
  const slashCount = (url.match(/\/\//g) || []).length;
  if (atCount > 0) { score += 20; flags.push('Contains @ symbol'); }
  if (dashCount > 3) { score += 10; flags.push('Multiple hyphens in URL'); }
  if (slashCount > 2) { score += 10; flags.push('Multiple // in URL'); }
  if (!url.startsWith('https://')) { score += 15; flags.push('Not using HTTPS'); }
  const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.link'];
  if (suspiciousTLDs.some(tld => url.includes(tld))) { score += 20; flags.push('Suspicious TLD detected'); }
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length > 4) { score += 15; flags.push('Excessive subdomains'); }
  } catch (e) {}
  return { score: Math.min(score, 100), flags };
}

// ── Google Safe Browsing ──────────────────────────────────────────────────────
async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey || apiKey === 'your_google_api_key') return { flagged: false };
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      { client: { clientId: 'anti-phishing-app', clientVersion: '1.0.0' },
        threatInfo: { threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'], threatEntryTypes: ['URL'], threatEntries: [{ url }] } },
      { timeout: 5000 }
    );
    const flagged = response.data.matches && response.data.matches.length > 0;
    return { flagged, threatType: flagged ? response.data.matches[0].threatType : null };
  } catch (e) { return { flagged: false }; }
}

// ── PhishTank ─────────────────────────────────────────────────────────────────
async function checkPhishTank(url) {
  const apiKey = process.env.PHISHTANK_API_KEY;
  if (!apiKey || apiKey === 'your_phishtank_api_key') return { flagged: false };
  try {
    const params = new URLSearchParams();
    params.append('url', url); params.append('format', 'json');
    if (apiKey) params.append('app_key', apiKey);
    const response = await axios.post('https://checkurl.phishtank.com/checkurl/', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'phishtank/anti-phishing-app' },
      timeout: 5000
    });
    return { flagged: response.data?.results?.in_database && response.data?.results?.valid };
  } catch (e) { return { flagged: false }; }
}

// ── VirusTotal ────────────────────────────────────────────────────────────────
async function checkVirusTotal(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey || apiKey === 'your_virustotal_api_key') return { flagged: false };
  try {
    // Submit URL for analysis
    const submitRes = await axios.post('https://www.virustotal.com/api/v3/urls',
      new URLSearchParams({ url }),
      { headers: { 'x-apikey': apiKey, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
    );
    const analysisId = submitRes.data?.data?.id;
    if (!analysisId) return { flagged: false };
    // Get analysis result
    await new Promise(r => setTimeout(r, 2000)); // wait 2s for analysis
    const resultRes = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { 'x-apikey': apiKey }, timeout: 8000 }
    );
    const stats = resultRes.data?.data?.attributes?.stats;
    const malicious = (stats?.malicious || 0) + (stats?.suspicious || 0);
    return { flagged: malicious >= 2, maliciousCount: malicious };
  } catch (e) { return { flagged: false }; }
}

// ── Shared scan logic ─────────────────────────────────────────────────────────
async function performScan(url, userId, userName, userEmail) {
  const [googleResult, phishTankResult, virusTotalResult, heuristic] = await Promise.all([
    checkGoogleSafeBrowsing(url),
    checkPhishTank(url),
    checkVirusTotal(url),
    Promise.resolve(heuristicAnalysis(url))
  ]);

  const sources = [];
  let finalScore = heuristic.score;

  if (googleResult.flagged) { sources.push('Google Safe Browsing'); finalScore = Math.min(finalScore + 50, 100); }
  if (phishTankResult.flagged) { sources.push('PhishTank'); finalScore = Math.min(finalScore + 50, 100); }
  if (virusTotalResult.flagged) { sources.push('VirusTotal'); finalScore = Math.min(finalScore + 40, 100); }
  if (heuristic.score > 20) sources.push('Heuristic Analysis');

  let risk, message;
  if (googleResult.flagged || phishTankResult.flagged || virusTotalResult.flagged || finalScore >= 70) {
    risk = 'Phishing';
    message = '🚨 This URL is highly dangerous! Flagged by threat intelligence services. Do NOT visit this site.';
  } else if (finalScore >= 35) {
    risk = 'Suspicious';
    message = '⚠️ This URL shows suspicious characteristics. Exercise extreme caution before visiting.';
  } else {
    risk = 'Safe';
    message = '✅ This URL appears to be safe based on our analysis. Always stay vigilant online.';
  }

  await ScanLog.create({ url, risk, score: finalScore, sources, message, userId, userName, userEmail, scannedAt: new Date() });

  return { url, risk, score: finalScore, sources, message, details: heuristic.flags };
}

// ── POST /api/phish/scan ──────────────────────────────────────────────────────
router.post('/scan', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !validator.isURL(url, { require_protocol: true }))
      return res.status(400).json({ message: 'Please provide a valid URL with http:// or https://' });
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name email');
    const result = await performScan(url, req.user.id, user?.name, user?.email);
    res.json(result);
  } catch (e) {
    console.error('Scan error:', e.message);
    res.status(500).json({ message: 'Error scanning URL. Please try again.' });
  }
});

// ── POST /api/phish/bulk-scan ─────────────────────────────────────────────────
router.post('/bulk-scan', auth, async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0)
      return res.status(400).json({ message: 'Please provide an array of URLs.' });
    if (urls.length > 10)
      return res.status(400).json({ message: 'Maximum 10 URLs per bulk scan.' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name email');

    const validUrls = urls.filter(u => validator.isURL(u, { require_protocol: true }));
    if (validUrls.length === 0)
      return res.status(400).json({ message: 'No valid URLs provided.' });

    const results = await Promise.all(
      validUrls.map(url => performScan(url, req.user.id, user?.name, user?.email).catch(e => ({
        url, risk: 'Error', score: 0, sources: [], message: 'Failed to scan this URL.', details: []
      })))
    );
    res.json(results);
  } catch (e) {
    res.status(500).json({ message: 'Bulk scan error. Please try again.' });
  }
});

// ── GET /api/phish/all (with pagination) ──────────────────────────────────────
router.get('/all', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 = no limit (backward compat)
    const query = ScanLog.find(filter).sort({ createdAt: -1 });
    if (limit > 0) {
      const total = await ScanLog.countDocuments(filter);
      const logs = await query.skip((page - 1) * limit).limit(limit);
      return res.json({ logs, total, page, pages: Math.ceil(total / limit) });
    }
    const logs = await query;
    res.json(logs);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Legacy /check ─────────────────────────────────────────────────────────────
router.post('/check', auth, async (req, res) => {
  try {
    const { url } = req.body;
    const heuristic = heuristicAnalysis(url);
    let risk = heuristic.score >= 70 ? 'Phishing' : heuristic.score >= 35 ? 'Suspicious' : 'Safe';
    await ScanLog.create({ url, risk, score: heuristic.score, sources: ['Heuristic Analysis'], userId: req.user.id, userName: req.body.userName, userEmail: req.body.userEmail });
    res.json({ url, risk, score: heuristic.score });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/report', auth, async (req, res) => {
  res.json({ message: 'Report submitted successfully' });
});

module.exports = router;
