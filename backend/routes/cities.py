from fastapi import APIRouter, HTTPException
from backend.data.store import store, station_city, city_slug, slug_to_city

router = APIRouter(tags=["cities"])

_RISK_ORDER = {"baixo": 0, "médio": 1, "alto": 2, "crítico": 3}


def _build_city_groups():
    groups: dict[str, list] = {}
    for _, row in store.snapshot_df.iterrows():
        city = station_city(str(row["station_id"]))
        groups.setdefault(city, []).append(row)
    return groups


@router.get("")
async def list_cities():
    groups = _build_city_groups()
    result = []
    for city, rows in sorted(groups.items()):
        scores = [float(r["risk_score"]) for r in rows]
        levels = [str(r["risk_level"]) for r in rows]
        max_level = max(levels, key=lambda l: _RISK_ORDER.get(l, 0))
        result.append({
            "city": city,
            "station_count": len(rows),
            "avg_risk_score": round(sum(scores) / len(scores), 1),
            "max_risk_level": max_level,
            "stations": [str(r["station_id"]) for r in rows],
        })
    return result


@router.get("/{city_slug_param}")
async def city_detail(city_slug_param: str):
    groups = _build_city_groups()
    city = slug_to_city(city_slug_param, list(groups.keys()))
    if city is None:
        raise HTTPException(status_code=404, detail=f"City '{city_slug_param}' not found")

    rows = groups[city]
    scores = [float(r["risk_score"]) for r in rows]
    levels = [str(r["risk_level"]) for r in rows]
    dominant = max(levels, key=lambda l: _RISK_ORDER.get(l, 0))
    most_critical = max(rows, key=lambda r: float(r["risk_score"]))

    return {
        "city": city,
        "stations": [str(r["station_id"]) for r in rows],
        "avg_risk_score": round(sum(scores) / len(scores), 1),
        "dominant_risk_level": dominant,
        "most_critical_station": {
            "station_id": str(most_critical["station_id"]),
            "risk_score": round(float(most_critical["risk_score"]), 1),
        },
    }
