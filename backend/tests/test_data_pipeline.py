import pandas as pd
import numpy as np
import pytest
from backend.data.pipeline import load_raw_data, validate_schema

DB_PATH = "assets/banco_de_dados.db"

EXPECTED_COLUMNS = [
    "station_id", "timestamp", "rain_1h_mm", "pressure_mb",
    "solar_radiation_wm2", "air_temp_c", "humidity_pct", "wind_gust_ms",
]


def test_load_returns_dataframe():
    df = load_raw_data(DB_PATH)
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0


def test_columns_renamed_correctly():
    df = load_raw_data(DB_PATH)
    for col in EXPECTED_COLUMNS:
        assert col in df.columns, f"Missing column: {col}"


def test_timestamp_is_datetime():
    df = load_raw_data(DB_PATH)
    assert pd.api.types.is_datetime64_any_dtype(df["timestamp"])


def test_numeric_columns_are_float():
    df = load_raw_data(DB_PATH)
    numeric_cols = ["rain_1h_mm", "pressure_mb", "solar_radiation_wm2",
                    "air_temp_c", "humidity_pct", "wind_gust_ms"]
    for col in numeric_cols:
        assert pd.api.types.is_float_dtype(df[col]), f"{col} not float"


def test_sorted_by_station_and_timestamp():
    df = load_raw_data(DB_PATH)
    sorted_df = df.sort_values(["station_id", "timestamp"])
    assert df["station_id"].tolist() == sorted_df["station_id"].tolist()


def test_validate_schema_passes_on_valid_df():
    df = load_raw_data(DB_PATH)
    assert validate_schema(df) is True


def test_validate_schema_fails_on_missing_column(sample_df):
    assert validate_schema(sample_df.drop(columns=["rain_1h_mm"])) is False


def test_no_future_timestamps():
    df = load_raw_data(DB_PATH)
    assert df["timestamp"].max() < pd.Timestamp("2030-01-01")


def test_load_raises_on_bad_path():
    with pytest.raises(Exception):
        load_raw_data("nonexistent/path.db")
