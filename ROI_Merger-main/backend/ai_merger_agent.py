"""
AI Merger Agent - Uses ML to predict post-merger ROI instead of formulas.

Approach:
1. Build feature vectors for each firm from DB
2. Train XGBoost on all firms (features -> ROI)
3. Create a synthetic "merged firm" feature vector (combined features)
4. Predict merged ROI using the trained model
5. Use SHAP to explain what drives the merged ROI
6. Use forecasting agent to project 30-day post-merger ROI trajectory
"""
import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


def _build_firm_features(db, firm_id: int) -> Dict[str, float]:
    """Extract feature vector for a firm from DB."""
    rev_row = db.execute_query(
        "SELECT COALESCE(SUM(total_amount),0) as rev, COUNT(*) as txn FROM sales WHERE firm_id=%s",
        (firm_id,)
    )
    staff_row = db.execute_query(
        "SELECT COALESCE(SUM(salary),0) as salary, COUNT(*) as cnt, COALESCE(AVG(performance_score),0) as perf FROM staff WHERE firm_id=%s",
        (firm_id,)
    )
    firm_row = db.execute_query(
        "SELECT total_capital, founded_year FROM firm WHERE firm_id=%s", (firm_id,)
    )

    revenue = float(rev_row[0]["rev"])
    txn_count = int(rev_row[0]["txn"])
    salary = float(staff_row[0]["salary"])
    staff_count = int(staff_row[0]["cnt"])
    avg_perf = float(staff_row[0]["perf"])
    capital = float(firm_row[0]["total_capital"]) if firm_row else 0
    founded = int(firm_row[0]["founded_year"]) if firm_row else 2015
    age = 2025 - founded

    total_investment = salary + capital
    roi = ((revenue - salary) / total_investment * 100) if total_investment > 0 else 0
    rev_per_emp = revenue / max(staff_count, 1)
    cost_ratio = salary / max(revenue, 1)

    return {
        "firm_id": firm_id,
        "revenue": revenue,
        "salary": salary,
        "capital": capital,
        "staff_count": staff_count,
        "avg_performance": avg_perf,
        "txn_count": txn_count,
        "age_years": age,
        "rev_per_employee": rev_per_emp,
        "cost_ratio": cost_ratio,
        "total_investment": total_investment,
        "roi": roi,
    }


FEATURE_COLS = [
    "revenue", "salary", "capital", "staff_count", "avg_performance",
    "txn_count", "age_years", "rev_per_employee", "cost_ratio", "total_investment"
]


