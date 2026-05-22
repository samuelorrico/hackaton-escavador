import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

FEATURES = [
    "rain_24h_mm", "pressure_delta_1h", "temp_delta_1h",
    "humidity_delta_1h", "rain_zscore", "pressure_zscore",
]


def _normalize(raw_scores: np.ndarray, score_min: float, score_max: float) -> np.ndarray:
    if score_max > score_min:
        normed = (raw_scores - score_min) / (score_max - score_min)
    else:
        normed = np.zeros(len(raw_scores))
    return np.clip(normed, 0.0, 1.0)


def _label(score: float) -> str:
    if score < 0.4:
        return "normal"
    if score <= 0.7:
        return "atípico"
    return "extremo"


def train_anomaly_models(feature_df: pd.DataFrame, output_dir: str) -> dict:
    os.makedirs(output_dir, exist_ok=True)
    results = {}
    for station_id, group in feature_df.groupby("station_id"):
        X = group[FEATURES].dropna()
        if len(X) < 10:
            continue
        model = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
        model.fit(X)
        raw = -model.decision_function(X)
        artifact = {
            "model": model,
            "score_min": float(raw.min()),
            "score_max": float(raw.max()),
        }
        path = os.path.join(output_dir, f"{station_id}.joblib")
        joblib.dump(artifact, path)
        results[station_id] = path
    return results


def predict_anomaly_score(feature_df: pd.DataFrame, models_dir: str) -> pd.DataFrame:
    df = feature_df.copy()
    df["anomaly_score"] = np.nan
    df["anomaly_label"] = None
    df["main_driver"] = None
    df["driver_value"] = np.nan
    df["driver_zscore"] = np.nan

    for station_id, group in df.groupby("station_id"):
        path = os.path.join(models_dir, f"{station_id}.joblib")
        if not os.path.exists(path):
            continue
        artifact = joblib.load(path)
        model = artifact["model"]
        score_min = artifact["score_min"]
        score_max = artifact["score_max"]

        X = group[FEATURES].fillna(0)
        raw = -model.decision_function(X)
        normed = _normalize(raw, score_min, score_max)
        labels = np.vectorize(_label)(normed)

        feat_means = X.mean()
        feat_stds = X.std().replace(0, 1.0)
        z_abs = ((X - feat_means) / feat_stds).abs()
        main_drivers = z_abs.idxmax(axis=1)
        col_indices = [X.columns.get_loc(c) for c in main_drivers]
        driver_vals = X.to_numpy()[np.arange(len(X)), col_indices]
        driver_zs = z_abs.max(axis=1).to_numpy()

        df.loc[group.index, "anomaly_score"] = normed
        df.loc[group.index, "anomaly_label"] = labels
        df.loc[group.index, "main_driver"] = main_drivers.values
        df.loc[group.index, "driver_value"] = driver_vals
        df.loc[group.index, "driver_zscore"] = driver_zs

    return df


def get_extremes_ranking(
    scored_df: pd.DataFrame,
    top_n: int = 10,
    reference_timestamp: str = None,
) -> list[dict]:
    if reference_timestamp is None:
        ref_ts = scored_df["timestamp"].max()
    else:
        ref_ts = pd.Timestamp(reference_timestamp)

    latest = scored_df[scored_df["timestamp"] == ref_ts].dropna(subset=["anomaly_score"])
    top = latest.nlargest(top_n, "anomaly_score")

    result = []
    for _, row in top.iterrows():
        result.append({
            "station_id": str(row["station_id"]),
            "timestamp": row["timestamp"].isoformat(),
            "anomaly_score": round(float(row["anomaly_score"]), 4),
            "anomaly_label": str(row["anomaly_label"]) if row["anomaly_label"] else None,
            "main_driver": str(row["main_driver"]) if row["main_driver"] else None,
            "driver_value": round(float(row["driver_value"]), 4) if pd.notna(row["driver_value"]) else None,
            "driver_zscore": round(float(row["driver_zscore"]), 4) if pd.notna(row["driver_zscore"]) else None,
        })
    return result
