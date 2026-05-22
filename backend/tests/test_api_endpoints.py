"""API endpoint tests using mock store data."""
import time
import numpy as np
import pandas as pd
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

BASE_TIME = datetime(2019, 6, 1)
N_STATIONS = 5
N_HOURS = 200


def _make_risk_df() -> pd.DataFrame:
    rng = np.random.default_rng(0)
    records = []
    stations = [f"A40{i}" for i in range(1, N_STATIONS + 1)]
    for sid in stations:
        for i in range(N_HOURS):
            records.append({
                "station_id": sid,
                "timestamp": BASE_TIME + timedelta(hours=i),
                "rain_1h_mm": float(rng.exponential(2)),
                "pressure_mb": float(1013 + rng.normal(0, 3)),
                "air_temp_c": float(25 + rng.normal(0, 2)),
                "humidity_pct": float(70 + rng.normal(0, 8)),
                "wind_gust_ms": float(5 + rng.exponential(2)),
                "rain_72h_mm": float(rng.exponential(10)),
                "pressure_delta_1h": float(rng.normal(0, 2)),
                "anomaly_score": float(rng.beta(1, 4)),
                "anomaly_label": "normal",
                "main_driver": "rain_24h_mm",
                "driver_value": float(rng.exponential(5)),
                "driver_zscore": float(rng.normal(1, 0.5)),
                "risk_score": float(rng.uniform(0, 100)),
                "risk_level": rng.choice(["baixo", "médio", "alto", "crítico"]),
                "risk_factors": [
                    {"factor": "rain_72h_mm", "contribution": 20.0, "value": 15.0, "label": "Chuva acumulada 72h"},
                    {"factor": "anomaly_score", "contribution": 12.0, "value": 0.3, "label": "Comportamento atípico"},
                    {"factor": "humidity_pct", "contribution": 5.0, "value": 75.0, "label": "Umidade do ar"},
                ],
            })
    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)


def _make_profiles_df(risk_df: pd.DataFrame) -> pd.DataFrame:
    from backend.models.gemeo import build_station_profiles, train_clustering
    import tempfile, os
    simple_df = risk_df[["station_id", "rain_1h_mm", "pressure_mb", "air_temp_c",
                          "humidity_pct", "wind_gust_ms"]].copy()
    simple_df["solar_radiation_wm2"] = 200.0
    profiles = build_station_profiles(simple_df)
    with tempfile.TemporaryDirectory() as d:
        clustered = train_clustering(profiles, max_k=3, output_dir=d)
    return clustered


@pytest.fixture(autouse=True)
def populated_store(monkeypatch):
    from backend.data import store as store_mod
    risk_df = _make_risk_df()
    profiles_df = _make_profiles_df(risk_df)
    store_mod.store.populate(risk_df, profiles_df)
    yield
    store_mod.store.loaded = False


@pytest.fixture
def client():
    import os
    os.environ["SKIP_STARTUP"] = "1"
    from backend.main import app
    return TestClient(app)


def test_health_returns_200(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["stations_loaded"] == N_STATIONS


def test_dashboard_summary_has_required_fields(client):
    r = client.get("/dashboard/summary")
    assert r.status_code == 200
    data = r.json()
    for field in ["total_stations", "critical_stations", "high_risk_stations",
                  "top_risk_station", "most_anomalous_station", "cities_with_alert"]:
        assert field in data, f"Missing field: {field}"
    assert data["total_stations"] == N_STATIONS


def test_stations_list_returns_all(client):
    r = client.get("/stations")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == N_STATIONS
    for s in data:
        assert "station_id" in s
        assert "risk_level" in s


def test_station_detail_has_risk_factors(client):
    r = client.get("/stations/A401")
    assert r.status_code == 200
    data = r.json()
    assert "risk_factors" in data
    assert isinstance(data["risk_factors"], list)
    assert len(data["risk_factors"]) > 0
    assert "current_readings" in data


def test_history_respects_days_param(client):
    r30 = client.get("/stations/A401/history?days=30")
    r7 = client.get("/stations/A401/history?days=7")
    assert r30.status_code == 200
    assert r7.status_code == 200
    # 30-day window should have >= 7-day window results
    assert len(r30.json()) >= len(r7.json())


def test_invalid_station_returns_404(client):
    r = client.get("/stations/ZZZZ")
    assert r.status_code == 404


def test_all_endpoints_respond_under_200ms(client):
    endpoints = [
        "/health",
        "/dashboard/summary",
        "/dashboard/risk-ranking",
        "/stations",
        "/stations/A401",
        "/stations/A401/history",
        "/radar/ranking",
        "/risk/distribution",
        "/clusters",
    ]
    for ep in endpoints:
        t0 = time.time()
        r = client.get(ep)
        elapsed_ms = (time.time() - t0) * 1000
        assert r.status_code == 200, f"{ep} returned {r.status_code}"
        assert elapsed_ms < 200, f"{ep} took {elapsed_ms:.0f}ms (> 200ms limit)"
