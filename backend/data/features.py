import pandas as pd

_RAIN_WINDOWS = {"rain_6h_mm": 6, "rain_12h_mm": 12, "rain_24h_mm": 24, "rain_48h_mm": 48, "rain_72h_mm": 72}
_DELTA_MAP = {
    "pressure_delta_1h": "pressure_mb",
    "temp_delta_1h": "air_temp_c",
    "humidity_delta_1h": "humidity_pct",
    "wind_delta_1h": "wind_gust_ms",
}
_ZSCORE_MAP = {
    "rain_zscore": "rain_1h_mm",
    "pressure_zscore": "pressure_mb",
    "temp_zscore": "air_temp_c",
    "humidity_zscore": "humidity_pct",
}


def compute_rain_accumulations(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    grouped = df.groupby("station_id")["rain_1h_mm"]
    for col, w in _RAIN_WINDOWS.items():
        df[col] = grouped.transform(lambda s: s.rolling(window=w, min_periods=1).sum())
    return df


def compute_deltas(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for new_col, src_col in _DELTA_MAP.items():
        df[new_col] = df.groupby("station_id")[src_col].transform(lambda s: s.diff(1))
    return df


def compute_rolling_stats(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["temp_ma_24h"] = df.groupby("station_id")["air_temp_c"].transform(
        lambda s: s.rolling(window=24, min_periods=1).mean()
    )
    df["humidity_ma_24h"] = df.groupby("station_id")["humidity_pct"].transform(
        lambda s: s.rolling(window=24, min_periods=1).mean()
    )
    df["pressure_ma_24h"] = df.groupby("station_id")["pressure_mb"].transform(
        lambda s: s.rolling(window=24, min_periods=1).mean()
    )
    return df


def compute_zscore(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for new_col, src_col in _ZSCORE_MAP.items():
        means = df.groupby("station_id")[src_col].transform("mean")
        stds = df.groupby("station_id")[src_col].transform("std")
        df[new_col] = (df[src_col] - means) / stds.replace(0, float("nan"))
    return df


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    df = compute_rain_accumulations(df)
    df = compute_deltas(df)
    df = compute_rolling_stats(df)
    df = compute_zscore(df)
    return df
