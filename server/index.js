require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Session store
const SQLiteStore = require('connect-sqlite3')(session);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: DATA_DIR }),
  secret: process.env.SESSION_SECRET || 'changeme-please',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Auth routes (no auth required)
app.use('/api/auth', require('./routes/auth'));

// All API routes require auth
app.use('/api', requireAuth);
app.use('/api/locations', require('./routes/locations'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/ports', require('./routes/ports'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/vlans', require('./routes/vlans'));
app.use('/api/search', require('./routes/search'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/device-templates', require('./routes/deviceTemplates'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/power', require('./routes/power'));
app.use('/api/history', require('./routes/history'));
app.use('/api/health', require('./routes/health'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/export', require('./routes/importExport'));
app.use('/api/import', require('./routes/importExport'));

// Serve React app
const publicDir = path.resolve(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.json({ status: 'CableMap API running. Build frontend with: cd client && npm run build' }));
}

app.listen(PORT, () => {
  console.log(`CableMap running on http://localhost:${PORT}`);
});