class AIMergerAgent:
    """Predicts post-merger ROI using XGBoost trained on all firms."""

    def __init__(self):
        self._model = None
        self._explainer = None
        self._trained = False

    def _train(self, all_features: List[Dict]) -> None:
        try:
            from xgboost import XGBRegressor
            import shap
            X = np.array([[f[c] for c in FEATURE_COLS] for f in all_features], dtype=np.float32)
            y = np.array([f["roi"] for f in all_features], dtype=np.float32)
            if len(X) < 3:
                return
            self._model = XGBRegressor(n_estimators=100, max_depth=3,
                                       learning_rate=0.1, verbosity=0)
            self._model.fit(X, y)
            self._explainer = shap.TreeExplainer(self._model)
            self._trained = True
        except Exception as e:
            logger.warning(f"AIMergerAgent train failed: {e}")

    def analyze(self, db, firm_a_id: int, firm_b_id: int) -> Dict[str, Any]:
        """Full AI-powered merger analysis."""

        # 1. Get all firm features for training
        firm_ids = [r["firm_id"] for r in db.execute_query("SELECT firm_id FROM firm")]
        all_features = [_build_firm_features(db, fid) for fid in firm_ids]

        # 2. Get individual firm features
        feat_a = _build_firm_features(db, firm_a_id)
        feat_b = _build_firm_features(db, firm_b_id)

        # 3. Train model on all firms
        self._train(all_features)

        # 4. Build merged firm feature vector
        # Synergy: 10% cost reduction, combined revenue, combined staff with 5% overlap reduction
        synergy_factor = 0.90
        merged_features = {
            "revenue": feat_a["revenue"] + feat_b["revenue"],
            "salary": (feat_a["salary"] + feat_b["salary"]) * synergy_factor,
            "capital": feat_a["capital"] + feat_b["capital"],
            "staff_count": int((feat_a["staff_count"] + feat_b["staff_count"]) * 0.95),
            "avg_performance": (feat_a["avg_performance"] + feat_b["avg_performance"]) / 2,
            "txn_count": feat_a["txn_count"] + feat_b["txn_count"],
            "age_years": max(feat_a["age_years"], feat_b["age_years"]),
            "rev_per_employee": 0,
            "cost_ratio": 0,
            "total_investment": 0,
        }
        merged_features["rev_per_employee"] = merged_features["revenue"] / max(merged_features["staff_count"], 1)
        merged_features["cost_ratio"] = merged_features["salary"] / max(merged_features["revenue"], 1)
        merged_features["total_investment"] = merged_features["salary"] + merged_features["capital"]

        # 5. Predict merged ROI
        x_merged = np.array([[merged_features[c] for c in FEATURE_COLS]], dtype=np.float32)

        if self._trained and self._model is not None:
            predicted_roi = float(self._model.predict(x_merged)[0])
            method = "XGBoost ML Prediction"
        else:
            # Fallback: weighted average of individual ROIs
            w_a = feat_a["revenue"] / max(feat_a["revenue"] + feat_b["revenue"], 1)
            predicted_roi = w_a * feat_a["roi"] + (1 - w_a) * feat_b["roi"]
            predicted_roi *= 1.08  # 8% synergy uplift
            method = "Weighted Average (fallback)"

        predicted_roi = round(predicted_roi, 2)

        # 6. SHAP explanation
        shap_contributions = []
        if self._trained and self._explainer is not None:
            try:
                shap_vals = self._explainer.shap_values(x_merged)[0]
                for name, val in zip(FEATURE_COLS, shap_vals):
                    shap_contributions.append({
                        "feature": name.replace("_", " "),
                        "shap_value": round(float(val), 3),
                        "direction": "positive" if val > 0 else "negative",
                    })
                shap_contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
            except Exception as e:
                logger.warning(f"SHAP failed: {e}")

        # 7. ROI trajectory using forecasting agent
        from forecasting_agent import ForecastingAgent
        fa = ForecastingAgent(horizon=30, lags=3)
        # Build synthetic ROI series: individual firm ROIs as history, merged as target
        roi_history = [f["roi"] for f in all_features if f["roi"] > 0]
        roi_history.append(predicted_roi)
        forecast = fa.forecast(roi_history)

        # 8. Synergy breakdown
        synergy_savings = (feat_a["salary"] + feat_b["salary"]) * 0.10
        merger_cost = (feat_a["capital"] + feat_b["capital"]) * 0.05
        net_benefit = merged_features["revenue"] - merged_features["salary"]

        # 9. Equity split by revenue contribution
        equity_a = round(feat_a["revenue"] / max(merged_features["revenue"], 1) * 100, 1)
        equity_b = round(100 - equity_a, 1)

        # 10. Recommendation
        roi_improvement = predicted_roi - ((feat_a["roi"] + feat_b["roi"]) / 2)
        if predicted_roi > 15 and roi_improvement > 0:
            recommendation = "Proceed"
        elif predicted_roi > 5:
            recommendation = "Review"
        else:
            recommendation = "Decline"

        # Build narrative
        top_drivers = shap_contributions[:3] if shap_contributions else []
        driver_text = ", ".join(f['feature'] for f in top_drivers if f['direction'] == 'positive')
        narrative = (
            f"The AI model predicts a post-merger ROI of {predicted_roi:.1f}%, "
            f"compared to {feat_a['roi']:.1f}% ({feat_a['firm_name']}) and "
            f"{feat_b['roi']:.1f}% ({feat_b['firm_name']}) individually. "
            f"{'Key value drivers: ' + driver_text + '.' if driver_text else ''} "
            f"Cost synergies of ${synergy_savings:,.0f} are projected from combined operations."
        )

        return {
            "firm_a": {**feat_a, "firm_name": _get_firm_name(db, firm_a_id)},
            "firm_b": {**feat_b, "firm_name": _get_firm_name(db, firm_b_id)},
            "merged_features": merged_features,
            "predicted_roi": predicted_roi,
            "firm_a_roi": round(feat_a["roi"], 2),
            "firm_b_roi": round(feat_b["roi"], 2),
            "roi_improvement": round(roi_improvement, 2),
            "combined_revenue": merged_features["revenue"],
            "combined_costs": merged_features["salary"],
            "estimated_synergies": round(synergy_savings, 2),
            "net_benefit": round(net_benefit, 2),
            "merger_cost": round(merger_cost, 2),
            "equity_distribution": {
                "firm_a_percentage": equity_a,
                "firm_b_percentage": equity_b,
            },
            "recommendation": recommendation,
            "method": method,
            "shap_contributions": shap_contributions[:6],
            "roi_forecast": forecast.get("predictions", [])[:30],
            "narrative": narrative,
        }


def _get_firm_name(db, firm_id: int) -> str:
    rows = db.execute_query("SELECT firm_name FROM firm WHERE firm_id=%s", (firm_id,))
    return rows[0]["firm_name"] if rows else f"Firm {firm_id}"
