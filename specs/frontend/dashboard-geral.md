# Spec: Tela Dashboard Geral

**Este arquivo:** specs/frontend/dashboard-geral.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Tela inicial do app. Entry point da demo.
Mostra visão geral da Bahia: métricas principais, ranking de risco, navegação por módulos.

## Por quê

Primeira impressão da banca. Deve comunicar valor em segundos.
Ponto de partida da jornada: Bahia → Cidade → Bairro → Estação.

## Critérios de aceite

- [ ] Carrega dados de `GET /dashboard/summary` e `GET /dashboard/risk-ranking`
- [ ] 4 cards de métricas: total estações, estações críticas, cidades em alerta, estação mais crítica
- [ ] Cada card tem label, valor e indicador visual de nível (cor por risk_level)
- [ ] Tabela/lista de ranking: top 10 estações por risk_score (clicável → tela de estação)
- [ ] Cada linha do ranking mostra: estação, cidade, risk_score, risk_level badge colorido
- [ ] Botão/link de acesso rápido para: Radar, Classificador, Gêmeo Climático
- [ ] Loading state enquanto dados chegam
- [ ] Estado de erro com mensagem amigável se API falhar
- [ ] Layout responsivo (mobile + desktop)
- [ ] Título e subtítulo da plataforma visíveis

## Fora de escopo

- Mapa geográfico (MVP usa lista/tabela)
- Filtros por período
- Atualização automática (sem polling)

## Componentes necessários

```
DashboardPage
  ├── MetricCard           (4x) — valor, label, cor por nível
  ├── RiskRankingTable     — lista clicável de estações
  ├── QuickAccessPanel     — links para Radar, Classificador, Gêmeo
  ├── LoadingSpinner
  └── ErrorMessage
```

## Tasks

- [ ] **T1** Escrever teste: `test_renders_4_metric_cards`
- [ ] **T2** Escrever teste: `test_risk_ranking_has_10_rows`
- [ ] **T3** Escrever teste: `test_ranking_row_click_navigates_to_station`
- [ ] **T4** Escrever teste: `test_shows_loading_state_while_fetching`
- [ ] **T5** Escrever teste: `test_shows_error_state_on_api_failure`
- [ ] **T6** Criar componente `MetricCard` com prop: `label`, `value`, `riskLevel`
- [ ] **T7** Criar componente `RiskRankingTable` com prop: `stations[]`, `onStationClick`
- [ ] **T8** Criar `RiskLevelBadge` reutilizável com cores: verde/amarelo/laranja/vermelho
- [ ] **T9** Criar hook `useDashboardData` — fetch summary + ranking
- [ ] **T10** Implementar [`frontend/src/pages/DashboardPage.tsx`](../../frontend/src/pages/DashboardPage.tsx) compondo todos os componentes
- [ ] **T11** Adicionar rota `/` no React Router
- [ ] **T12** Rodar todos os testes — verde
- [ ] **T13** Code review
- [ ] **T14** Commit: `feat(frontend): implement dashboard general screen`

## Dependências

- [backend/api-endpoints.md](../backend/api-endpoints.md) completo (endpoints `/dashboard/*`)
- Setup base do React Router definido

## Workflow

```
Spec → Test → Code → Review → Commit
```
1. Ler este spec completo
2. Escrever testes (ver path de testes acima) — rodar: devem falhar
3. Implementar até testes passarem
4. `/caveman-review` — code review
5. `git commit` com mensagem do formato especificado
6. Marcar tasks como ✅ em [specs/MASTER.md](../MASTER.md)
