# Spec: Feature Engineering

**Este arquivo:** specs/backend/feature-engineering.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Calcula todas as features derivadas a partir do DataFrame limpo do pipeline.
Saída: DataFrame com colunas brutas + features prontas para os modelos de IA.

## Por quê

Os modelos precisam de acumulados temporais, deltas e estatísticas históricas — não das leituras brutas isoladas.

## Critérios de aceite

- [ ] Acumulados de chuva calculados para janelas: 6h, 12h, 24h, 48h, 72h
- [ ] Deltas calculados para: pressão, temperatura, umidade, vento (variação em 1h)
- [ ] Médias móveis (24h) para: temperatura, umidade, pressão
- [ ] Desvio padrão histórico por estação para cada variável principal
- [ ] Z-score por estação (valor atual vs histórico da própria estação)
- [ ] Sem vazamento de dados futuros (janelas só olham para trás)
- [ ] Cálculo agrupa por `station_id` antes de aplicar janelas temporais
- [ ] Nulos gerados nas bordas das janelas tratados (dropna ou fill documentado)
- [ ] Tempo de processamento < 60s para dataset completo
- [ ] Todos os novos nomes de coluna seguem convenção `snake_case`

## Fora de escopo

- Feature selection (responsabilidade do modelo)
- Normalização / scaling (responsabilidade do modelo)
- Features territoriais (cidade, bairro)

## Interface esperada

```python
# backend/data/features.py

def compute_rain_accumulations(df: pd.DataFrame) -> pd.DataFrame:
    """Adiciona rain_6h_mm, rain_12h_mm, rain_24h_mm, rain_48h_mm, rain_72h_mm."""

def compute_deltas(df: pd.DataFrame) -> pd.DataFrame:
    """Adiciona pressure_delta_1h, temp_delta_1h, humidity_delta_1h, wind_delta_1h."""

def compute_rolling_stats(df: pd.DataFrame) -> pd.DataFrame:
    """Adiciona médias móveis 24h e desvio padrão histórico por estação."""

def compute_zscore(df: pd.DataFrame) -> pd.DataFrame:
    """Adiciona z-score por estação para cada variável principal."""

def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Pipeline completo: chama todas as funções acima em sequência."""
```

## Colunas adicionadas

| Coluna | Descrição |
|---|---|
| `rain_6h_mm` | Acumulado de chuva nas últimas 6h |
| `rain_12h_mm` | Acumulado de chuva nas últimas 12h |
| `rain_24h_mm` | Acumulado de chuva nas últimas 24h |
| `rain_48h_mm` | Acumulado de chuva nas últimas 48h |
| `rain_72h_mm` | Acumulado de chuva nas últimas 72h |
| `pressure_delta_1h` | Variação de pressão na última hora |
| `temp_delta_1h` | Variação de temperatura na última hora |
| `humidity_delta_1h` | Variação de umidade na última hora |
| `wind_delta_1h` | Variação de rajada na última hora |
| `temp_ma_24h` | Média móvel de temperatura 24h |
| `humidity_ma_24h` | Média móvel de umidade 24h |
| `pressure_ma_24h` | Média móvel de pressão 24h |
| `rain_zscore` | Z-score de chuva vs histórico da estação |
| `pressure_zscore` | Z-score de pressão vs histórico da estação |
| `temp_zscore` | Z-score de temperatura vs histórico da estação |
| `humidity_zscore` | Z-score de umidade vs histórico da estação |

## Tasks

- [ ] **T1** Escrever teste: `test_rain_accumulations_no_future_leak` — verifica que acumulado não usa dados à frente
- [ ] **T2** Escrever teste: `test_rain_6h_correct_value` — valor calculado manual vs função
- [ ] **T3** Escrever teste: `test_deltas_groupby_station` — delta não cruza estações
- [ ] **T4** Escrever teste: `test_zscore_mean_near_zero_per_station` — validação estatística
- [ ] **T5** Escrever teste: `test_build_feature_matrix_has_all_columns` — todas as colunas presentes
- [ ] **T6** Implementar `compute_rain_accumulations` com `groupby + rolling`
- [ ] **T7** Implementar `compute_deltas` com `groupby + diff(1)`
- [ ] **T8** Implementar `compute_rolling_stats` com `rolling(24)`
- [ ] **T9** Implementar `compute_zscore` com média e std histórico por estação
- [ ] **T10** Implementar `build_feature_matrix` orquestrando todas as funções
- [ ] **T11** Rodar todos os testes — verde
- [ ] **T12** Code review
- [ ] **T13** Commit: `feat(features): implement feature engineering pipeline`

## Dependências

- [backend/data-pipeline.md](data-pipeline.md) completo e com testes verdes

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
