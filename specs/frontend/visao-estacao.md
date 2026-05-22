# Spec: Tela Monitoramento por Estação

**Este arquivo:** specs/frontend/visao-estacao.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Tela de análise profunda de uma estação específica.
Explica o estado atual, o score de risco e os fatores determinantes.

## Critérios de aceite

- [ ] Carrega `GET /stations/{station_id}` e `GET /stations/{station_id}/history?days=30`
- [ ] Header: station_id, cidade, risk_score, risk_level badge
- [ ] Cards de leituras atuais: chuva, pressão, temperatura, umidade, vento
- [ ] Seção de fatores de risco: top 3 fatores com barra de contribuição percentual
- [ ] Gráfico de série temporal dos últimos 30 dias: risk_score ao longo do tempo
- [ ] Gráfico de chuva acumulada: rain_24h_mm e rain_72h_mm
- [ ] Anomaly score atual com label e indicador visual
- [ ] Link para tela do Gêmeo Climático da estação
- [ ] Breadcrumb: Bahia > [Cidade] > [Estação]
- [ ] Botão voltar para cidade
- [ ] Loading e error states

## Fora de escopo

- Edição de dados
- Download de relatório (MVP)
- Comparação direta com outra estação nessa tela

## Componentes necessários

```
StationPage
  ├── Breadcrumb
  ├── StationHeader        — id, cidade, risk_score, badge
  ├── CurrentReadingsGrid  — 5 cards de métricas atuais
  ├── RiskFactorsPanel     — top 3 fatores com barra
  ├── RiskScoreChart       — linha temporal 30 dias (Recharts)
  ├── RainAccumulationChart — barras rain_24h + rain_72h
  ├── AnomalyIndicator     — score + label + cor
  └── LoadingSpinner / ErrorMessage
```

## Tasks

- [ ] **T1** Escrever teste: `test_renders_station_header_with_risk_level`
- [ ] **T2** Escrever teste: `test_risk_factors_shows_3_items`
- [ ] **T3** Escrever teste: `test_history_chart_renders_with_data`
- [ ] **T4** Escrever teste: `test_breadcrumb_correct_path`
- [ ] **T5** Criar hook `useStationData(stationId)`
- [ ] **T6** Criar `CurrentReadingsGrid` — 5 cards: ícone + valor + unidade
- [ ] **T7** Criar `RiskFactorsPanel` — cada fator com barra horizontal de contribuição
- [ ] **T8** Criar `RiskScoreChart` usando Recharts `LineChart`
- [ ] **T9** Criar `RainAccumulationChart` usando Recharts `BarChart`
- [ ] **T10** Criar `AnomalyIndicator` com cor por anomaly_label
- [ ] **T11** Implementar [`frontend/src/pages/StationPage.tsx`](../../frontend/src/pages/StationPage.tsx) compondo os componentes
- [ ] **T12** Adicionar rota `/stations/:stationId` no React Router
- [ ] **T13** Rodar todos os testes — verde
- [ ] **T14** Code review
- [ ] **T15** Commit: `feat(frontend): implement station monitoring screen`

## Dependências

- [frontend/visao-cidade.md](visao-cidade.md) completo
- APIs `/stations/{id}` e `/stations/{id}/history`

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
