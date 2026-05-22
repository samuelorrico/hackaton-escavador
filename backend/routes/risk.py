from fastapi import APIRouter, HTTPException
from backend.data.store import store

router = APIRouter(tags=["risk"])


@router.get("/distribution")
async def risk_distribution():
    counts = store.snapshot_df["risk_level"].value_counts().to_dict()
    return {
        "baixo": int(counts.get("baixo", 0)),
        "médio": int(counts.get("médio", 0)),
        "alto": int(counts.get("alto", 0)),
        "crítico": int(counts.get("crítico", 0)),
    }


@router.get("/station/{station_id}")
async def risk_station(station_id: str):
    rows = store.snapshot_df[store.snapshot_df["station_id"] == station_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    row = rows.iloc[0]

    hist_rows = store.risk_df[store.risk_df["station_id"] == station_id][
        ["timestamp", "risk_score", "risk_level"]
    ].tail(720)

    history = [
        {
            "timestamp": r["timestamp"].isoformat(),
            "risk_score": round(float(r["risk_score"]), 1) if r["risk_score"] == r["risk_score"] else None,
            "risk_level": str(r["risk_level"]) if r["risk_level"] else None,
        }
        for _, r in hist_rows.iterrows()
    ]

    return {
        "station_id": station_id,
        "risk_score": round(float(row["risk_score"]), 1),
        "risk_level": str(row["risk_level"]),
        "risk_factors": row["risk_factors"] if isinstance(row["risk_factors"], list) else [],
        "history": history,
    }
