# Spec: Gêmeo Climático das Estações

**Este arquivo:** specs/backend/gemeo-climatico.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Agrupa estações com comportamento climático semelhante via clustering.
Detecta quando uma estação desvia do padrão do seu grupo.
Usa `KMeans` sobre perfil médio histórico de cada estação.

## Por quê

Diferencia o projeto: IA além de anomalia isolada — mostra inteligência comparativa.
Reforça inovação no critério "Inovação e Produto" (30pts banca).

## Critérios de aceite

- [ ] Perfil de cada estação: vetor de médias históricas das variáveis principais
- [ ] Clustering com KMeans, K escolhido via elbow method (K entre 3 e 8)
- [ ] Cada estação tem `climate_cluster` (int) e `cluster_label` (nome descritivo)
- [ ] Cluster labels descritivos derivados das características: ex. "Chuvoso costeiro", "Semiárido quente"
- [ ] Desvio da estação em relação ao centroide do seu cluster (distância euclidiana normalizada)
- [ ] `cluster_deviation_score`: [0,1] — 0 = comportamento típico do grupo, 1 = extremamente diferente
- [ ] Lista de estações do mesmo cluster para comparação
- [ ] Modelo persistido com `joblib`
- [ ] Estações com < 100 leituras válidas marcadas como `cluster: -1` (dados insuficientes)

## Fora de escopo

- Clusterização temporal (série por período) — só perfil histórico agregado
- Hierarquia de clusters
- Comparação em tempo real (só comparação de perfis históricos)

## Interface esperada

```python
# backend/models/gemeo.py

def build_station_profiles(feature_df: pd.DataFrame) -> pd.DataFrame:
    """Agrega histórico por estação: médias, desvios padrão de cada variável."""

def train_clustering(
    profiles_df: pd.DataFrame,
    max_k: int = 8,
    output_dir: str = "backend/models/clustering/"
) -> pd.DataFrame:
    """Treina KMeans, escolhe K, retorna profiles com cluster_id e cluster_label."""

def get_station_cluster_info(
    station_id: str,
    profiles_df: pd.DataFrame
) -> dict:
    """Retorna cluster, vizinhos, deviation_score e comparativo de perfil."""

def detect_current_deviation(
    station_id: str,
    current_features: dict,
    profiles_df: pd.DataFrame
) -> float:
    """Compara estado atual com perfil médio do cluster. Retorna desvio [0,1]."""
```

## Schema de saída

```json
{
  "station_id": "A401",
  "climate_cluster": 2,
  "cluster_label": "Chuvoso costeiro",
  "cluster_size": 8,
  "cluster_deviation_score": 0.34,
  "similar_stations": ["A402", "A405", "A410"],
  "profile": {
    "avg_rain_annual_mm": 1820.4,
    "avg_temp_c": 25.3,
    "avg_humidity_pct": 78.2,
    "avg_pressure_mb": 1012.1
  }
}
```

## Tasks

- [ ] **T1** Escrever teste: `test_station_profiles_one_row_per_station`
- [ ] **T2** Escrever teste: `test_all_stations_have_cluster` — nenhum station_id sem cluster (exceto insuficientes)
- [ ] **T3** Escrever teste: `test_cluster_deviation_range_0_to_1`
- [ ] **T4** Escrever teste: `test_similar_stations_same_cluster`
- [ ] **T5** Implementar `build_station_profiles` com groupby + agg
- [ ] **T6** Implementar elbow method para escolha de K
- [ ] **T7** Implementar `train_clustering` com KMeans + StandardScaler
- [ ] **T8** Implementar geração de `cluster_label` com base nas características dominantes do centroide
- [ ] **T9** Implementar `cluster_deviation_score` via distância euclidiana normalizada ao centroide
- [ ] **T10** Implementar `get_station_cluster_info`
- [ ] **T11** Implementar `detect_current_deviation`
- [ ] **T12** Script de treinamento adicionado ao [`backend/scripts/train_models.py`](../../backend/scripts/train_models.py)
- [ ] **T13** Rodar todos os testes — verde
- [ ] **T14** Code review
- [ ] **T15** Commit: `feat(gemeo): implement station clustering and deviation detection`

## Dependências

- [backend/feature-engineering.md](feature-engineering.md) completo

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
