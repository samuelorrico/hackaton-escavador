# Spec: Tela Classificador de Risco

**Este arquivo:** specs/frontend/classificador-tela.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Tela dedicada ao módulo de classificação de risco.
Mostra distribuição de risco na Bahia + detalhamento por estação.

## Critérios de aceite

- [ ] Carrega `GET /risk/distribution` para visão geral
- [ ] Gráfico de distribuição: quantas estações em cada nível (baixo/médio/alto/crítico)
- [ ] Lista de estações filtrável por risk_level
- [ ] Clique na estação → painel com `GET /risk/station/{station_id}`
- [ ] Painel de detalhe: risk_score numérico grande, risk_level badge, top 3 fatores
- [ ] Gráfico de evolução do risk_score ao longo do tempo (30 dias)
- [ ] Barra visual de cada fator: nome, contribuição %, valor atual
- [ ] Filtro por nível de risco (todos / baixo / médio / alto / crítico)
- [ ] Loading e error states

## Componentes necessários

```
ClassificadorPage
  ├── RiskDistributionChart  — donut ou bar por nível
  ├── RiskLevelFilter        — tabs/botões por nível
  ├── RiskStationList        — lista filtrável
  └── RiskStationDetail      — painel lateral
      ├── RiskScoreDisplay   — número grande + badge
      ├── RiskFactorBars     — contribuição de cada fator
      └── RiskHistoryChart   — evolução 30 dias
```

## Tasks

- [ ] **T1** Escrever teste: `test_distribution_chart_shows_4_levels`
- [ ] **T2** Escrever teste: `test_filter_critico_shows_only_critico_stations`
- [ ] **T3** Escrever teste: `test_detail_panel_shows_3_risk_factors`
- [ ] **T4** Criar `RiskDistributionChart` — Recharts PieChart ou BarChart
- [ ] **T5** Criar `RiskFactorBars` — progress bars com label, contribuição e valor
- [ ] **T6** Criar `RiskScoreDisplay` — número grande com cor por nível
- [ ] **T7** Criar `RiskHistoryChart` — Recharts LineChart com faixas coloridas de fundo
- [ ] **T8** Criar hook `useClassificadorData`
- [ ] **T9** Implementar [`frontend/src/pages/ClassificadorPage.tsx`](../../frontend/src/pages/ClassificadorPage.tsx)
- [ ] **T10** Adicionar rota `/risk` no React Router
- [ ] **T11** Rodar todos os testes — verde
- [ ] **T12** Code review
- [ ] **T13** Commit: `feat(frontend): implement risk classifier screen`

## Dependências

- [frontend/visao-estacao.md](visao-estacao.md) completo
- APIs `/risk/distribution` e `/risk/station/{id}`

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
