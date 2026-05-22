# Spec: Tela Radar de Extremos Climáticos

**Este arquivo:** specs/frontend/radar-tela.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Tela dedicada ao módulo de detecção de anomalias.
Ranking de estações mais anômalas + visualização de comportamento vs histórico.

## Critérios de aceite

- [ ] Carrega `GET /radar/ranking?limit=10`
- [ ] Lista de estações ordenada por `anomaly_score` decrescente
- [ ] Cada linha: estação, cidade, anomaly_score (0-1), anomaly_label badge, variável driver
- [ ] Clique na estação → abre detalhe da estação via `GET /radar/station/{station_id}`
- [ ] Gráfico de linha: anomaly_score ao longo do tempo para estação selecionada
- [ ] Comparação visual: valor atual vs média histórica para a variável driver
- [ ] Filtro por anomaly_label: todos / atípico / extremo
- [ ] Loading e error states

## Fora de escopo

- Filtro por período histórico longo
- Alertas automáticos

## Componentes necessários

```
RadarPage
  ├── RadarHeader           — título, descrição do módulo
  ├── AnomalyFilterTabs     — todos / atípico / extremo
  ├── AnomalyRankingList    — lista clicável com badge + driver
  ├── StationAnomalyDetail  — drawer/painel lateral com gráfico
  │   ├── AnomalyScoreChart — linha temporal
  │   └── DriverComparison  — atual vs histórico
  └── LoadingSpinner / ErrorMessage
```

## Tasks

- [ ] **T1** Escrever teste: `test_ranking_sorted_by_anomaly_score_desc`
- [ ] **T2** Escrever teste: `test_filter_by_label_filters_correctly`
- [ ] **T3** Escrever teste: `test_station_click_loads_detail`
- [ ] **T4** Criar `AnomalyRankingList` com badge colorido por label
- [ ] **T5** Criar `AnomalyFilterTabs` com contagem por categoria
- [ ] **T6** Criar `AnomalyScoreChart` — Recharts LineChart com threshold line em 0.4 e 0.7
- [ ] **T7** Criar `DriverComparison` — bar ou gauge mostrando atual vs média histórica
- [ ] **T8** Criar hook `useRadarData` + `useStationAnomalyDetail(stationId)`
- [ ] **T9** Implementar [`frontend/src/pages/RadarPage.tsx`](../../frontend/src/pages/RadarPage.tsx)
- [ ] **T10** Adicionar rota `/radar` no React Router
- [ ] **T11** Rodar todos os testes — verde
- [ ] **T12** Code review
- [ ] **T13** Commit: `feat(frontend): implement extremes radar screen`

## Dependências

- [frontend/visao-estacao.md](visao-estacao.md) completo (reutiliza componentes)
- APIs `/radar/ranking` e `/radar/station/{id}`

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
