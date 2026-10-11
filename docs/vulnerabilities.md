# Vulnerabilities and fixes

All four flaws below are now fixed in the current code. Use `git log` to check out the vulnerable version (commit `483ed2d`) for attacking.

| # | Flaw | Where | How to exploit | Fix (applied) |
|---|------|-------|----------------|---------------|
| 1 | JWT signature not verified | `auth()` in src/server.js | Edit the payload (e.g. `"role":"admin"`), keep any signature, send it | Verify with `crypto`/`jsonwebtoken`, reject bad signatures |
| 2 | Admin route without role check | `GET /admin/users` | Call it with any valid (or forged) token | Require `role === 'admin'` |
| 3 | Plain text passwords | `POST /register` | Dump `/admin/users` and read passwords | Hash with bcrypt/argon2 |
| 4 | User enumeration | `POST /login` | `404 email not found` vs `401 wrong password` | Same generic error for both |

Manual exploitation evidence (curl, run by hand against commit `483ed2d`) is in
[exploitation-report.md](exploitation-report.md). ZAP/Burp findings will be added here as the lab
progresses.
