import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

DB_PATH = os.environ.get("DB_PATH", "assets/banco_de_dados.db")
ANOMALY_DIR = os.environ.get("ANOMALY_DIR", "backend/models/artifacts/isolation_forest")
CLUSTERING_DIR = os.environ.get("CLUSTERING_DIR", "backend/models/artifacts/clustering")
FEATURES_CACHE = os.environ.get("FEATURES_CACHE", "backend/models/artifacts/features_cache.parquet")
_SKIP_STARTUP = os.environ.get("SKIP_STARTUP", "0") == "1"

_startup_progress = {"pct": 0, "stage": "Aguardando...", "done": False}


def _set_stage(pct: int, stage: str) -> None:
    _startup_progress["pct"] = pct
    _startup_progress["stage"] = stage


def _models_trained() -> bool:
    import glob
    return (
        os.path.exists(FEATURES_CACHE)
        and len(glob.glob(os.path.join(ANOMALY_DIR, "*.joblib"))) > 0
        and os.path.exists(os.path.join(CLUSTERING_DIR, "kmeans.joblib"))
    )


async def _run_pipeline() -> None:
    import asyncio
    import pandas as pd
    from backend.models.anomaly import train_anomaly_models, predict_anomaly_score
    from backend.models.risk import compute_risk_score
    from backend.models.gemeo import build_station_profiles, train_clustering
    from backend.data.store import store

    loop = asyncio.get_event_loop()

    try:
        cached = _models_trained()

        if cached:
            _set_stage(10, "Carregando features do cache...")
            features = await loop.run_in_executor(None, pd.read_parquet, FEATURES_CACHE)

            _set_stage(40, "Carregando modelos de anomalia...")
            scored = await loop.run_in_executor(None, predict_anomaly_score, features, ANOMALY_DIR)

            _set_stage(65, "Calculando scores de risco...")
            risk = await loop.run_in_executor(None, compute_risk_score, scored, scored)

            _set_stage(80, "Carregando Gêmeo Climático...")
            profiles = await loop.run_in_executor(None, build_station_profiles, features)
            clustered = await loop.run_in_executor(None, lambda: train_clustering(profiles, output_dir=CLUSTERING_DIR))
        else:
            from backend.data.pipeline import load_raw_data
            from backend.data.features import build_feature_matrix

            _set_stage(5, "Lendo banco de dados (5,2M leituras)...")
            df = await loop.run_in_executor(None, load_raw_data, DB_PATH)

            _set_stage(25, "Calculando features climáticas...")
            features = await loop.run_in_executor(None, build_feature_matrix, df)

            _set_stage(40, "Salvando cache de features...")
            os.makedirs(os.path.dirname(FEATURES_CACHE), exist_ok=True)
            await loop.run_in_executor(None, lambda: features.to_parquet(FEATURES_CACHE, index=False))

            _set_stage(50, "Treinando Radar de Extremos (IsolationForest)...")
            await loop.run_in_executor(None, train_anomaly_models, features, ANOMALY_DIR)
            scored = await loop.run_in_executor(None, predict_anomaly_score, features, ANOMALY_DIR)

            _set_stage(70, "Calculando scores de risco...")
            risk = await loop.run_in_executor(None, compute_risk_score, scored, scored)

            _set_stage(82, "Treinando Gêmeo Climático (KMeans)...")
            profiles = await loop.run_in_executor(None, build_station_profiles, features)
            clustered = await loop.run_in_executor(None, lambda: train_clustering(profiles, output_dir=CLUSTERING_DIR))

        _set_stage(95, "Populando painel operacional...")
        store.populate(risk, clustered)

        _set_stage(100, "Pronto!")
        _startup_progress["done"] = True
    except Exception as exc:
        _startup_progress["stage"] = f"Erro: {exc}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not _SKIP_STARTUP:
        import asyncio
        asyncio.create_task(_run_pipeline())
    else:
        _startup_progress.update({"pct": 100, "stage": "Pronto!", "done": True})
    yield


app = FastAPI(title="GuardiãoIA Meteorológico", version="0.1.0", lifespan=lifespan)

_cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def require_store_loaded(request: Request, call_next):
    from backend.data.store import store
    skip = request.url.path in ("/health", "/startup-progress")
    if not skip and not store.loaded:
        return JSONResponse(status_code=503, content={"error": "loading", "pct": _startup_progress["pct"], "stage": _startup_progress["stage"]})
    return await call_next(request)


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"error": "not found"})


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"error": "internal server error"})


@app.get("/startup-progress")
async def startup_progress():
    return _startup_progress


@app.get("/health")
async def health():
    from backend.data.store import store
    return {
        "status": "ok",
        "stations_loaded": int(store.snapshot_df.shape[0]) if store.loaded else 0,
        "records_loaded": store.total_records,
    }


from backend.routes import dashboard, stations, cities, radar, risk, clusters

app.include_router(dashboard.router, prefix="/dashboard")
app.include_router(stations.router, prefix="/stations")
app.include_router(cities.router, prefix="/cities")
app.include_router(radar.router, prefix="/radar")
app.include_router(risk.router, prefix="/risk")
app.include_router(clusters.router, prefix="/clusters")
