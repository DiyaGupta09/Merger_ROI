"""
Forecasting Agent - Time-series ROI prediction using a lightweight
gradient-boosted model (XGBoost) with lag features.
Falls back to linear trend when data is sparse.
"""
import numpy as np
import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def _build_lag_features(values: List[float], lags: int = 3) -> np.ndarray:
    """Create lag feature matrix from a 1-D time series."""
    X, y = [], []
    for i in range(lags, len(values)):
        X.append(values[i - lags: i])
        y.append(values[i])
    return np.array(X), np.array(y)


class ForecastingAgent:
    """Predicts ROI for the next N days using XGBoost lag-feature model."""

    def __init__(self, horizon: int = 30, lags: int = 3):
        self.horizon = horizon
        self.lags = lags
        self._model = None

    # ------------------------------------------------------------------
    def train(self, roi_series: List[float]) -> None:
        """Fit model on historical ROI values."""
        try:
            from xgboost import XGBRegressor
            X, y = _build_lag_features(roi_series, self.lags)
            if len(X) < 2:
                self._model = None
                return
            self._model = XGBRegressor(n_estimators=100, max_depth=3,
                                       learning_rate=0.1, verbosity=0)
            self._model.fit(X, y)
        except Exception as e:
            logger.warning(f"XGBoost training failed, using linear fallback: {e}")
            self._model = None

    # ------------------------------------------------------------------
    def forecast(self, roi_series: List[float]) -> Dict[str, Any]:
        """
        Returns forecast dict:
          predictions: list of {date, value, lower, upper}
          key_drivers: list of {feature, importance}
        """
        if len(roi_series) < self.lags + 1:
            return self._linear_forecast(roi_series)

        self.train(roi_series)

        history = list(roi_series)
        predictions = []
        base_date = datetime.today()

        for step in range(self.horizon):
            date_str = (base_date + timedelta(days=step + 1)).strftime("%Y-%m-%d")
            if self._model is not None:
                x = np.array(history[-self.lags:]).reshape(1, -1)
                pred = float(self._model.predict(x)[0])
            else:
                # linear extrapolation
                pred = float(np.polyval(np.polyfit(range(len(history)), history, 1),
                                        len(history) + step))

            noise = np.std(history[-6:]) if len(history) >= 6 else abs(pred) * 0.05
            predictions.append({
                "date": date_str,
                "value": round(pred, 4),
                "lower": round(pred - 1.96 * noise, 4),
                "upper": round(pred + 1.96 * noise, 4),
            })
            history.append(pred)

        key_drivers = self._feature_importance()
        return {"predictions": predictions, "key_drivers": key_drivers}

    # ------------------------------------------------------------------
    def _linear_forecast(self, roi_series: List[float]) -> Dict[str, Any]:
        base = roi_series[-1] if roi_series else 0.0
        trend = (roi_series[-1] - roi_series[0]) / max(len(roi_series) - 1, 1) if len(roi_series) > 1 else 0
        base_date = datetime.today()
        predictions = []
        for step in range(self.horizon):
            val = base + trend * (step + 1)
            predictions.append({
                "date": (base_date + timedelta(days=step + 1)).strftime("%Y-%m-%d"),
                "value": round(val, 4),
                "lower": round(val * 0.9, 4),
                "upper": round(val * 1.1, 4),
            })
        return {"predictions": predictions, "key_drivers": []}

    # ------------------------------------------------------------------
    def _feature_importance(self) -> List[Dict[str, Any]]:
        if self._model is None:
            return []
        try:
            scores = self._model.feature_importances_
            return [{"feature": f"lag_{i+1}", "importance": round(float(s), 4)}
                    for i, s in enumerate(scores)]
        except Exception:
            return []
