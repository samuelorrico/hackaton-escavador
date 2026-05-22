# Spec: Tela Visão por Bairro / Região

**Este arquivo:** specs/frontend/visao-bairro.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Camada territorial interna à cidade.
No MVP, bairro = agrupamento visual de estações dentro de uma cidade.
Se banco não tiver campo de bairro, usar zonas definidas pelo frontend (Norte/Sul/Centro/Leste/Oeste).

## Critérios de aceite

- [ ] Tela recebe `citySlug` e `neighborhood` como params de rota
- [ ] Mostra nome da cidade + nome do bairro/zona
- [ ] Lista estações do bairro com risk_score e badge
- [ ] Score representativo do bairro (média ponderada das estações)
- [ ] Indicador de tendência: em alta, estável, em queda (comparando últimas 3h)
- [ ] Breadcrumb: Bahia > [Cidade] > [Bairro]
- [ ] Se banco não tiver dado de bairro: fallback para zonas "Zona Norte", "Zona Sul" etc. baseado em heurística simples (ou hardcoded para demo)
- [ ] Loading e error states

## Fora de escopo

- Mapa com polígonos de bairro
- Dados demográficos
- Criação/edição de zonas pelo usuário

## Estratégia MVP para bairros

Opção A (preferida): usar `station_id` para inferir bairro se banco tiver campo cidade+bairro.
Opção B (fallback): mapear estações para zonas por ordem numérica do station_id.
Decidir na T1 após explorar o banco.

## Tasks

- [ ] **T1** Explorar banco: verificar se existe campo de bairro ou localização — definir estratégia A ou B
- [ ] **T2** Escrever teste: `test_neighborhood_score_is_weighted_average`
- [ ] **T3** Escrever teste: `test_breadcrumb_shows_city_and_neighborhood`
- [ ] **T4** Implementar mapeamento estação → bairro (A ou B conforme T1)
- [ ] **T5** Adicionar endpoint `GET /cities/{city_slug}/neighborhoods` na API
- [ ] **T6** Adicionar endpoint `GET /cities/{city_slug}/neighborhoods/{neighborhood}` na API
- [ ] **T7** Criar [`frontend/src/pages/NeighborhoodPage.tsx`](../../frontend/src/pages/NeighborhoodPage.tsx) com header, station list, indicador de tendência
- [ ] **T8** Adicionar rota `/cities/:citySlug/neighborhoods/:neighborhood`
- [ ] **T9** Rodar todos os testes — verde
- [ ] **T10** Code review
- [ ] **T11** Commit: `feat(frontend): implement neighborhood view screen`

## Dependências

- [frontend/visao-cidade.md](visao-cidade.md) completo
- Decisão de mapeamento estação → bairro (T1)

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
