const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dhruvix-secret';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  /\.vercel\.app$/,                 // all *.vercel.app preview + production URLs
  process.env.FRONTEND_URL,         // set this to your custom domain e.g. https://dhruvix.tech
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow server-to-server / curl
    const ok = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(ok ? null : new Error('CORS blocked'), ok);
  },
  credentials: true,
}));
app.use(express.json());


// ── MongoDB Connection ──────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dhruvix')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ── Models ──────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, sparse: true, lowercase: true },
  phone: { type: String, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

const LeadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: { type: String, required: true },
  email: String,
  service: String,
  message: String,
  status: { type: String, enum: ['pending', 'in_progress', 'done'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});
const Lead = mongoose.model('Lead', LeadSchema);

// ── OTP Store (in-memory) ────────────────────────────────────────
const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const storeOTP = (key, otp) => otpStore.set(key, { otp, expires: Date.now() + 5 * 60 * 1000 });
const verifyOTP = (key, otp) => {
  const r = otpStore.get(key);
  if (!r || Date.now() > r.expires) { otpStore.delete(key); return false; }
  if (r.otp !== otp) return false;
  otpStore.delete(key);
  return true;
};

// ── OTP Delivery ─────────────────────────────────────────────────
async function sendEmailOTP(email, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [DEV MODE] Email OTP for ${email}: ${otp}\n`);
    return;
  }
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
  await t.sendMail({
    from: `"Dhruvix" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Dhruvix Verification Code',
    html: `<div style="background:#05030f;color:#f0ebff;padding:40px;font-family:sans-serif;border-radius:16px;max-width:400px;margin:auto;border:1px solid rgba(168,85,247,0.2)">
      <h2 style="color:#a855f7;letter-spacing:6px;margin:0 0 20px">DHRUVIX</h2>
      <p style="color:rgba(240,235,255,0.6)">Your one-time verification code:</p>
      <div style="font-size:48px;font-weight:900;letter-spacing:14px;color:#a855f7;text-align:center;padding:24px 0">${otp}</div>
      <p style="color:rgba(240,235,255,0.3);font-size:12px">Expires in 5 minutes. Never share this code.</p>
    </div>`,
  });
}

async function sendSMSOTP(phone, otp) {
  if (!process.env.FAST2SMS_KEY) {
    console.log(`\n📱 [DEV MODE] SMS OTP for ${phone}: ${otp}\n`);
    return;
  }
  const num = phone.replace(/\D/g, '').slice(-10);
  await axios.post('https://www.fast2sms.com/dev/bulkV2',
    { route: 'otp', variables_values: otp, numbers: num },
    { headers: { authorization: process.env.FAST2SMS_KEY } }
  );
}

// ── Auth Middleware ───────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};
// Optional auth — attaches user if token present but doesn't block
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch {} }
  next();
};

// ── Routes ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Dhruvix API running' }));

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { method, value } = req.body;
  if (!method || !value) return res.status(400).json({ error: 'method and value are required' });
  const otp = generateOTP();
  storeOTP(value.toLowerCase(), otp);
  try {
    if (method === 'email') await sendEmailOTP(value, otp);
    else await sendSMSOTP(value, otp);
    res.json({ success: true, message: `OTP sent to your ${method === 'email' ? 'email' : 'mobile'}` });
  } catch (err) {
    console.error('OTP send error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Check server config.' });
  }
});

// Verify OTP → login or register
app.post('/api/auth/verify-otp', async (req, res) => {
  const { method, value, otp, name } = req.body;
  if (!verifyOTP(value.toLowerCase(), otp)) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }
  const query = method === 'email' ? { email: value.toLowerCase() } : { phone: value };
  let user = await User.findOne(query);
  if (!user) {
    const isAdmin = value.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase()
      || value === process.env.ADMIN_PHONE;
    user = await User.create({
      name: name || (method === 'email' ? value.split('@')[0] : 'User'),
      [method === 'email' ? 'email' : 'phone']: method === 'email' ? value.toLowerCase() : value,
      role: isAdmin ? 'admin' : 'user',
    });
  }
  const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});

// Current user
app.get('/api/user/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-__v');
  res.json(user);
});

// User's enquiries
app.get('/api/user/enquiries', authMiddleware, async (req, res) => {
  const leads = await Lead.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(leads);
});

// Submit enquiry (phone required, auth optional)
app.post('/api/contact', optionalAuth, async (req, res) => {
  const { name, phone, service, message, email } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  const lead = await Lead.create({
    userId: req.user?.id || null,
    name: name || req.user?.name || 'Unknown',
    phone,
    email: email || '',
    service: service || 'Not specified',
    message: message || '',
  });
  console.log(`\n✅ New enquiry: ${lead.name} — ${lead.phone} [${lead.service}]`);
  res.json({ success: true, lead });
});

// Admin routes
app.get('/api/admin/stats', authMiddleware, adminOnly, async (req, res) => {
  const [totalUsers, totalLeads, pendingLeads] = await Promise.all([
    User.countDocuments(),
    Lead.countDocuments(),
    Lead.countDocuments({ status: 'pending' }),
  ]);
  res.json({ totalUsers, totalLeads, pendingLeads });
});

app.get('/api/admin/users', authMiddleware, adminOnly, async (req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }));
});

app.get('/api/admin/leads', authMiddleware, adminOnly, async (req, res) => {
  res.json(await Lead.find().populate('userId', 'name email phone').sort({ createdAt: -1 }));
});

app.patch('/api/admin/leads/:id', authMiddleware, adminOnly, async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(lead);
});

app.delete('/api/admin/users/:id', authMiddleware, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ── Start server (local dev only — Vercel imports this as a module) ──
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Dhruvix server → http://localhost:${PORT}`);
    console.log(`📧 Email OTP: ${process.env.EMAIL_USER ? 'ENABLED' : 'DEV (check console)'}`);
    console.log(`📱 SMS OTP:   ${process.env.FAST2SMS_KEY ? 'ENABLED' : 'DEV (check console)'}\n`);
  });
}

module.exports = app;
