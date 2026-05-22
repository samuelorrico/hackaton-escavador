import os
import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

PROFILE_FEATURES = [
    "avg_rain_1h_mm", "avg_temp_c", "avg_humidity_pct",
    "avg_pressure_mb", "avg_wind_gust_ms",
]

MIN_ROWS = 100


def build_station_profiles(feature_df: pd.DataFrame) -> pd.DataFrame:
    grp = feature_df.groupby("station_id")
    profiles = grp.agg(
        avg_rain_1h_mm=("rain_1h_mm", "mean"),
        std_rain_1h_mm=("rain_1h_mm", "std"),
        avg_temp_c=("air_temp_c", "mean"),
        std_temp_c=("air_temp_c", "std"),
        avg_humidity_pct=("humidity_pct", "mean"),
        std_humidity_pct=("humidity_pct", "std"),
        avg_pressure_mb=("pressure_mb", "mean"),
        std_pressure_mb=("pressure_mb", "std"),
        avg_wind_gust_ms=("wind_gust_ms", "mean"),
        n_valid=("rain_1h_mm", "count"),
    ).reset_index()
    profiles["sufficient_data"] = profiles["n_valid"] >= MIN_ROWS
    return profiles


def _elbow_k(X_scaled: np.ndarray, max_k: int) -> int:
    inertias = []
    ks = range(2, max_k + 1)
    for k in ks:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X_scaled)
        inertias.append(km.inertia_)
    # pick k where second derivative of inertia is max (elbow)
    if len(inertias) < 3:
        return ks[0]
    diffs2 = np.diff(np.diff(inertias))
    return int(ks[np.argmax(diffs2) + 1])


def _cluster_label(centroid: np.ndarray, feature_names: list[str]) -> str:
    d = dict(zip(feature_names, centroid))
    rain = d.get("avg_rain_1h_mm", 0)
    temp = d.get("avg_temp_c", 25)
    humidity = d.get("avg_humidity_pct", 70)
    if rain > 2.0 and humidity > 75:
        return "Chuvoso costeiro"
    if rain < 0.5 and temp > 28:
        return "Semiárido quente"
    if rain > 1.0 and temp < 24:
        return "Chuvoso serrano"
    if humidity < 60:
        return "Árido seco"
    return "Tropical moderado"


def train_clustering(
    profiles_df: pd.DataFrame,
    max_k: int = 8,
    output_dir: str = "backend/models/artifacts/clustering",
) -> pd.DataFrame:
    os.makedirs(output_dir, exist_ok=True)
    df = profiles_df.copy()
    df["climate_cluster"] = -1
    df["cluster_label"] = "insuficiente"
    df["cluster_deviation_score"] = np.nan

    sufficient = df[df["sufficient_data"]].copy()
    if len(sufficient) < 2:
        return df

    X = sufficient[PROFILE_FEATURES].fillna(0).to_numpy()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k = min(_elbow_k(X_scaled, max_k), len(sufficient))
    if k < 2:
        k = 2
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X_scaled)
    labels = km.labels_

    # invert scaling so labels use real-world values
    centers_real = scaler.inverse_transform(km.cluster_centers_)
    cluster_labels = [
        _cluster_label(centers_real[i], PROFILE_FEATURES)
        for i in range(k)
    ]
    # deduplicate: if two clusters share a label, append cluster index
    seen: dict[str, int] = {}
    for i, lbl in enumerate(cluster_labels):
        if lbl in seen:
            cluster_labels[seen[lbl]] = f"{lbl} A"
            cluster_labels[i] = f"{lbl} B"
        else:
            seen[lbl] = i

    # deviation score: euclidean distance to centroid, normalized to [0,1]
    distances = np.linalg.norm(X_scaled - km.cluster_centers_[labels], axis=1)
    max_dist = distances.max() if distances.max() > 0 else 1.0
    deviation_scores = distances / max_dist

    df.loc[sufficient.index, "climate_cluster"] = labels
    df.loc[sufficient.index, "cluster_label"] = [cluster_labels[l] for l in labels]
    df.loc[sufficient.index, "cluster_deviation_score"] = deviation_scores

    artifact = {
        "kmeans": km,
        "scaler": scaler,
        "cluster_labels": cluster_labels,
        "profile_features": PROFILE_FEATURES,
        "max_dist": max_dist,
    }
    joblib.dump(artifact, os.path.join(output_dir, "kmeans.joblib"))
    return df


def get_station_cluster_info(station_id: str, profiles_df: pd.DataFrame) -> dict:
    row = profiles_df[profiles_df["station_id"] == station_id].iloc[0]
    cluster_id = int(row["climate_cluster"])
    same_cluster = profiles_df[
        (profiles_df["climate_cluster"] == cluster_id)
        & (profiles_df["station_id"] != station_id)
    ]["station_id"].tolist()
    return {
        "station_id": station_id,
        "climate_cluster": cluster_id,
        "cluster_label": str(row["cluster_label"]),
        "cluster_size": int(profiles_df[profiles_df["climate_cluster"] == cluster_id].shape[0]),
        "cluster_deviation_score": float(row["cluster_deviation_score"]) if pd.notna(row["cluster_deviation_score"]) else None,
        "similar_stations": same_cluster,
        "profile": {
            "avg_rain_1h_mm": round(float(row["avg_rain_1h_mm"]), 2) if pd.notna(row["avg_rain_1h_mm"]) else None,
            "avg_temp_c": round(float(row["avg_temp_c"]), 2) if pd.notna(row["avg_temp_c"]) else None,
            "avg_humidity_pct": round(float(row["avg_humidity_pct"]), 2) if pd.notna(row["avg_humidity_pct"]) else None,
            "avg_pressure_mb": round(float(row["avg_pressure_mb"]), 2) if pd.notna(row["avg_pressure_mb"]) else None,
        },
    }


def detect_current_deviation(
    station_id: str,
    current_features: dict,
    profiles_df: pd.DataFrame,
    models_dir: str = "backend/models/artifacts/clustering",
) -> float:
    artifact_path = os.path.join(models_dir, "kmeans.joblib")
    if not os.path.exists(artifact_path):
        return 0.0
    artifact = joblib.load(artifact_path)
    scaler = artifact["scaler"]
    km = artifact["kmeans"]
    max_dist = artifact["max_dist"]
    feat_names = artifact["profile_features"]

    row = profiles_df[profiles_df["station_id"] == station_id]
    if row.empty:
        return 0.0
    cluster_id = int(row.iloc[0]["climate_cluster"])
    if cluster_id < 0:
        return 0.0

    vec = np.array([[current_features.get(f, 0.0) for f in feat_names]])
    vec_scaled = scaler.transform(vec)
    centroid = km.cluster_centers_[cluster_id]
    dist = float(np.linalg.norm(vec_scaled - centroid))
    return float(np.clip(dist / max_dist, 0.0, 1.0))
