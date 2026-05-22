# Workflow de Desenvolvimento

**Este arquivo:** specs/WORKFLOW.md
**Workflow obrigatório:** Spec → Test → Code → Review → Security Review (por fase) → Commit — ver [specs/WORKFLOW.md](WORKFLOW.md)

Todo código do GuardiãoIA segue este ciclo obrigatório:

```
Spec → Test → Code → Review → Commit
         ↑
Security Review obrigatório ao final de cada fase completa
```

## Regra principal

**Nunca codar sem spec. Nunca commitar sem review. Security review ao fechar cada fase.**

---

## Passo 1 — Spec

Antes de qualquer código, criar ou atualizar o arquivo de spec em `specs/`.

Use a skill `tlc-spec-driven`:

```
specify feature [nome da feature]
```

O arquivo de spec deve conter:
- **O quê:** comportamento esperado
- **Por quê:** contexto e motivação
- **Critérios de aceite:** o que define "pronto"
- **Fora de escopo:** o que não será feito

Formato do arquivo: `specs/[modulo]-[feature].md`

Exemplos:
- `specs/radar-anomaly-detection.md`
- `specs/classificador-risk-score.md`
- `specs/frontend-dashboard-geral.md`

---

## Passo 2 — Test (TDD)

**Escrever os testes antes de implementar.**

- Backend (Python): `pytest` — testes em [`backend/tests/`](../backend/tests/)
- Frontend (TypeScript): `vitest` — testes em [`frontend/src/__tests__/`](../frontend/src/__tests__/)

Testes devem cobrir os critérios de aceite definidos na spec.
Rode os testes para confirmar que falham antes de implementar.

```bash
# backend
pytest backend/tests/ -v

# frontend
npm run test
```

---

## Passo 3 — Code

Implementar até todos os testes passarem.

Referências durante implementação:
- [`docs/arquitetura.md`](../docs/arquitetura.md) — decisões de stack
- [`docs/dicionario.md`](../docs/dicionario.md) — nomes de variáveis e colunas
- Skills: `react-best-practices`, `security-best-practices`, `perf-web-optimization`

```bash
# confirmar todos os testes passando
pytest backend/tests/ -v
npm run test
```

---

## Passo 4 — Code Review

**Obrigatório antes de commitar.**

Usar skill `caveman-review` para review comprimido:

```
/caveman-review
```

Cheklist mínimo:
- [ ] Testes passando
- [ ] Sem dados hardcoded ou secrets no código
- [ ] Nomes seguem convenção do [`docs/dicionario.md`](../docs/dicionario.md)
- [ ] Sem lógica de IA ou processamento de dados no frontend
- [ ] FastAPI endpoints seguem padrão REST
- [ ] Sem dependências externas além do `banco_de_dados.db`

---

## Passo 4.5 — Security Review (ao fechar fase)

**Obrigatório ao concluir todas as tasks de uma fase do MASTER.md.**
Não precisa rodar a cada task individual — apenas uma vez por fase completa.

Usar skill `/security-review`:

```
/security-review
```

Foco por fase:

| Fase | O que revisar |
|---|---|
| Fase 1 (setup) | CORS, secrets em config, deps vulneráveis |
| Fase 2 (pipeline) | SQL injection no SQLite, path traversal em db_path |
| Fase 3 (modelos IA) | Deserialização de `.joblib`, validação de inputs |
| Fase 4 (API) | Validação de parâmetros, rate limit, headers de segurança |
| Fase 5 (frontend) | XSS, inputs não sanitizados, dados expostos no bundle |

Cheklist mínimo de segurança:
- [ ] Sem secrets hardcoded (API keys, passwords, tokens)
- [ ] Sem path traversal em leitura de arquivos
- [ ] Inputs validados com Pydantic (backend) ou TypeScript (frontend)
- [ ] Sem `eval()`, `exec()`, `subprocess` com input do usuário
- [ ] Dependências sem CVE crítico conhecido (`pip audit` / `npm audit`)

```bash
# backend
pip-audit  # ou: .venv/bin/pip-audit
# frontend
npm audit
```

---

## Passo 5 — Commit

Commitar apenas depois de review aprovado.

```bash
git add [arquivos específicos]
git commit -m "tipo(módulo): descrição curta"
```

**Nunca incluir `Co-Authored-By` de IA.** Se aparecer, amend imediato:
```bash
git commit --amend -m "mensagem sem co-author"
```

Tipos: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`

Exemplos:
```
feat(radar): add anomaly score calculation per station
test(classificador): add risk level boundary tests
docs(specs): add spec for gemeo-climatico clustering
fix(frontend): fix dashboard card rendering on mobile
```

---

## Estrutura da pasta specs

```
specs/
  WORKFLOW.md              este arquivo
  radar/
    anomaly-detection.md
    extremes-ranking.md
  classificador/
    risk-score.md
    risk-levels.md
  gemeo-climatico/
    clustering.md
    deviation-detection.md
  frontend/
    dashboard-geral.md
    visao-cidade.md
    visao-estacao.md
    visao-bairro.md
    radar-tela.md
    classificador-tela.md
    gemeo-tela.md
    metodologia-tela.md
  backend/
    data-pipeline.md
    feature-engineering.md
    api-endpoints.md
```

---

## Resumo rápido

```
1. specify feature [nome]   → cria spec em specs/
2. escreve testes           → testes falham (esperado)
3. implementa               → testes passam
4. /caveman-review          → review do código
5. git commit               → apenas após review
── ao fechar fase ──────────────────────────────────
6. /security-review         → revisar fase inteira
7. corrigir findings        → commit de fix se necessário
8. marcar fase ✅ em MASTER
```

## Workflow

```
Spec → Test → Code → Review → Commit
                  ↓ (fim de fase)
             /security-review → fix → commit
```
1. Ler este spec completo
2. Escrever testes (ver path de testes acima) — rodar: devem falhar
3. Implementar até testes passarem
4. `/caveman-review` — code review
5. `git commit` com mensagem do formato especificado
6. **Ao fechar fase:** `/security-review` → corrigir → commitar fixes
7. Marcar fase como ✅ em [specs/MASTER.md](MASTER.md)
