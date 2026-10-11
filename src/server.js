// WARNING: intentionally vulnerable. For learning only. Never use in production.
const crypto = require('crypto');
const express = require('express');

const app = express();
app.use(express.json());

const SECRET = 'secret';
const users = []; // in-memory store: { id, email, password, role }

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

function signToken(payload) {
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

// FLAW 1: the token payload is decoded but the signature is never verified.
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  try {
    req.user = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

app.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: 'email already registered' });
  // FLAW 3: password stored in plain text.
  const user = { id: users.length + 1, email, password, role: 'user' };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  // FLAW 4: different errors reveal whether the email exists (user enumeration).
  if (!user) return res.status(404).json({ error: 'email not found' });
  if (user.password !== password) return res.status(401).json({ error: 'wrong password' });
  res.json({ token: signToken({ sub: user.id, email: user.email, role: user.role }) });
});

app.get('/me', auth, (req, res) => res.json(req.user));

// FLAW 2: admin route only checks that a token exists, never the role.
app.get('/admin/users', auth, (req, res) => res.json(users));

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => console.log(`auth-lab (VULNERABLE) on http://127.0.0.1:${port}`));
