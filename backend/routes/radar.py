from fastapi import APIRouter, HTTPException, Query
from backend.data.store import store, station_city

router = APIRouter(tags=["radar"])


@router.get("/ranking")
async def radar_ranking(limit: int = Query(10, ge=1, le=100)):
    s = store.snapshot_df.nlargest(limit, "anomaly_score")
    result = []
    for _, row in s.iterrows():
        result.append({
            "station_id": str(row["station_id"]),
            "city": station_city(str(row["station_id"])),
            "anomaly_score": round(float(row["anomaly_score"]), 4) if row["anomaly_score"] == row["anomaly_score"] else None,
            "anomaly_label": str(row["anomaly_label"]) if row["anomaly_label"] else None,
            "main_driver": str(row["main_driver"]) if row["main_driver"] else None,
            "driver_value": round(float(row["driver_value"]), 4) if row["driver_value"] == row["driver_value"] else None,
        })
    return result


@router.get("/station/{station_id}")
async def radar_station(station_id: str):
    rows = store.snapshot_df[store.snapshot_df["station_id"] == station_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    row = rows.iloc[0]

    station_hist = store.risk_df[store.risk_df["station_id"] == station_id][
        ["timestamp", "anomaly_score"]
    ].tail(720)

    history = [
        {
            "timestamp": r["timestamp"].isoformat(),
            "anomaly_score": round(float(r["anomaly_score"]), 4) if r["anomaly_score"] == r["anomaly_score"] else None,
        }
        for _, r in station_hist.iterrows()
    ]

    return {
        "station_id": station_id,
        "current_anomaly_score": round(float(row["anomaly_score"]), 4) if row["anomaly_score"] == row["anomaly_score"] else None,
        "anomaly_label": str(row["anomaly_label"]) if row["anomaly_label"] else None,
        "main_driver": str(row["main_driver"]) if row["main_driver"] else None,
        "history": history,
    }
