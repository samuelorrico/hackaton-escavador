# Spec: Tela Visão por Cidade

**Este arquivo:** specs/frontend/visao-cidade.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Tela de drill-down por cidade da Bahia.
Transforma visão por estação em leitura territorial mais intuitiva.

## Critérios de aceite

- [ ] Carrega dados de `GET /cities/{city_slug}`
- [ ] Mostra nome da cidade, score médio, nível dominante de risco
- [ ] Lista todas as estações da cidade com: station_id, risk_score, risk_level badge
- [ ] Cada estação clicável → navega para tela de estação
- [ ] Card de destaque para estação mais crítica da cidade
- [ ] Indicador de número de estações em cada nível de risco
- [ ] Breadcrumb: Bahia > [Cidade]
- [ ] Botão voltar para dashboard
- [ ] Loading e error states

## Fora de escopo

- Mapa da cidade
- Filtros por período
- Edição de dados

## Componentes necessários

```
CityPage
  ├── Breadcrumb
  ├── CityHeader          — nome, score médio, risk_level dominante
  ├── CriticalStationCard — destaque para pior estação
  ├── RiskDistributionBar — proporção baixo/médio/alto/crítico
  ├── StationList         — lista clicável com badge
  └── LoadingSpinner / ErrorMessage
```

## Tasks

- [ ] **T1** Escrever teste: `test_renders_city_name_and_score`
- [ ] **T2** Escrever teste: `test_station_list_all_city_stations`
- [ ] **T3** Escrever teste: `test_station_click_navigates_to_station_detail`
- [ ] **T4** Escrever teste: `test_breadcrumb_has_bahia_and_city`
- [ ] **T5** Criar hook `useCityData(citySlug)`
- [ ] **T6** Criar `CityHeader` com score médio e badge de nível dominante
- [ ] **T7** Criar `RiskDistributionBar` — barra horizontal proporcional por nível
- [ ] **T8** Criar `StationList` reutilizável (reuso no Radar e Classificador)
- [ ] **T9** Implementar [`frontend/src/pages/CityPage.tsx`](../../frontend/src/pages/CityPage.tsx) compondo os componentes
- [ ] **T10** Adicionar rota `/cities/:citySlug` no React Router
- [ ] **T11** Rodar todos os testes — verde
- [ ] **T12** Code review
- [ ] **T13** Commit: `feat(frontend): implement city view screen`

## Dependências

- [frontend/dashboard-geral.md](dashboard-geral.md) completo (rota e navegação base)
- API endpoint `GET /cities/{city_slug}`

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
