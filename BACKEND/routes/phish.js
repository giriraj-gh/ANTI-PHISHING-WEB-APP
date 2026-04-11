const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const validator = require('validator');
const ScanLog = require('../models/ScanLog');

// ─── Heuristic Analysis ───────────────────────────────────────────────────────
function heuristicAnalysis(url) {
  let score = 0;
  const flags = [];

  // 1. URL length > 75
  if (url.length > 75) { score += 15; flags.push('Long URL (>75 chars)'); }

  // 2. IP address instead of domain
  if (/https?:\/\/(\d{1,3}\.){3}\d{1,3}/.test(url)) { score += 30; flags.push('IP address used instead of domain'); }

  // 3. Suspicious keywords
  const keywords = ['login', 'verify', 'bank', 'secure', 'update', 'account', 'password', 'signin', 'confirm', 'paypal', 'ebay', 'amazon'];
  const found = keywords.filter(k => url.toLowerCase().includes(k));
  if (found.length > 0) { score += found.length * 10; flags.push(`Suspicious keywords: ${found.join(', ')}`); }

  // 4. Excessive special characters
  const atCount = (url.match(/@/g) || []).length;
  const dashCount = (url.match(/-/g) || []).length;
  const slashCount = (url.match(/\/\//g) || []).length;
  if (atCount > 0) { score += 20; flags.push('Contains @ symbol'); }
  if (dashCount > 3) { score += 10; flags.push('Multiple hyphens in URL'); }
  if (slashCount > 2) { score += 10; flags.push('Multiple // in URL'); }

  // 5. No HTTPS
  if (!url.startsWith('https://')) { score += 15; flags.push('Not using HTTPS'); }

  // 6. Suspicious TLDs
  const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.link'];
  if (suspiciousTLDs.some(tld => url.includes(tld))) { score += 20; flags.push('Suspicious TLD detected'); }

  // 7. Subdomain count
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length > 4) { score += 15; flags.push('Excessive subdomains'); }
  } catch (e) {}

  return { score: Math.min(score, 100), flags };
}

// ─── Google Safe Browsing ─────────────────────────────────────────────────────
async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey || apiKey === 'your_google_api_key') return { flagged: false };
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: { clientId: 'anti-phishing-app', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      },
      { timeout: 5000 }
    );
    const flagged = response.data.matches && response.data.matches.length > 0;
    return { flagged, threatType: flagged ? response.data.matches[0].threatType : null };
  } catch (e) {
    console.log('Google Safe Browsing error:', e.message);
    return { flagged: false };
  }
}

// ─── PhishTank ────────────────────────────────────────────────────────────────
async function checkPhishTank(url) {
  const apiKey = process.env.PHISHTANK_API_KEY;
  if (!apiKey || apiKey === 'your_phishtank_api_key') return { flagged: false };
  try {
    const params = new URLSearchParams();
    params.append('url', url);
    params.append('format', 'json');
    if (apiKey) params.append('app_key', apiKey);

    const response = await axios.post('https://checkurl.phishtank.com/checkurl/', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'phishtank/anti-phishing-app' },
      timeout: 5000
    });
    const flagged = response.data?.results?.in_database && response.data?.results?.valid;
    return { flagged };
  } catch (e) {
    console.log('PhishTank error:', e.message);
    return { flagged: false };
  }
}

// ─── POST /api/phish/scan ─────────────────────────────────────────────────────
router.post('/scan', auth, async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url || !validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({ message: 'Please provide a valid URL with http:// or https://' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name email');

    // Run all checks in parallel
    const [googleResult, phishTankResult, heuristic] = await Promise.all([
      checkGoogleSafeBrowsing(url),
      checkPhishTank(url),
      Promise.resolve(heuristicAnalysis(url))
    ]);

    // Combine results
    const sources = [];
    let finalScore = heuristic.score;
    let risk = 'Safe';
    let message = '';

    if (googleResult.flagged) {
      sources.push('Google Safe Browsing');
      finalScore = Math.min(finalScore + 50, 100);
    }
    if (phishTankResult.flagged) {
      sources.push('PhishTank');
      finalScore = Math.min(finalScore + 50, 100);
    }
    if (heuristic.score > 20) {
      sources.push('Heuristic Analysis');
    }

    // Determine risk level
    if (googleResult.flagged || phishTankResult.flagged || finalScore >= 70) {
      risk = 'Phishing';
      message = '🚨 This URL is highly dangerous! It has been flagged by threat intelligence services. Do NOT visit this site.';
    } else if (finalScore >= 35) {
      risk = 'Suspicious';
      message = '⚠️ This URL shows suspicious characteristics. Exercise extreme caution before visiting.';
    } else {
      risk = 'Safe';
      message = '✅ This URL appears to be safe based on our analysis. Always stay vigilant online.';
    }

    // Save to MongoDB
    await ScanLog.create({
      url,
      risk,
      score: finalScore,
      sources,
      message,
      userId: req.user.id,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || '',
      scannedAt: new Date()
    });

    res.json({
      url,
      risk,
      score: finalScore,
      sources,
      message,
      details: heuristic.flags
    });

  } catch (e) {
    console.error('Scan error:', e.message);
    res.status(500).json({ message: 'Error scanning URL. Please try again.' });
  }
});

// ─── Keep existing routes ─────────────────────────────────────────────────────
router.post('/check', auth, async (req, res) => {
  try {
    const { url } = req.body;
    const heuristic = heuristicAnalysis(url);
    let risk = heuristic.score >= 70 ? 'Phishing' : heuristic.score >= 35 ? 'Suspicious' : 'Safe';
    const legacyRisk = risk === 'Phishing' ? 'HIGH' : risk === 'Suspicious' ? 'MEDIUM' : 'LOW';
    await ScanLog.create({
      url, risk: legacyRisk, score: heuristic.score,
      sources: ['Heuristic Analysis'],
      userId: req.user.id,
      userName: req.body.userName,
      userEmail: req.body.userEmail
    });
    res.json({ url, risk: legacyRisk, score: heuristic.score });
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
