# Vulnerabilities and fixes

All four flaws below are now fixed in the current code. Use `git log` to check out the vulnerable version (commit `483ed2d`) for attacking.

| # | Flaw | Where | How to exploit | Fix (applied) |
|---|------|-------|----------------|---------------|
| 1 | JWT signature not verified | `auth()` in src/server.js | Edit the payload (e.g. `"role":"admin"`), keep any signature, send it | Verify with `crypto`/`jsonwebtoken`, reject bad signatures |
| 2 | Admin route without role check | `GET /admin/users` | Call it with any valid (or forged) token | Require `role === 'admin'` |
| 3 | Plain text passwords | `POST /register` | Dump `/admin/users` and read passwords | Hash with bcrypt/argon2 |
| 4 | User enumeration | `POST /login` | `404 email not found` vs `401 wrong password` | Same generic error for both |

Manual exploitation evidence (curl, run by hand against commit `483ed2d`) is in
[exploitation-report.md](exploitation-report.md).

## OWASP ZAP active scan (automated)

Run headlessly via Docker (`ghcr.io/zaproxy/zaproxy:stable`, `zap-baseline`-style active scan)
against the vulnerable server on `localhost`. Full HTML report: [zap-report.html](zap-report.html),
raw alerts: [zap-alerts.json](zap-alerts.json).

| Risk | Alert | Endpoint | Note |
|---|---|---|---|
| Medium | HTTP Only Site | `/login` | No TLS — expected for a localhost lab, would matter in any real deployment |
| Low | Server Leaks Information via "X-Powered-By" Header | `/me` | Express version fingerprinting |
| Low | X-Content-Type-Options Header Missing | `/register` | Missing `nosniff`, allows MIME-sniffing in old browsers |
| Low | Cross Site Scripting Weakness (Persistent in JSON Response) | `/admin/users` | ZAP flags that the stored `password`/`email` values are reflected unsanitized in JSON — same root cause as flaw 3 (plaintext passwords stored and echoed back) |
| Informational | Authentication/Session Management Request Identified | `/login` | ZAP correctly recognized the login flow and the token in the response |
| Informational | User Agent Fuzzer | `/register` | No behavior difference found across user agents |

ZAP's generic scanner does **not** catch flaws 1 and 2 (JWT signature bypass, missing admin role
check) — those are business-logic flaws, not patterns a generic scanner looks for. That's exactly
why the manual exploitation in [exploitation-report.md](exploitation-report.md) matters: automated
scanning and manual testing find different things, and a real pentest needs both.

## Burp Suite

Burp Suite **Community** edition has no automated active scanner (that's a Pro-only feature) —
only manual tools (Proxy, Repeater, Intruder) that need the GUI. See
[zap-burp-plan.md](zap-burp-plan.md) for the manual walkthrough (JWT Editor extension, Repeater,
Intruder for the enumeration attack).
