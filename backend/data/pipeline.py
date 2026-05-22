import sqlite3
import pandas as pd

COLUMN_MAP = {
    "ESTACAO": "station_id",
    "DATA_YYYY-MM-DD": "_date",
    "HORA_UTC": "_hora",
    "PRECIPITACAO_TOTAL_HORARIO_mm": "rain_1h_mm",
    "PRESSAO_ATMOSFERICA_AO_NIVEL_DA_ESTACAO_HORARIA_mB": "pressure_mb",
    "RADIACAO_GLOBAL_W_m2": "solar_radiation_wm2",
    "TEMPERATURA_DO_AR_-_BULBO_SECO_HORARIA_C": "air_temp_c",
    "UMIDADE_RELATIVA_DO_AR_HORARIA_%": "humidity_pct",
    "VENTO_RAJADA_MAXIMA_m_s": "wind_gust_ms",
}

EXPECTED_COLUMNS = [
    "station_id", "timestamp", "rain_1h_mm", "pressure_mb",
    "solar_radiation_wm2", "air_temp_c", "humidity_pct", "wind_gust_ms",
]

NUMERIC_COLUMNS = [
    "rain_1h_mm", "pressure_mb", "solar_radiation_wm2",
    "air_temp_c", "humidity_pct", "wind_gust_ms",
]


def load_raw_data(db_path: str) -> pd.DataFrame:
    """Read banco_de_dados.db, rename columns, build timestamp, return clean DataFrame."""
    conn = sqlite3.connect(db_path)
    try:
        quoted = ", ".join(f'"{c}"' for c in COLUMN_MAP.keys())
        df = pd.read_sql_query(f"SELECT {quoted} FROM dados", conn)
    finally:
        conn.close()

    df = df.rename(columns=COLUMN_MAP)

    # HORA_UTC stored as "0", "100", "1300" → pad to "0000", "0100", "1300"
    df["_hora"] = df["_hora"].astype(str).str.strip().str.zfill(4)
    df["timestamp"] = pd.to_datetime(
        df["_date"].str.strip() + " " + df["_hora"],
        format="%Y-%m-%d %H%M",
        errors="coerce",
    )
    df = df.drop(columns=["_date", "_hora"])

    for col in NUMERIC_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype("float64")

    df = df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)

    # forward-fill nulls per station, max 3 consecutive hours
    df[NUMERIC_COLUMNS] = (
        df.groupby("station_id", group_keys=False)[NUMERIC_COLUMNS]
        .apply(lambda g: g.ffill(limit=3))
    )

    return df[EXPECTED_COLUMNS].reset_index(drop=True)


def validate_schema(df: pd.DataFrame) -> bool:
    """Return True if DataFrame has all expected columns with correct types."""
    for col in EXPECTED_COLUMNS:
        if col not in df.columns:
            return False
    if not pd.api.types.is_datetime64_any_dtype(df["timestamp"]):
        return False
    for col in NUMERIC_COLUMNS:
        if not pd.api.types.is_float_dtype(df[col]):
            return False
    return True
