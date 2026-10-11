# auth-lab

> **WARNING:** this repository is intentionally vulnerable. It exists for learning only. Never use this code in production.

An attack-and-defense lab: a deliberately insecure version of an authentication API, attacked with real tools and fixed step by step. It complements the [auth-api](https://github.com/TMseabra/auth-api) project.

> Status: vulnerable API built, all 4 flaws fixed, ZAP active scan done. Next: Burp Suite manual pass and Juice Shop.

## Goal

Show the full security cycle: find flaws, exploit them, document them and fix them. The commit history acts as the "before and after".

## Planned flaws (on purpose)

- JWT accepted without verifying the signature
- Admin routes without a role check
- Passwords stored in plain text
- Error messages that reveal whether an email exists

## Tools

- OWASP ZAP
- Burp Suite Community
- OWASP Juice Shop (short separate report)

## Plan

1. Build the vulnerable version (simplified base of auth-api)
2. Attack it with ZAP and Burp Suite and document each flaw found
3. Fix them one by one, in separate commits
4. Complete OWASP Juice Shop and write a short report
5. Summarise everything in a table: flaw, how it was exploited, fix

## Running the vulnerable API

```
npm install
npm start   # http://127.0.0.1:3000 (set ADMIN_PASSWORD to seed admin@lab.local)
```

Endpoints: `POST /register`, `POST /login`, `GET /me`, `GET /admin/users`. Flaws are listed in [docs/vulnerabilities.md](docs/vulnerabilities.md).

## Reports

- [docs/vulnerabilities.md](docs/vulnerabilities.md) — each flaw, where it lives, and the ZAP active scan findings
- [docs/exploitation-report.md](docs/exploitation-report.md) — manual exploitation of the 4 flaws with curl
- [docs/zap-report.html](docs/zap-report.html) / [docs/zap-alerts.json](docs/zap-alerts.json) — full OWASP ZAP active scan report
- [docs/zap-burp-plan.md](docs/zap-burp-plan.md) — manual Burp Suite walkthrough (pending, needs the GUI)
- [docs/summary.md](docs/summary.md) — final table: flaw, exploitation, fix, tooling coverage

## Legal notice

Only test against environments you own (localhost). Attacking third-party systems without permission is illegal.
