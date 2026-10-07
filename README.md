# auth-lab

> **AVISO:** este repositório é intencionalmente vulnerável. Existe só para aprendizagem. Nunca uses este código em produção.

Laboratório de ataque e defesa: uma versão propositadamente insegura de uma API de autenticação, atacada com ferramentas reais e corrigida passo a passo. Complementa o projeto [auth-api](https://github.com/TMseabra/auth-api).

> Estado: em desenvolvimento (projeto de portefólio).

## Objetivo

Mostrar o ciclo completo de segurança: encontrar falhas, explorá-las, documentá-las e corrigi-las. O histórico de commits serve de "antes e depois".

## Falhas planeadas (de propósito)

- JWT aceite sem validar a assinatura
- Rotas de administração sem verificação de papel
- Palavras-passe guardadas em texto simples
- Mensagens de erro que revelam se o email existe

## Ferramentas

- OWASP ZAP
- Burp Suite Community
- OWASP Juice Shop (relatório curto à parte)

## Plano

1. Criar a versão vulnerável (base simplificada do auth-api)
2. Atacar com o ZAP e o Burp Suite e documentar cada falha encontrada
3. Corrigir uma a uma, em commits separados
4. Fazer o OWASP Juice Shop e escrever um relatório curto
5. Resumir tudo numa tabela: falha, como foi explorada, correção

## Relatórios

A preencher em /docs à medida que o laboratório avança.

## Aviso legal

Testa apenas em ambientes teus (localhost). Atacar sistemas de terceiros sem autorização é crime.
