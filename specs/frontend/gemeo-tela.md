# Spec: Tela Gêmeo Climático

**Este arquivo:** specs/frontend/gemeo-tela.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Tela de comparação entre estações do mesmo cluster climático.
Mostra grupos, perfis e desvio atual de cada estação em relação ao seu grupo.

## Critérios de aceite

- [ ] Carrega `GET /clusters` para listar todos os grupos
- [ ] Cards de cluster: label, número de estações, características do perfil
- [ ] Clique no cluster → lista de estações do grupo com deviation_score
- [ ] Clique na estação → `GET /clusters/station/{station_id}` com comparativo
- [ ] Painel de comparativo: gráfico radar/spider comparando estação vs média do cluster
- [ ] Indicador de desvio: barra [0,1] com label textual (típica / divergente / muito divergente)
- [ ] Lista de estações similares com link para cada uma
- [ ] Loading e error states

## Fora de escopo

- Clustering dinâmico em tempo real
- Escolha manual de grupos
- Comparação de mais de 2 estações simultaneamente

## Componentes necessários

```
GemeoPage
  ├── ClusterGrid           — cards por cluster
  ├── ClusterDetail         — expansão com lista de estações
  │   └── StationDeviationRow — deviation_score bar
  └── StationClusterDetail  — painel de comparativo
      ├── ClusterProfileRadar — gráfico spider (Recharts RadarChart)
      ├── DeviationIndicator  — barra 0-1 com label
      └── SimilarStationsList — links para estações irmãs
```

## Tasks

- [ ] **T1** Escrever teste: `test_cluster_grid_renders_all_clusters`
- [ ] **T2** Escrever teste: `test_deviation_indicator_label_thresholds`
- [ ] **T3** Escrever teste: `test_radar_chart_shows_station_and_cluster_data`
- [ ] **T4** Criar `ClusterProfileRadar` com Recharts `RadarChart` — 2 séries: estação e média do cluster
- [ ] **T5** Criar `DeviationIndicator` — barra colorida + label: típica (< 0.3) / divergente (0.3–0.6) / muito divergente (> 0.6)
- [ ] **T6** Criar `StationDeviationRow` — linha com station_id, cidade, barra de desvio
- [ ] **T7** Criar hook `useGemeoData` + `useStationCluster(stationId)`
- [ ] **T8** Implementar [`frontend/src/pages/GemeoPage.tsx`](../../frontend/src/pages/GemeoPage.tsx)
- [ ] **T9** Adicionar rota `/clusters` no React Router
- [ ] **T10** Adicionar link para `/clusters` na tela de estação (já especificado em [frontend/visao-estacao.md](visao-estacao.md))
- [ ] **T11** Rodar todos os testes — verde
- [ ] **T12** Code review
- [ ] **T13** Commit: `feat(frontend): implement climate twin screen`

## Dependências

- [frontend/visao-estacao.md](visao-estacao.md) completo
- APIs `/clusters`, `/clusters/{id}`, `/clusters/station/{id}`

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
