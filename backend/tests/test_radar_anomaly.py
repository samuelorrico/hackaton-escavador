import os
import tempfile
import pandas as pd
import numpy as np
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
from backend.models.anomaly import (
    train_anomaly_models,
    predict_anomaly_score,
    get_extremes_ranking,
    FEATURES,
)

BASE_TIME = datetime(2020, 1, 1)


def make_feature_df(n_hours=300, n_stations=3, seed=42):
    rng = np.random.default_rng(seed)
    records = []
    for s in range(n_stations):
        sid = f"A{s:03d}"
        for i in range(n_hours):
            records.append({
                "station_id": sid,
                "timestamp": BASE_TIME + timedelta(hours=i),
                "rain_1h_mm": float(rng.exponential(2)),
                "pressure_mb": float(1013 + rng.normal(0, 5)),
                "air_temp_c": float(25 + rng.normal(0, 3)),
                "humidity_pct": float(70 + rng.normal(0, 10)),
                "wind_gust_ms": float(5 + rng.exponential(2)),
                "rain_24h_mm": float(rng.exponential(5)),
                "pressure_delta_1h": float(rng.normal(0, 1)),
                "temp_delta_1h": float(rng.normal(0, 0.5)),
                "humidity_delta_1h": float(rng.normal(0, 2)),
                "rain_zscore": float(rng.normal(0, 1)),
                "pressure_zscore": float(rng.normal(0, 1)),
            })
    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)


def test_train_creates_model_per_station():
    df = make_feature_df(n_stations=3)
    with tempfile.TemporaryDirectory() as tmpdir:
        result = train_anomaly_models(df, tmpdir)
        assert len(result) == 3
        for sid in df["station_id"].unique():
            path = os.path.join(tmpdir, f"{sid}.joblib")
            assert os.path.exists(path), f"Model file missing for {sid}"


def test_anomaly_score_range_0_to_1():
    df = make_feature_df(n_stations=2)
    with tempfile.TemporaryDirectory() as tmpdir:
        train_anomaly_models(df, tmpdir)
        scored = predict_anomaly_score(df, tmpdir)
    scores = scored["anomaly_score"].dropna()
    assert len(scores) > 0
    assert scores.min() >= 0.0 - 1e-9
    assert scores.max() <= 1.0 + 1e-9


def test_anomaly_label_boundaries():
    df = make_feature_df(n_stations=2)
    with tempfile.TemporaryDirectory() as tmpdir:
        train_anomaly_models(df, tmpdir)
        scored = predict_anomaly_score(df, tmpdir)
    labeled = scored.dropna(subset=["anomaly_score", "anomaly_label"])
    normal_rows = labeled[labeled["anomaly_score"] < 0.4]
    atipico_rows = labeled[(labeled["anomaly_score"] >= 0.4) & (labeled["anomaly_score"] <= 0.7)]
    extremo_rows = labeled[labeled["anomaly_score"] > 0.7]
    if len(normal_rows):
        assert (normal_rows["anomaly_label"] == "normal").all()
    if len(atipico_rows):
        assert (atipico_rows["anomaly_label"] == "atípico").all()
    if len(extremo_rows):
        assert (extremo_rows["anomaly_label"] == "extremo").all()


def test_ranking_returns_top_n():
    df = make_feature_df(n_stations=5, n_hours=50)
    with tempfile.TemporaryDirectory() as tmpdir:
        train_anomaly_models(df, tmpdir)
        scored = predict_anomaly_score(df, tmpdir)
    ranking = get_extremes_ranking(scored, top_n=3)
    assert len(ranking) <= 3
    scores = [r["anomaly_score"] for r in ranking]
    assert scores == sorted(scores, reverse=True), "Ranking not sorted desc"
    for r in ranking:
        assert "station_id" in r
        assert "anomaly_score" in r
        assert "anomaly_label" in r
        assert "main_driver" in r


def test_predict_uses_saved_model_not_retrain():
    df = make_feature_df(n_stations=2, n_hours=100)
    with tempfile.TemporaryDirectory() as tmpdir:
        train_anomaly_models(df, tmpdir)
        with patch("backend.models.anomaly.joblib.load", wraps=__import__("joblib").load) as mock_load:
            predict_anomaly_score(df, tmpdir)
        assert mock_load.call_count == len(df["station_id"].unique()), (
            f"Expected {len(df['station_id'].unique())} joblib.load calls, got {mock_load.call_count}"
        )
