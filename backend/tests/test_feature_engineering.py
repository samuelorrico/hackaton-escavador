import pandas as pd
import numpy as np
import pytest
from datetime import datetime, timedelta
from backend.data.features import (
    compute_rain_accumulations,
    compute_deltas,
    compute_rolling_stats,
    compute_zscore,
    build_feature_matrix,
)

RAIN_ACC_COLS = ["rain_6h_mm", "rain_12h_mm", "rain_24h_mm", "rain_48h_mm", "rain_72h_mm"]
DELTA_COLS = ["pressure_delta_1h", "temp_delta_1h", "humidity_delta_1h", "wind_delta_1h"]
MA_COLS = ["temp_ma_24h", "humidity_ma_24h", "pressure_ma_24h"]
ZSCORE_COLS = ["rain_zscore", "pressure_zscore", "temp_zscore", "humidity_zscore"]
ALL_FEATURE_COLS = RAIN_ACC_COLS + DELTA_COLS + MA_COLS + ZSCORE_COLS


def make_df(n_hours=100, n_stations=2, rain_val=1.0):
    base = datetime(2020, 1, 1)
    records = []
    for s in range(n_stations):
        for i in range(n_hours):
            records.append({
                "station_id": f"A{s:03d}",
                "timestamp": base + timedelta(hours=i),
                "rain_1h_mm": rain_val,
                "pressure_mb": 1013.0 + i * 0.01,
                "solar_radiation_wm2": 100.0,
                "air_temp_c": 25.0 + i * 0.01,
                "humidity_pct": 70.0,
                "wind_gust_ms": 5.0,
            })
    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    for col in ["rain_1h_mm", "pressure_mb", "solar_radiation_wm2",
                "air_temp_c", "humidity_pct", "wind_gust_ms"]:
        df[col] = df[col].astype("float64")
    return df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)


def test_rain_accumulations_no_future_leak():
    df = make_df(n_hours=80, rain_val=1.0)
    out = compute_rain_accumulations(df)
    # at hour index 5 (6th row per station), rain_6h should be sum of hours 0-5 = 6
    # NOT including any future rows
    s = out[out["station_id"] == "A000"].reset_index(drop=True)
    val = s.loc[5, "rain_6h_mm"]
    assert val == pytest.approx(6.0, abs=0.01), f"Expected 6.0 got {val}"


def test_rain_6h_correct_value():
    df = make_df(n_hours=50, rain_val=2.0)
    out = compute_rain_accumulations(df)
    s = out[out["station_id"] == "A000"].reset_index(drop=True)
    # at index 5: 6 rows × 2.0 = 12.0
    assert s.loc[5, "rain_6h_mm"] == pytest.approx(12.0, abs=0.01)
    # rain_24h at index 23: 24 rows × 2.0 = 48.0
    assert s.loc[23, "rain_24h_mm"] == pytest.approx(48.0, abs=0.01)


def test_deltas_groupby_station():
    df = make_df(n_hours=10, n_stations=2)
    out = compute_deltas(df)
    # first row of each station must be NaN delta (no prior row)
    for sid in ["A000", "A001"]:
        s = out[out["station_id"] == sid].reset_index(drop=True)
        assert pd.isna(s.loc[0, "pressure_delta_1h"]), "First row delta must be NaN"
    # delta must not bleed across stations: last row of A000 != first row of A001
    a000_last_idx = out[out["station_id"] == "A000"].index[-1]
    a001_first_idx = out[out["station_id"] == "A001"].index[0]
    assert pd.isna(out.loc[a001_first_idx, "pressure_delta_1h"])


def test_zscore_mean_near_zero_per_station():
    df = make_df(n_hours=200, n_stations=2)
    out = compute_zscore(df)
    for sid in out["station_id"].unique():
        s = out[out["station_id"] == sid]["temp_zscore"].dropna()
        assert abs(s.mean()) < 0.1, f"Station {sid} temp_zscore mean not near 0: {s.mean()}"


def test_build_feature_matrix_has_all_columns():
    df = make_df(n_hours=100, n_stations=2)
    out = build_feature_matrix(df)
    for col in ALL_FEATURE_COLS:
        assert col in out.columns, f"Missing feature column: {col}"
