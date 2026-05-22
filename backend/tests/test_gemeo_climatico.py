import os
import tempfile
import pandas as pd
import numpy as np
import pytest
from datetime import datetime, timedelta
from backend.models.gemeo import (
    build_station_profiles,
    train_clustering,
    get_station_cluster_info,
    detect_current_deviation,
)

BASE_TIME = datetime(2015, 1, 1)


def make_feature_df(n_stations=6, n_hours=200, seed=7):
    rng = np.random.default_rng(seed)
    records = []
    for s in range(n_stations):
        rain_base = rng.uniform(0, 5)
        temp_base = rng.uniform(20, 35)
        for i in range(n_hours):
            records.append({
                "station_id": f"A{s:03d}",
                "timestamp": BASE_TIME + timedelta(hours=i),
                "rain_1h_mm": float(rng.exponential(rain_base + 0.1)),
                "pressure_mb": float(1013 + rng.normal(0, 3)),
                "air_temp_c": float(temp_base + rng.normal(0, 1)),
                "humidity_pct": float(70 + rng.normal(0, 5)),
                "wind_gust_ms": float(5 + rng.exponential(1)),
                "solar_radiation_wm2": float(200 + rng.normal(0, 50)),
                "rain_24h_mm": float(rng.exponential(5)),
                "pressure_delta_1h": float(rng.normal(0, 1)),
                "temp_delta_1h": float(rng.normal(0, 0.3)),
                "humidity_delta_1h": float(rng.normal(0, 2)),
                "rain_zscore": float(rng.normal(0, 1)),
                "pressure_zscore": float(rng.normal(0, 1)),
            })
    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)


def test_station_profiles_one_row_per_station():
    df = make_feature_df(n_stations=5)
    profiles = build_station_profiles(df)
    assert len(profiles) == 5
    assert profiles["station_id"].nunique() == 5
    assert "avg_rain_1h_mm" in profiles.columns
    assert "avg_temp_c" in profiles.columns


def test_all_stations_have_cluster():
    df = make_feature_df(n_stations=6, n_hours=200)
    profiles = build_station_profiles(df)
    with tempfile.TemporaryDirectory() as tmpdir:
        clustered = train_clustering(profiles, max_k=4, output_dir=tmpdir)
    sufficient = clustered[clustered["sufficient_data"]]
    assert (sufficient["climate_cluster"] >= 0).all()
    assert "cluster_label" in clustered.columns


def test_cluster_deviation_range_0_to_1():
    df = make_feature_df(n_stations=6, n_hours=200)
    profiles = build_station_profiles(df)
    with tempfile.TemporaryDirectory() as tmpdir:
        clustered = train_clustering(profiles, max_k=4, output_dir=tmpdir)
    scores = clustered[clustered["sufficient_data"]]["cluster_deviation_score"].dropna()
    assert len(scores) > 0
    assert scores.min() >= 0.0 - 1e-9
    assert scores.max() <= 1.0 + 1e-9


def test_similar_stations_same_cluster():
    df = make_feature_df(n_stations=6, n_hours=200)
    profiles = build_station_profiles(df)
    with tempfile.TemporaryDirectory() as tmpdir:
        clustered = train_clustering(profiles, max_k=4, output_dir=tmpdir)
    sufficient = clustered[clustered["sufficient_data"]]
    if len(sufficient) < 2:
        pytest.skip("Not enough stations with sufficient data")
    station = sufficient.iloc[0]["station_id"]
    info = get_station_cluster_info(station, clustered)
    my_cluster = info["climate_cluster"]
    for neighbor in info["similar_stations"]:
        neighbor_cluster = clustered[clustered["station_id"] == neighbor].iloc[0]["climate_cluster"]
        assert neighbor_cluster == my_cluster, f"{neighbor} in different cluster than {station}"
