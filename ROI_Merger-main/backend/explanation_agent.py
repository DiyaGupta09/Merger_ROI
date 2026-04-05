"""
Explanation Agent - Uses XGBoost + SHAP to explain WHY ROI changes.
Trains on tabular firm features and returns SHAP-based feature contributions.
"""
import numpy as np
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

FEATURE_NAMES = [
    "total_revenue", "total_salary_cost", "staff_count",
    "avg_performance", "capital", "revenue_per_employee",
    "task_count", "budget_allocated", "cash_flow",
]


class ExplanationAgent:
    """Explains ROI drivers using XGBoost + SHAP values."""

    def __init__(self):
        self._model = None
        self._explainer = None

    # ------------------------------------------------------------------
    def fit(self, X: np.ndarray, y: np.ndarray) -> None:
        try:
            from xgboost import XGBRegressor
            import shap
            self._model = XGBRegressor(n_estimators=80, max_depth=3,
                                       learning_rate=0.1, verbosity=0)
            self._model.fit(X, y)
            self._explainer = shap.TreeExplainer(self._model)
        except Exception as e:
            logger.warning(f"ExplanationAgent fit failed: {e}")

    # ------------------------------------------------------------------
    def explain(self, x_row: np.ndarray) -> Dict[str, Any]:
        """
        Returns:
          feature_importance: [{feature, shap_value, direction}]
          narrative: human-readable explanation string
        """
        if self._model is None or self._explainer is None:
            return self._fallback_explain(x_row)

        try:
            import shap
            shap_vals = self._explainer.shap_values(x_row.reshape(1, -1))[0]
            contributions = []
            for name, val in zip(FEATURE_NAMES, shap_vals):
                contributions.append({
                    "feature": name,
                    "shap_value": round(float(val), 4),
                    "direction": "positive" if val > 0 else "negative",
                })
            contributions.sort(key=lambda c: abs(c["shap_value"]), reverse=True)
            narrative = self._build_narrative(contributions)
            return {"feature_importance": contributions, "narrative": narrative}
        except Exception as e:
            logger.warning(f"SHAP explain failed: {e}")
            return self._fallback_explain(x_row)

    # ------------------------------------------------------------------
    def _build_narrative(self, contributions: List[Dict]) -> str:
        top_pos = [c for c in contributions if c["direction"] == "positive"][:2]
        top_neg = [c for c in contributions if c["direction"] == "negative"][:2]
        parts = []
        if top_pos:
            drivers = " and ".join(c["feature"].replace("_", " ") for c in top_pos)
            parts.append(f"ROI is being driven up by {drivers}")
        if top_neg:
            drags = " and ".join(c["feature"].replace("_", " ") for c in top_neg)
            parts.append(f"held back by {drags}")
        return ". ".join(parts) + "." if parts else "Insufficient data for narrative."

    # ------------------------------------------------------------------
    def _fallback_explain(self, x_row: np.ndarray) -> Dict[str, Any]:
        contributions = []
        for i, name in enumerate(FEATURE_NAMES):
            val = float(x_row[i]) if i < len(x_row) else 0.0
            contributions.append({
                "feature": name,
                "shap_value": round(val * 0.01, 4),
                "direction": "positive" if val > 0 else "negative",
            })
        return {
            "feature_importance": contributions,
            "narrative": "Model not yet trained. Showing raw feature values.",
        }
