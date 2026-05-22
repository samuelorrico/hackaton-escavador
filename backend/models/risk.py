import numpy as np
import pandas as pd

DEFAULT_WEIGHTS = {
    "rain_72h_mm":        {"weight": 0.35, "label": "Chuva acumulada 72h"},
    "pressure_delta_abs": {"weight": 0.25, "label": "Instabilidade de pressão"},
    "anomaly_score":      {"weight": 0.20, "label": "Comportamento atípico"},
    "humidity_pct":       {"weight": 0.10, "label": "Umidade do ar"},
    "wind_gust_ms":       {"weight": 0.10, "label": "Rajada de vento"},
}

_RISK_LEVELS = [
    (25, "baixo"),
    (50, "médio"),
    (75, "alto"),
    (100, "crítico"),
]


def _risk_level(score: float) -> str:
    for threshold, level in _RISK_LEVELS:
        if score <= threshold:
            return level
    return "crítico"


def compute_risk_score(
    feature_df: pd.DataFrame,
    scored_df: pd.DataFrame,
    weights: dict = None,
) -> pd.DataFrame:
    weights = weights or DEFAULT_WEIGHTS

    # merge anomaly_score into feature_df if not already present
    merge_cols = ["station_id", "timestamp", "anomaly_score"]
    if "anomaly_score" not in feature_df.columns:
        df = feature_df.merge(scored_df[merge_cols], on=["station_id", "timestamp"], how="left")
    else:
        df = feature_df.copy()

    df["pressure_delta_abs"] = df["pressure_delta_1h"].abs()

    # compute per-station percentile rank for each factor
    pct_cols = {}
    factor_src = {
        "rain_72h_mm": "rain_72h_mm",
        "pressure_delta_abs": "pressure_delta_abs",
        "anomaly_score": "anomaly_score",
        "humidity_pct": "humidity_pct",
        "wind_gust_ms": "wind_gust_ms",
    }
    for factor, src_col in factor_src.items():
        pct_col = f"_pct_{factor}"
        df[pct_col] = df.groupby("station_id")[src_col].transform(
            lambda s: s.rank(pct=True, method="average") * 100
        )
        pct_cols[factor] = pct_col

    # weighted sum → risk_score [0, 100]
    risk_scores = sum(
        df[pct_cols[f]] * cfg["weight"]
        for f, cfg in weights.items()
    )
    df["risk_score"] = np.clip(risk_scores, 0, 100).round(1)
    df["risk_level"] = df["risk_score"].apply(_risk_level)

    # risk_factors computed only on snapshot (latest per station) — not 5M rows
    snapshot_idx = df.groupby("station_id")["timestamp"].transform("max") == df["timestamp"]
    snapshot = df[snapshot_idx].copy()

    def _top3_factors(row):
        contribs = []
        for factor, cfg in weights.items():
            pct_val = row[pct_cols[factor]]
            src = factor_src[factor]
            raw_val = row.get(src, np.nan)
            contribs.append({
                "factor": factor if factor != "pressure_delta_abs" else "pressure_delta_1h",
                "contribution": round(float(pct_val * cfg["weight"]), 2),
                "value": round(float(raw_val), 4) if pd.notna(raw_val) else None,
                "label": cfg["label"],
            })
        return sorted(contribs, key=lambda x: x["contribution"], reverse=True)[:3]

    snapshot["risk_factors"] = snapshot.apply(_top3_factors, axis=1)
    factors_map = dict(zip(snapshot["station_id"], snapshot["risk_factors"]))
    df["risk_factors"] = df["station_id"].map(factors_map)

    # drop internal columns
    df = df.drop(columns=["pressure_delta_abs"] + list(pct_cols.values()))
    return df


def get_current_risk_snapshot(risk_df: pd.DataFrame) -> pd.DataFrame:
    idx = risk_df.groupby("station_id")["timestamp"].idxmax()
    return risk_df.loc[idx].reset_index(drop=True)


def get_risk_history(
    risk_df: pd.DataFrame,
    station_id: str,
    days: int = 30,
) -> pd.DataFrame:
    station = risk_df[risk_df["station_id"] == station_id].copy()
    if station.empty:
        return station
    cutoff = station["timestamp"].max() - pd.Timedelta(days=days)
    return station[station["timestamp"] >= cutoff].reset_index(drop=True)
