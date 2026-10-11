# Vulnerabilities (before fixing)

| # | Flaw | Where | How to exploit | Fix (planned) |
|---|------|-------|----------------|---------------|
| 1 | JWT signature not verified | `auth()` in src/server.js | Edit the payload (e.g. `"role":"admin"`), keep any signature, send it | Verify with `crypto`/`jsonwebtoken`, reject bad signatures |
| 2 | Admin route without role check | `GET /admin/users` | Call it with any valid (or forged) token | Require `role === 'admin'` |
| 3 | Plain text passwords | `POST /register` | Dump `/admin/users` and read passwords | Hash with bcrypt/argon2 |
| 4 | User enumeration | `POST /login` | `404 email not found` vs `401 wrong password` | Same generic error for both |

ZAP/Burp findings will be added here as the lab progresses.
