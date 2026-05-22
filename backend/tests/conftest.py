import pandas as pd
import numpy as np
import pytest
from datetime import datetime, timedelta


@pytest.fixture
def sample_df() -> pd.DataFrame:
    """1000-row sample DataFrame matching the expected pipeline output schema."""
    np.random.seed(42)
    stations = [f"A{i:03d}" for i in range(1, 6)]  # 5 stations x 200 rows each
    base_time = datetime(2020, 1, 1)

    records = []
    for station in stations:
        for i in range(200):
            records.append({
                "station_id": station,
                "timestamp": base_time + timedelta(hours=i),
                "rain_1h_mm": max(0, np.random.normal(2, 5)),
                "pressure_mb": np.random.normal(1013, 5),
                "solar_radiation_wm2": max(0, np.random.normal(200, 150)),
                "air_temp_c": np.random.normal(25, 5),
                "humidity_pct": np.clip(np.random.normal(75, 15), 0, 100),
                "wind_gust_ms": max(0, np.random.normal(5, 3)),
            })

    df = pd.DataFrame(records)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)
    return df
