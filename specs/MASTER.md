# GuardiãoIA — Master Spec

**Este arquivo:** specs/MASTER.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](WORKFLOW.md)

Fonte única de verdade sobre o que está pronto, em andamento e pendente.
**Atualizar este arquivo a cada task concluída.**

---

## Como usar este arquivo

### Para começar uma sessão de trabalho

1. Ler este arquivo do início ao fim
2. Encontrar primeiro item com status `⬜ pendente`
3. Abrir spec correspondente em `specs/`
4. Seguir o workflow: Spec → Test → Code → Review → Commit
5. Marcar task como `✅ feito` aqui ao terminar
6. Commitar este arquivo junto com o código

### Para retomar após interrupção

1. Ler este arquivo
2. Encontrar item `🔄 em andamento` — retomar dali
3. Se nenhum `🔄`, pegar primeiro `⬜ pendente`
4. Se travado em alguma task, marcar com `❌ bloqueado` e anotar motivo abaixo do item

### Para o agente de IA

Ao iniciar qualquer sessão neste projeto:
```
Leia specs/MASTER.md primeiro.
Execute exatamente a próxima task pendente.
Não pule etapas, não implemente sem spec.
Siga: Spec → Test → Code → Review → Commit.
Atualize o status aqui ao concluir cada task.
```

---

## Legenda

| Símbolo | Significado |
|---|---|
| ⬜ | Pendente — não iniciado |
| 🔄 | Em andamento — iniciado mas não concluído |
| ✅ | Concluído — testes passando, commitado |
| ❌ | Bloqueado — anotar motivo abaixo |
| ⏭️ | Pulado — decisão intencional, anotar motivo |

---

## Fase 1 — Setup

| # | Task | Status | Spec |
|---|---|---|---|
| 1.1 | Setup backend (estrutura, deps, pytest) | ✅ feito | [backend/setup.md](backend/setup.md) |
| 1.2 | Setup frontend (Vite+React+TS+Tailwind+Router) | ✅ feito | [frontend/setup.md](frontend/setup.md) |
| 1.SEC | 🔒 Security review fase 1 | ✅ feito | [WORKFLOW.md](WORKFLOW.md#passo-45--security-review-ao-fechar-fase) |

> 1.1 e 1.2 podem ser feitos em paralelo. 1.SEC obrigatório antes de avançar pra fase 2.

---

## Fase 2 — Pipeline de Dados

| # | Task | Status | Spec |
|---|---|---|---|
| 2.1 | Pipeline de dados (leitura, limpeza, tipagem) | ✅ feito | [backend/data-pipeline.md](backend/data-pipeline.md) |
| 2.2 | Feature engineering (acumulados, deltas, z-scores) | ✅ feito | [backend/feature-engineering.md](backend/feature-engineering.md) |
| 2.SEC | 🔒 Security review fase 2 | ✅ feito | [WORKFLOW.md](WORKFLOW.md#passo-45--security-review-ao-fechar-fase) |

> 2.2 depende de 2.1. 2.SEC obrigatório antes de avançar pra fase 3.

---

## Fase 3 — Modelos de IA

| # | Task | Status | Spec |
|---|---|---|---|
| 3.1 | Radar de Extremos (IsolationForest por estação) | ✅ feito | [backend/radar-anomaly.md](backend/radar-anomaly.md) |
| 3.2 | Classificador de Risco (score 0–100 ponderado) | ✅ feito | [backend/classificador-risco.md](backend/classificador-risco.md) |
| 3.3 | Gêmeo Climático (KMeans clustering) | ✅ feito | [backend/gemeo-climatico.md](backend/gemeo-climatico.md) |
| 3.SEC | 🔒 Security review fase 3 | ✅ feito | [WORKFLOW.md](WORKFLOW.md#passo-45--security-review-ao-fechar-fase) |

> 3.1 e 3.3 podem ser feitos em paralelo após fase 2. 3.2 depende de 3.1. 3.SEC obrigatório antes da fase 4.

---

## Fase 4 — API

| # | Task | Status | Spec |
|---|---|---|---|
| 4.1 | Todos os endpoints FastAPI | ✅ feito | [backend/api-endpoints.md](backend/api-endpoints.md) |
| 4.SEC | 🔒 Security review fase 4 | ✅ feito | [WORKFLOW.md](WORKFLOW.md#passo-45--security-review-ao-fechar-fase) |

> Depende de 3.1, 3.2, 3.3. 4.SEC obrigatório antes da fase 5.

---

## Fase 5 — Frontend (telas)

| # | Task | Status | Spec |
|---|---|---|---|
| 5.1 | Dashboard Geral | ✅ feito | [frontend/dashboard-geral.md](frontend/dashboard-geral.md) |
| 5.2 | Visão por Cidade | ✅ feito | [frontend/visao-cidade.md](frontend/visao-cidade.md) |
| 5.3 | Visão por Estação | ✅ feito | [frontend/visao-estacao.md](frontend/visao-estacao.md) |
| 5.4 | Tela Radar de Extremos | ✅ feito | [frontend/radar-tela.md](frontend/radar-tela.md) |
| 5.5 | Tela Classificador de Risco | ✅ feito | [frontend/classificador-tela.md](frontend/classificador-tela.md) |
| 5.6 | Tela Gêmeo Climático | ✅ feito | [frontend/gemeo-tela.md](frontend/gemeo-tela.md) |
| 5.7 | Visão por Bairro/Região | ✅ feito | [frontend/visao-bairro.md](frontend/visao-bairro.md) |
| 5.8 | Tela Metodologia | ✅ feito | [frontend/metodologia-tela.md](frontend/metodologia-tela.md) |
| 5.SEC | 🔒 Security review fase 5 | ✅ feito | [WORKFLOW.md](WORKFLOW.md#passo-45--security-review-ao-fechar-fase) |

> 5.1 primeiro (base de navegação). 5.2 depende de 5.1. 5.3 depende de 5.2.
> 5.4, 5.5, 5.6 dependem de 5.3. 5.7 depende de 5.2. 5.8 pode ser feita a qualquer hora após 1.2.
> Todas dependem de 4.1 (API pronta). 5.SEC fecha o MVP.

---

## Ordem cronológica recomendada

```
1.1 → 1.2 (paralelo)
  ↓
2.1
  ↓
2.2
  ↓
3.1 → 3.3 (paralelo)
  ↓
3.2
  ↓
4.1
  ↓
5.1
  ↓
5.2
  ↓
5.3
  ↓
5.4 → 5.5 → 5.6 (sequência ou paralelo)
  ↓
5.7 → 5.8 (paralelo)
```

---

## Bloqueios ativos

_Nenhum bloqueio no momento._

---

## Decisões pendentes

| Decisão | Impacta | Prazo |
|---|---|---|
| Mapeamento estação → bairro (A: campo do banco / B: zona heurística) | 5.7, endpoint `/neighborhoods` | Antes de iniciar 5.7 |

---

## Critério global de pronto (MVP)

- [ ] Todos os testes passando (`pytest` + `vitest`)
- [ ] Demo roda offline (sem internet, sem APIs externas)
- [ ] Navegação: Bahia → Cidade → Bairro → Estação
- [ ] Score de risco visível em todas as telas
- [ ] Repositório público no GitHub com código

## Workflow

```
Spec → Test → Code → Review → Commit
```
1. Ler este spec completo
2. Escrever testes (ver path de testes acima) — rodar: devem falhar
3. Implementar até testes passarem
4. `/caveman-review` — code review
5. `git commit` com mensagem do formato especificado
6. Marcar tasks como ✅ em [specs/MASTER.md](MASTER.md)
