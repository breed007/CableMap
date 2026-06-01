const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'changeme';

  if (username !== expectedUser) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Support both plaintext (default) and bcrypt hashed passwords
  let valid = false;
  if (expectedPass.startsWith('$2b$') || expectedPass.startsWith('$2a$')) {
    valid = await bcrypt.compare(password, expectedPass);
  } else {
    valid = password === expectedPass;
  }

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.authenticated = true;
  req.session.username = username;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({ authenticated: true, username: req.session.username });
  }
  res.json({ authenticated: false });
});

module.exports = router;
