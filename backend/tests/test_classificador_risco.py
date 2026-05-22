import pandas as pd
import numpy as np
import pytest
from datetime import datetime, timedelta
from backend.models.risk import compute_risk_score, get_current_risk_snapshot, get_risk_history

BASE_TIME = datetime(2020, 1, 1)


def make_scored_df(n_stations=3, n_hours=100, seed=99):
    rng = np.random.default_rng(seed)
    records = []
    for s in range(n_stations):
        sid = f"A{s:03d}"
        for i in range(n_hours):
            records.append({
                "station_id": sid,
                "timestamp": BASE_TIME + timedelta(hours=i),
                "rain_1h_mm": float(rng.exponential(2)),
                "rain_72h_mm": float(rng.exponential(10)),
                "pressure_mb": float(1013 + rng.normal(0, 3)),
                "pressure_delta_1h": float(rng.normal(0, 2)),
                "air_temp_c": float(25 + rng.normal(0, 2)),
                "humidity_pct": float(70 + rng.normal(0, 8)),
                "wind_gust_ms": float(5 + rng.exponential(2)),
                "anomaly_score": float(rng.beta(1, 4)),
            })
    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)


def test_risk_score_range_0_to_100():
    df = make_scored_df()
    result = compute_risk_score(df, df)
    scores = result["risk_score"].dropna()
    assert len(scores) > 0
    assert scores.min() >= 0 - 1e-9
    assert scores.max() <= 100 + 1e-9


def test_risk_level_boundaries():
    df = make_scored_df()
    result = compute_risk_score(df, df)
    labeled = result.dropna(subset=["risk_score", "risk_level"])
    baixo = labeled[labeled["risk_score"] <= 25]
    medio = labeled[(labeled["risk_score"] > 25) & (labeled["risk_score"] <= 50)]
    alto = labeled[(labeled["risk_score"] > 50) & (labeled["risk_score"] <= 75)]
    critico = labeled[labeled["risk_score"] > 75]
    if len(baixo): assert (baixo["risk_level"] == "baixo").all()
    if len(medio): assert (medio["risk_level"] == "médio").all()
    if len(alto): assert (alto["risk_level"] == "alto").all()
    if len(critico): assert (critico["risk_level"] == "crítico").all()


def test_risk_factors_has_3_items():
    df = make_scored_df()
    result = compute_risk_score(df, df)
    for factors in result["risk_factors"].dropna():
        assert len(factors) == 3, f"Expected 3 risk_factors, got {len(factors)}"
        for f in factors:
            assert "factor" in f
            assert "contribution" in f
            assert "value" in f
            assert "label" in f


def test_deterministic_same_input_same_output():
    df = make_scored_df(seed=42)
    r1 = compute_risk_score(df, df)
    r2 = compute_risk_score(df, df)
    pd.testing.assert_series_equal(r1["risk_score"], r2["risk_score"])


def test_current_snapshot_one_row_per_station():
    df = make_scored_df(n_stations=4)
    result = compute_risk_score(df, df)
    snapshot = get_current_risk_snapshot(result)
    assert len(snapshot) == 4
    assert snapshot["station_id"].nunique() == 4
