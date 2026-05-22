"""In-memory data store populated at startup."""
import pandas as pd
import numpy as np

_CITY_MAP: dict[str, str] = {
    "A401": "Salvador", "A402": "Vitória da Conquista", "A403": "Barreiras",
    "A404": "Feira de Santana", "A405": "Ilhéus", "A406": "Juazeiro",
    "A407": "Conceição do Coité", "A408": "Porto Seguro", "A409": "Caetité",
    "A410": "Seabra", "A411": "Cruz das Almas", "A412": "Bom Jesus da Lapa",
    "A413": "Guanambi", "A414": "Paulo Afonso", "A415": "Euclides da Cunha",
    "A416": "Ipirá", "A417": "Maracás", "A418": "Monte Santo",
    "A421": "Jequié", "A422": "Itapetinga", "A423": "Mucuri",
    "A424": "Belmonte", "A425": "Valença", "A426": "Jacobina",
    "A427": "Senhor do Bonfim", "A428": "Alagoinhas", "A429": "Santo Amaro",
    "A430": "Tucano", "A431": "Itaberaba", "A432": "Santa Cruz Cabrália",
    "A433": "Brumado", "A434": "Ribeira do Pombal", "A435": "Canavieiras",
    "A436": "Itamaraju", "A437": "Medeiros Neto", "A438": "Ipiaú",
    "A439": "Uruçuca", "A440": "Lençóis", "A441": "Gentio do Ouro",
    "A442": "Livramento de Nossa Senhora", "A443": "Rio de Contas",
    "A444": "Utinga", "A445": "Água Fria", "A446": "Ponto Novo",
    "A447": "Santaluz", "A448": "Irecê", "A449": "Morro do Chapéu",
    "A450": "Jeremoabo", "A452": "Itaetê", "A454": "Wanderley",
    "A455": "Correntina", "A456": "Eunápolis", "A457": "Teixeira de Freitas",
    "A458": "Mairi", "A459": "Lauro de Freitas", "A460": "Lapão",
    "A461": "Wenceslau Guimarães", "A462": "Camaçari", "A463": "Cocos",
    "A464": "Tapiramutá", "A465": "Remanso", "A466": "Ibotirama",
    "A467": "Xique-Xique", "A468": "Barra",
}


def station_city(station_id: str) -> str:
    sid = str(station_id).strip()
    return _CITY_MAP.get(sid, f"Estação {sid}")


def _slugify(text: str) -> str:
    import unicodedata
    s = unicodedata.normalize("NFD", text.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.replace(" ", "-")


def city_slug(city: str) -> str:
    return _slugify(city)


def slug_to_city(slug: str, known_cities: list[str]) -> str | None:
    for c in known_cities:
        if city_slug(c) == slug:
            return c
    return None


def _to_python(val):
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(val) else float(val)
    if isinstance(val, float) and np.isnan(val):
        return None
    return val


def row_to_dict(row: pd.Series) -> dict:
    return {k: _to_python(v) for k, v in row.items()}


class DataStore:
    def __init__(self):
        self.risk_df: pd.DataFrame | None = None
        self.profiles_df: pd.DataFrame | None = None
        self.snapshot_df: pd.DataFrame | None = None
        self.loaded: bool = False
        self.total_records: int = 0

    def populate(
        self,
        risk_df: pd.DataFrame,
        profiles_df: pd.DataFrame,
    ) -> None:
        self.risk_df = risk_df
        self.profiles_df = profiles_df
        snapshot = (
            risk_df.loc[
                risk_df.groupby("station_id")["timestamp"].idxmax()
            ].copy().reset_index(drop=True)
        )
        # fill NaN numerics so JSON serialization never fails
        for col in ["risk_score", "anomaly_score", "rain_1h_mm", "pressure_mb", "air_temp_c", "humidity_pct", "wind_gust_ms"]:
            if col in snapshot.columns:
                snapshot[col] = snapshot[col].fillna(0.0)
        snapshot["risk_level"] = snapshot["risk_level"].fillna("baixo")
        # re-label anomaly relative to peer stations in snapshot
        # top 10% = extremo, next 20% = atípico, rest = normal
        if "anomaly_score" in snapshot.columns and len(snapshot) > 1:
            pct = snapshot["anomaly_score"].rank(pct=True)
            snapshot["anomaly_label"] = np.where(
                pct >= 0.90, "extremo",
                np.where(pct >= 0.70, "atípico", "normal")
            )
        else:
            snapshot["anomaly_label"] = snapshot["anomaly_label"].fillna("normal")
        self.snapshot_df = snapshot
        self.total_records = len(risk_df)
        self.loaded = True


store = DataStore()
