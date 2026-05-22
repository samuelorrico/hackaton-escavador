from fastapi import APIRouter, HTTPException, Query
from backend.data.store import store, station_city

router = APIRouter(tags=["stations"])

_READING_COLS = ["rain_1h_mm", "pressure_mb", "air_temp_c", "humidity_pct", "wind_gust_ms"]
_HISTORY_COLS = ["timestamp", "risk_score", "rain_1h_mm", "pressure_mb", "air_temp_c", "humidity_pct", "wind_gust_ms"]
_ANOMALY_HISTORY_COLS = ["timestamp", "anomaly_score", "anomaly_label", "main_driver"]


def _get_station_snapshot(station_id: str):
    rows = store.snapshot_df[store.snapshot_df["station_id"] == station_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    return rows.iloc[0]


def _get_cluster_row(station_id: str):
    if store.profiles_df is None:
        return None
    rows = store.profiles_df[store.profiles_df["station_id"] == station_id]
    return rows.iloc[0] if not rows.empty else None


@router.get("")
async def list_stations():
    result = []
    for _, row in store.snapshot_df.iterrows():
        sid = str(row["station_id"])
        cluster_row = _get_cluster_row(sid)
        result.append({
            "station_id": sid,
            "city": station_city(sid),
            "cluster_label": str(cluster_row["cluster_label"]) if cluster_row is not None else None,
            "risk_level": str(row["risk_level"]),
        })
    return result


@router.get("/{station_id}")
async def station_detail(station_id: str):
    row = _get_station_snapshot(station_id)
    cluster_row = _get_cluster_row(station_id)

    readings = {col: (round(float(row[col]), 4) if row[col] == row[col] else None) for col in _READING_COLS}

    return {
        "station_id": station_id,
        "city": station_city(station_id),
        "risk_score": round(float(row["risk_score"]), 1),
        "risk_level": str(row["risk_level"]),
        "anomaly_score": round(float(row["anomaly_score"]), 4) if row["anomaly_score"] == row["anomaly_score"] else None,
        "anomaly_label": str(row["anomaly_label"]) if row["anomaly_label"] else None,
        "climate_cluster": int(cluster_row["climate_cluster"]) if cluster_row is not None else None,
        "cluster_label": str(cluster_row["cluster_label"]) if cluster_row is not None else None,
        "cluster_deviation_score": round(float(cluster_row["cluster_deviation_score"]), 4) if cluster_row is not None and cluster_row["cluster_deviation_score"] == cluster_row["cluster_deviation_score"] else None,
        "current_readings": readings,
        "risk_factors": row["risk_factors"] if isinstance(row["risk_factors"], list) else [],
    }


@router.get("/{station_id}/history")
async def station_history(station_id: str, days: int = Query(30, ge=1, le=365)):
    if store.risk_df[store.risk_df["station_id"] == station_id].empty:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    from backend.models.risk import get_risk_history
    hist = get_risk_history(store.risk_df, station_id, days)
    result = []
    for _, row in hist[_HISTORY_COLS].iterrows():
        d = {"timestamp": row["timestamp"].isoformat()}
        for col in _HISTORY_COLS[1:]:
            val = row[col]
            d[col] = round(float(val), 4) if val == val else None
        result.append(d)
    return result


@router.get("/{station_id}/anomaly-history")
async def station_anomaly_history(station_id: str, days: int = Query(30, ge=1, le=365)):
    if store.risk_df[store.risk_df["station_id"] == station_id].empty:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    from backend.models.risk import get_risk_history
    hist = get_risk_history(store.risk_df, station_id, days)
    result = []
    for _, row in hist[_ANOMALY_HISTORY_COLS].iterrows():
        result.append({
            "timestamp": row["timestamp"].isoformat(),
            "anomaly_score": round(float(row["anomaly_score"]), 4) if row["anomaly_score"] == row["anomaly_score"] else None,
            "anomaly_label": str(row["anomaly_label"]) if row["anomaly_label"] else None,
            "main_driver": str(row["main_driver"]) if row["main_driver"] else None,
        })
    return result
