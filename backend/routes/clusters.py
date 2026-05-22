from fastapi import APIRouter, HTTPException
from backend.data.store import store, station_city
from backend.models.gemeo import get_station_cluster_info

router = APIRouter(tags=["clusters"])


@router.get("")
async def list_clusters():
    pdf = store.profiles_df
    sufficient = pdf[pdf["sufficient_data"]]
    groups: dict[int, list] = {}
    for _, row in sufficient.iterrows():
        cid = int(row["climate_cluster"])
        groups.setdefault(cid, []).append(row)

    result = []
    for cid, rows in sorted(groups.items()):
        result.append({
            "cluster_id": cid,
            "label": str(rows[0]["cluster_label"]),
            "station_count": len(rows),
            "stations": [str(r["station_id"]) for r in rows],
        })
    return result


@router.get("/station/{station_id}")
async def cluster_station(station_id: str):
    pdf = store.profiles_df
    rows = pdf[pdf["station_id"] == station_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"Station {station_id} not found")
    info = get_station_cluster_info(station_id, pdf)
    snap_rows = store.snapshot_df[store.snapshot_df["station_id"] == station_id]
    snap = snap_rows.iloc[0] if not snap_rows.empty else None

    cluster_avg = {
        col: round(float(pdf[pdf["climate_cluster"] == info["climate_cluster"]][col].mean()), 4)
        for col in ["avg_rain_1h_mm", "avg_temp_c", "avg_humidity_pct", "avg_pressure_mb"]
        if col in pdf.columns
    }

    station_profile = {
        col.replace("avg_", ""): round(float(rows.iloc[0][col]), 4)
        for col in ["avg_rain_1h_mm", "avg_temp_c", "avg_humidity_pct", "avg_pressure_mb"]
        if col in pdf.columns
    }

    return {
        "station_id": station_id,
        "climate_cluster": info["climate_cluster"],
        "cluster_label": info["cluster_label"],
        "cluster_deviation_score": info["cluster_deviation_score"],
        "similar_stations": [
            {"station_id": s, "city": station_city(s)}
            for s in info["similar_stations"]
        ],
        "profile_comparison": {
            "station": station_profile,
            "cluster_avg": cluster_avg,
        },
    }


@router.get("/{cluster_id}")
async def cluster_detail(cluster_id: int):
    pdf = store.profiles_df
    cluster_rows = pdf[pdf["climate_cluster"] == cluster_id]
    if cluster_rows.empty:
        raise HTTPException(status_code=404, detail=f"Cluster {cluster_id} not found")

    label = str(cluster_rows.iloc[0]["cluster_label"])
    stations = []
    for _, row in cluster_rows.iterrows():
        sid = str(row["station_id"])
        dev = float(row["cluster_deviation_score"]) if row["cluster_deviation_score"] == row["cluster_deviation_score"] else None
        stations.append({
            "station_id": sid,
            "city": station_city(sid),
            "deviation_score": round(dev, 4) if dev is not None else None,
        })

    profile_cols = ["avg_rain_1h_mm", "avg_temp_c", "avg_humidity_pct", "avg_pressure_mb"]
    profile = {
        col: round(float(cluster_rows[col].mean()), 4)
        for col in profile_cols if col in cluster_rows.columns
    }

    return {
        "cluster_id": cluster_id,
        "label": label,
        "station_count": len(stations),
        "profile": profile,
        "stations": stations,
    }
