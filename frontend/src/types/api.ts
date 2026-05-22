import type { RiskLevel, AnomalyLabel } from '../lib/utils'

export interface DashboardSummary {
  total_stations: number
  critical_stations: number
  high_risk_stations: number
  top_risk_station: { station_id: string; risk_score: number; risk_level: RiskLevel }
  most_anomalous_station: { station_id: string; anomaly_score: number }
  cities_with_alert: number
}

export interface StationRanking {
  station_id: string
  city: string
  risk_score: number
  risk_level: RiskLevel
  anomaly_score: number | null
}

export interface StationListItem {
  station_id: string
  city: string
  cluster_label: string | null
  risk_level: RiskLevel
}

export interface RiskFactor {
  factor: string
  contribution: number
  value: number | null
  label: string
}

export interface StationDetail {
  station_id: string
  city: string
  risk_score: number
  risk_level: RiskLevel
  anomaly_score: number | null
  anomaly_label: AnomalyLabel | null
  climate_cluster: number | null
  cluster_label: string | null
  cluster_deviation_score: number | null
  current_readings: {
    rain_1h_mm: number | null
    pressure_mb: number | null
    air_temp_c: number | null
    humidity_pct: number | null
    wind_gust_ms: number | null
  }
  risk_factors: RiskFactor[]
}

export interface StationHistory {
  timestamp: string
  risk_score: number | null
  rain_1h_mm: number | null
  pressure_mb: number | null
  air_temp_c: number | null
  humidity_pct: number | null
  wind_gust_ms: number | null
}

export interface AnomalyHistory {
  timestamp: string
  anomaly_score: number | null
  anomaly_label: AnomalyLabel | null
  main_driver: string | null
}

export interface CityListItem {
  city: string
  station_count: number
  avg_risk_score: number
  max_risk_level: RiskLevel
  stations: string[]
}

export interface CityDetail {
  city: string
  stations: string[]
  avg_risk_score: number
  dominant_risk_level: RiskLevel
  most_critical_station: { station_id: string; risk_score: number }
}

export interface RadarRankingItem {
  station_id: string
  city: string
  anomaly_score: number | null
  anomaly_label: AnomalyLabel | null
  main_driver: string | null
  driver_value: number | null
}

export interface RiskDistribution {
  baixo: number
  médio: number
  alto: number
  crítico: number
}

export interface ClusterListItem {
  cluster_id: number
  label: string
  station_count: number
  stations: string[]
}

export interface ClusterDetail {
  cluster_id: number
  label: string
  station_count: number
  profile: {
    avg_rain_1h_mm?: number
    avg_temp_c?: number
    avg_humidity_pct?: number
    avg_pressure_mb?: number
  }
  stations: Array<{ station_id: string; city: string; deviation_score: number | null }>
}

export interface StationClusterInfo {
  station_id: string
  climate_cluster: number
  cluster_label: string
  cluster_deviation_score: number | null
  similar_stations: Array<{ station_id: string; city: string }>
  profile_comparison: {
    station: Record<string, number>
    cluster_avg: Record<string, number>
  }
}
