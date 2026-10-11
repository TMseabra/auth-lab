# ZAP / Burp Suite — roteiro de ataque

Pré-requisito: subir a versão vulnerável em outro worktree, sem tocar no `main` atual (que já tem
os 4 fixes).

```
git worktree add ../auth-lab-vuln 483ed2d
cd ../auth-lab-vuln
npm install
npm start     # http://127.0.0.1:3000
```

Ao terminar, remover o worktree: `git worktree remove ../auth-lab-vuln`.

## 1. Mapear a API (ambas as ferramentas)

- **ZAP:** aba "Manual Explore" ou configure o navegador com o proxy do ZAP (`127.0.0.1:8080`) e
  bata nos 4 endpoints uma vez cada (`POST /register`, `POST /login`, `GET /me`,
  `GET /admin/users`) para popular o "Sites" tree.
- **Burp:** configure o navegador/`curl --proxy 127.0.0.1:8080` e repita o mesmo, para popular o
  "HTTP history" do Proxy.

## 2. Flaw 1 — JWT sem verificação de assinatura

- **Burp:** instale a extensão **JWT Editor** (BApp Store). Capture a resposta de `/login` no
  Proxy/Repeater, extraia o token, mande pro Repeater, edite o payload (`"role":"admin"`) na aba
  JSON Web Token, **sem re-assinar**, e reenvie em `GET /me`. Esperado no código vulnerável: 200
  com `role: admin`. No código corrigido: 401.
- **ZAP:** não tem suporte nativo tão bom a JWT; dá pra fazer manual no "Request Editor" com o
  mesmo truque (editar o segment do meio em base64url e reenviar).
- Isso bate com o que já confirmei manualmente — ver [exploitation-report.md](exploitation-report.md).

## 3. Flaw 2 — rota admin sem checar role

- Com o token forjado (ou até um token normal de usuário comum), chame `GET /admin/users` no
  Repeater (Burp) ou Request Editor (ZAP).
- Esperado no vulnerável: 200 com a lista completa de usuários. No corrigido: 403.

## 4. Flaw 3 — senha em texto puro

- A mesma resposta do passo 3 expõe `"password": "..."` em claro no vulnerável. No corrigido, o
  campo não existe mais na resposta (e internamente é hash scrypt).
- **ZAP automatizado:** rode o "Active Scan" sobre `/admin/users` — ele pode sinalizar
  "Information Disclosure - Sensitive Information in URL/Response" se configurar um padrão de
  senha nas regras, mas o achado manual (acima) é mais direto para esse caso específico.

## 5. Flaw 4 — enumeração de usuário no login

- **Burp Intruder:** aponte uma wordlist de emails (pode ser uma lista pequena, 5–10 emails, um
  deles registrado) contra `POST /login` com senha fixa errada. Compare o tamanho/conteúdo da
  resposta — o email registrado responde `wrong password`, os outros `email not found`.
- **ZAP:** use o "Fuzzer" (botão direito na requisição → Fuzz) com a mesma lista de emails e
  compare as respostas.
- No código corrigido, todas as respostas são idênticas (`invalid credentials`, 401).

## 6. Scan automatizado (opcional, cobertura geral)

- **ZAP Active Scan** completo sobre o site populado no passo 1 — útil para capturar achados
  genéricos (headers de segurança ausentes, falta de rate limiting, etc.) que não são os 4 flaws
  centrais mas valem citar no relatório final.
- Exportar o relatório HTML/MD do ZAP para `docs/zap-report.html` (ou similar) quando terminar.

## 7. Depois de rodar

Me manda (ou cola aqui) os achados/relatórios exportados que eu:
1. Resumo e insiro em `docs/vulnerabilities.md`.
2. Comparo achado-por-achado com o que já está fixado no código atual.
3. Monto a tabela final do passo 5 do plano (flaw → exploração → fix).
