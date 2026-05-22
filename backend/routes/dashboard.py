from fastapi import APIRouter, Query
from backend.data.store import store, station_city, row_to_dict

router = APIRouter(tags=["dashboard"])


@router.get("/summary")
async def dashboard_summary():
    s = store.snapshot_df
    total = len(s)
    critical = int((s["risk_level"] == "crítico").sum())
    high = int((s["risk_level"] == "alto").sum())

    top_risk_row = s.loc[s["risk_score"].idxmax()]
    most_anomalous_row = s.loc[s["anomaly_score"].idxmax()]

    cities_alert = s[s["risk_level"].isin(["alto", "crítico"])]["station_id"].apply(station_city).nunique()

    return {
        "total_stations": total,
        "critical_stations": critical,
        "high_risk_stations": high,
        "top_risk_station": {
            "station_id": str(top_risk_row["station_id"]),
            "risk_score": round(float(top_risk_row["risk_score"]), 1),
            "risk_level": str(top_risk_row["risk_level"]),
        },
        "most_anomalous_station": {
            "station_id": str(most_anomalous_row["station_id"]),
            "anomaly_score": round(float(most_anomalous_row["anomaly_score"]), 4),
        },
        "cities_with_alert": int(cities_alert),
    }


@router.get("/risk-ranking")
async def risk_ranking(limit: int = Query(10, ge=1, le=100)):
    s = store.snapshot_df.nlargest(limit, "risk_score")
    result = []
    for _, row in s.iterrows():
        result.append({
            "station_id": str(row["station_id"]),
            "city": station_city(row["station_id"]),
            "risk_score": round(float(row["risk_score"]), 1),
            "risk_level": str(row["risk_level"]),
            "anomaly_score": round(float(row["anomaly_score"]), 4) if row["anomaly_score"] == row["anomaly_score"] else None,
        })
    return result
