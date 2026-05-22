# Spec: Pipeline de Dados

**Este arquivo:** specs/backend/data-pipeline.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Módulo de ingestão e preparação do banco SQLite local.
Transforma dado bruto em DataFrame limpo e tipado, pronto para feature engineering e modelos.

## Por quê

O banco tem 5,2M linhas com colunas em formato texto, nomes longos, possíveis nulos e inconsistências temporais.
Tudo downstream depende deste pipeline estar correto.

## Critérios de aceite

- [ ] Lê [`assets/banco_de_dados.db`](../../assets/banco_de_dados.db), tabela `dados`, sem crash
- [ ] Colunas renomeadas para nomes lógicos do dicionário de dados
- [ ] Tipos numéricos corretos (float64 para métricas, datetime para timestamp)
- [ ] DATA e HORA combinados em coluna `timestamp` (UTC)
- [ ] Nulos registrados e tratados (forward-fill por estação, limite de 3h)
- [ ] Dados ordenados por `station_id` e `timestamp`
- [ ] DataFrame resultante tem exatamente as colunas esperadas
- [ ] Tempo de carregamento < 30s para todas as 5,2M linhas
- [ ] Função retorna DataFrame ou levanta exceção tipada (não silencia erros)

## Fora de escopo

- Scraping ou integração com APIs externas
- Persistência em outro banco — só leitura do SQLite
- Enriquecimento territorial de bairros (etapa separada)

## Interface esperada

```python
# backend/data/pipeline.py

def load_raw_data(db_path: str) -> pd.DataFrame:
    """Lê banco, renomeia colunas, combina data+hora, retorna DataFrame limpo."""

def validate_schema(df: pd.DataFrame) -> bool:
    """Verifica se DataFrame tem todas as colunas esperadas com tipos corretos."""
```

## Colunas de saída

| Nome lógico | Tipo | Origem no banco |
|---|---|---|
| `station_id` | str | `ESTACAO` |
| `timestamp` | datetime64[ns] | `DATA` + `HORA` |
| `rain_1h_mm` | float64 | `PRECIPITACAO TOTAL` |
| `pressure_mb` | float64 | `PRESSAO ATMOSFERICA` |
| `solar_radiation_wm2` | float64 | `RADIACAO GLOBAL` |
| `air_temp_c` | float64 | `TEMPERATURA DO AR` |
| `humidity_pct` | float64 | `UMIDADE RELATIVA` |
| `wind_gust_ms` | float64 | `VENTO (RAJADA)` |

## Tasks

- [ ] **T1** Explorar schema real do banco (`PRAGMA table_info(dados)`) e mapear nomes exatos das colunas
- [ ] **T2** Escrever teste: `test_load_returns_dataframe` — verifica tipo, shape > 0
- [ ] **T3** Escrever teste: `test_columns_renamed_correctly` — verifica nomes lógicos presentes
- [ ] **T4** Escrever teste: `test_timestamp_is_datetime` — verifica dtype
- [ ] **T5** Escrever teste: `test_no_duplicate_timestamps_per_station` — unicidade temporal
- [ ] **T6** Escrever teste: `test_numeric_columns_are_float` — tipos corretos
- [ ] **T7** Implementar `load_raw_data` — conexão SQLite + pandas read_sql
- [ ] **T8** Implementar renaming de colunas via dict de mapeamento
- [ ] **T9** Implementar combinação DATA + HORA → timestamp com `pd.to_datetime`
- [ ] **T10** Implementar tratamento de nulos: forward-fill por estação, limite 3 registros
- [ ] **T11** Implementar ordenação por `station_id`, `timestamp`
- [ ] **T12** Implementar `validate_schema` com checagem de colunas e tipos
- [ ] **T13** Rodar todos os testes — verde
- [ ] **T14** Code review
- [ ] **T15** Commit: `feat(pipeline): implement raw data loading and schema validation`

## Dependências

Nenhuma — é o primeiro módulo.

## Testes

Localização: [`backend/tests/test_data_pipeline.py`](../../backend/tests/test_data_pipeline.py)
Fixture: subset de 1000 linhas do banco (não commitar banco completo, usar sample)

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
