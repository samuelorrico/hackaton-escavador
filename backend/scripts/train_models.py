"""Train all ML models and save artifacts to backend/models/artifacts/."""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.data.pipeline import load_raw_data
from backend.data.features import build_feature_matrix
from backend.models.anomaly import train_anomaly_models
from backend.models.gemeo import build_station_profiles, train_clustering

DB_PATH = "assets/banco_de_dados.db"
ANOMALY_DIR = "backend/models/artifacts/isolation_forest"
CLUSTERING_DIR = "backend/models/artifacts/clustering"


def main():
    print("Loading raw data...")
    df = load_raw_data(DB_PATH)
    print(f"Loaded {len(df):,} rows, {df['station_id'].nunique()} stations")

    print("Building features...")
    features = build_feature_matrix(df)
    print("Features ready")

    print("Training IsolationForest models...")
    results = train_anomaly_models(features, ANOMALY_DIR)
    print(f"Trained {len(results)} models → {ANOMALY_DIR}")

    print("Building station profiles and clustering...")
    profiles = build_station_profiles(features)
    clustered = train_clustering(profiles, max_k=8, output_dir=CLUSTERING_DIR)
    n_clusters = clustered["climate_cluster"].max() + 1
    print(f"Clustered {len(clustered)} stations into {n_clusters} clusters → {CLUSTERING_DIR}")


if __name__ == "__main__":
    main()
