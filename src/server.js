// WARNING: intentionally vulnerable. For learning only. Never use in production.
const crypto = require('crypto');
const express = require('express');

const app = express();
app.use(express.json());

const SECRET = 'secret';
const users = []; // in-memory store: { id, email, password, role }

// Seed an admin from the environment (there is no way to become admin via the API).
if (process.env.ADMIN_PASSWORD) {
  users.push({ id: 1, email: 'admin@lab.local', password: hashPassword(process.env.ADMIN_PASSWORD), role: 'admin' });
}

// FIXED 3: passwords are hashed with scrypt and a per-user salt.
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return `${salt.toString('hex')}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const actual = crypto.scryptSync(password, Buffer.from(salt, 'hex'), 64);
  return crypto.timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

function signToken(payload) {
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

function verifyToken(token) {
  const [head, body, sig] = token.split('.');
  if (!head || !body || !sig) throw new Error('malformed');
  const expected = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) throw new Error('bad signature');
  return JSON.parse(Buffer.from(body, 'base64url').toString());
}

// FIXED 1: the signature is verified before trusting the payload.
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

app.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: 'email already registered' });
  const user = { id: users.length + 1, email, password: hashPassword(password), role: 'user' };
  users.push(user);
  res.status(201).json({ id: user.id, email: user.email });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);
  // FIXED 4: same error whether the email or the password is wrong.
  if (!user || !checkPassword(password, user.password)) return res.status(401).json({ error: 'invalid credentials' });
  res.json({ token: signToken({ sub: user.id, email: user.email, role: user.role }) });
});

app.get('/me', auth, (req, res) => res.json(req.user));

// FIXED 2: only admins may list users.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

app.get('/admin/users', auth, requireAdmin, (req, res) =>
  res.json(users.map(({ id, email, role }) => ({ id, email, role }))));

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => console.log(`auth-lab (VULNERABLE) on http://127.0.0.1:${port}`));
