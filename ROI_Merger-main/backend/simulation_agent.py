"""
Simulation Agent - Runs "what-if" scenarios comparing current vs RL strategy.
"""
import numpy as np
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SimulationAgent:
    """Simulates 30-day ROI trajectory under current vs optimized strategy."""

    def __init__(self, horizon: int = 30):
        self.horizon = horizon

    # ------------------------------------------------------------------
    def simulate(self, state: Dict[str, Any], rl_recommendations: List[Dict]) -> Dict[str, Any]:
        """
        Returns:
          current_trajectory: [{day, roi}]
          optimized_trajectory: [{day, roi}]
          improvement_pct: float
          decision_trace: [str]
        """
        base_roi = float(state.get("roi", 10.0))
        cash_flow = float(state.get("cash_flow", 0))
        task_backlog = float(state.get("task_backlog", 50))

        current_traj = self._simulate_strategy(base_roi, cash_flow, task_backlog,
                                               boost=0.0)
        opt_boost = self._compute_boost(rl_recommendations)
        optimized_traj = self._simulate_strategy(base_roi, cash_flow, task_backlog,
                                                  boost=opt_boost)

        current_final = current_traj[-1]["roi"]
        optimized_final = optimized_traj[-1]["roi"]

        # Use absolute difference instead of relative % to avoid division by near-zero
        abs_improvement = optimized_final - current_final
        # Express as % improvement relative to a meaningful base (avg of both)
        base = (abs(current_final) + abs(optimized_final)) / 2
        improvement = round((abs_improvement / max(base, 1.0)) * 100, 2)
        # Cap at realistic range
        improvement = round(min(max(improvement, -50), 50), 2)

        trace = self._build_trace(rl_recommendations, opt_boost, improvement)

        return {
            "current_trajectory": current_traj,
            "optimized_trajectory": optimized_traj,
            "current_final_roi": round(current_final, 4),
            "optimized_final_roi": round(optimized_final, 4),
            "improvement_pct": round(improvement, 2),
            "decision_trace": trace,
        }

    # ------------------------------------------------------------------
    def _simulate_strategy(self, base_roi: float, cash_flow: float,
                            task_backlog: float, boost: float) -> List[Dict]:
        trajectory = []
        roi = base_roi
        base_date = datetime.today()
        # Use realistic daily drift: stock market moves ~0.04% per day on average
        daily_drift = boost / self.horizon  # spread boost evenly
        for day in range(1, self.horizon + 1):
            noise = np.random.normal(0, 0.15)  # small realistic noise
            roi = roi + daily_drift + noise
            # Cap to realistic range
            roi = round(min(max(roi, -30), 80), 4)
            trajectory.append({
                "day": day,
                "date": (base_date + timedelta(days=day)).strftime("%Y-%m-%d"),
                "roi": roi,
            })
        return trajectory

    # ------------------------------------------------------------------
    def _compute_boost(self, recommendations: List[Dict]) -> float:
        """Estimate realistic ROI boost from RL recommendations (max ~5%)."""
        boost = 0.0
        for rec in recommendations:
            dept = rec.get("department", "")
            delta_pct = rec.get("recommended_pct", 0) - rec.get("current_pct", 0)
            if dept in ("Engineering", "Sales"):
                boost += delta_pct * 0.008
            elif dept == "Marketing":
                boost += delta_pct * 0.004
            else:
                boost -= abs(delta_pct) * 0.002
        return float(np.clip(boost, -3, 5))

    # ------------------------------------------------------------------
    def _build_trace(self, recommendations: List[Dict],
                     boost: float, improvement: float) -> List[str]:
        trace = [f"Simulation horizon: 30 days",
                 f"Expected ROI improvement: {improvement:.1f}%"]
        for rec in recommendations:
            if rec.get("action") != "maintain":
                amt = abs(rec.get("delta_amount", 0))
                direction = rec.get("action", "adjust")
                trace.append(
                    f"Day 1: {direction.capitalize()} {rec['department']} "
                    f"budget by ₹{amt:,.0f}"
                )
        trace.append(f"Projected compounding effect: +{boost:.1f}% ROI boost over 30 days")
        return trace
