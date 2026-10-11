# Summary — flaw, exploitation, fix

Final table for the lab (README plan, step 5). Links point to the evidence for each claim.

| # | Flaw | How it was found/exploited | Fix | Commit |
|---|------|------------------------------|-----|--------|
| 1 | JWT accepted without verifying the signature | Manual: edited the base64url payload (`role: "user"` → `"admin"`), kept the stale signature, sent it to `/me` → server returned the forged role. Not caught by the ZAP scan (business-logic flaw). See [exploitation-report.md](exploitation-report.md#flaw-1--jwt-signature-not-verified). | Verify the HMAC signature with `crypto.timingSafeEqual` before trusting the payload; reject on mismatch. | [`097a7ea`](https://github.com/TMseabra/auth-lab/commit/097a7ea) |
| 2 | Admin route (`/admin/users`) had no role check | Manual: sent the forged (or even a normal) token to `/admin/users` → got the full user list with no role check. Not caught by ZAP either. See [exploitation-report.md](exploitation-report.md#flaw-2--admin-route-has-no-role-check). | Added `requireAdmin` middleware that checks `req.user.role === 'admin'`, returns 403 otherwise. | [`89df50b`](https://github.com/TMseabra/auth-lab/commit/89df50b) |
| 3 | Passwords stored and returned in plain text | Manual: dumped `/admin/users` and read `password` in cleartext. ZAP independently flagged this as "Cross Site Scripting Weakness (Persistent in JSON Response)" on the same endpoint — same root cause, sensitive data echoed back unprotected. See [vulnerabilities.md](vulnerabilities.md#owasp-zap-active-scan-automated). | Hash with scrypt + per-user salt (`crypto.scryptSync`); `/admin/users` no longer returns the `password` field at all. | [`4f8195e`](https://github.com/TMseabra/auth-lab/commit/4f8195e) |
| 4 | Login error messages revealed whether an email was registered | Manual: `email not found` (404) vs `wrong password` (401) — two different responses let an attacker enumerate valid accounts. See [exploitation-report.md](exploitation-report.md#flaw-4--user-enumeration-on-login). | Both cases now return the same `401 invalid credentials`. | [`4f8195e`](https://github.com/TMseabra/auth-lab/commit/4f8195e) |

## Tooling coverage

| Tool | What it found | Notes |
|---|---|---|
| Manual (curl) | All 4 planned flaws | Business-logic flaws (JWT bypass, missing role check) need manual/semantic testing — a generic scanner has no concept of "this role shouldn't be here". |
| OWASP ZAP (active scan, headless via Docker) | Missing HTTPS, `X-Powered-By` header, missing `X-Content-Type-Options`, persistent sensitive-data-in-JSON — but **not** flaws 1 or 2 | Full report: [zap-report.html](zap-report.html). See [vulnerabilities.md](vulnerabilities.md) for the breakdown. |
| Burp Suite Community | Not run — the Community edition has no automated scanner (Pro-only); only Proxy/Repeater/Intruder, which need the GUI | Manual walkthrough prepared in [zap-burp-plan.md](zap-burp-plan.md), pending. |
| OWASP Juice Shop | Not started | Separate exercise, pending (README plan step 4). |

## Takeaway

A generic scanner (ZAP) and manual, semantic testing caught different things: ZAP's active scan
found standard hygiene issues (headers, transport, generic injection probes) in ~2 minutes with
zero domain knowledge of the app; the two most serious flaws here — auth bypass via an unverified
JWT and a missing authorization check — were only found by reading the code/requests and testing
the actual business logic by hand. Both layers matter in a real review.
