"""
Data Agent - Fetches & cleans data from MySQL + external APIs.
External: Alpha Vantage (market trends, sector performance).
"""
import logging
import os
from typing import Dict, Any, List, Optional
import requests

logger = logging.getLogger(__name__)

ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "demo")
ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"


class DataAgent:
    """Orchestrates data fetching from DB and external APIs."""

    # ------------------------------------------------------------------
    def get_roi_timeseries(self, db, firm_id: Optional[int] = None) -> List[Dict]:
        """Fetch ROI time-series from DB."""
        try:
            query = """
                SELECT firm_id, timestamp, roi, equity, task_count,
                       budget_allocated, cash_flow
                FROM roi_timeseries
                {where}
                ORDER BY timestamp ASC
                LIMIT 120
            """.format(where="WHERE firm_id = %s" if firm_id else "")
            params = (firm_id,) if firm_id else ()
            rows = db.execute_query(query, params)
            return [dict(r) for r in rows]
        except Exception as e:
            logger.warning(f"roi_timeseries query failed: {e}")
            return self._synthetic_timeseries(firm_id or 1)

    # ------------------------------------------------------------------
    def get_firm_state(self, db, firm_id: int) -> Dict[str, Any]:
        """Build current state vector for a firm."""
        try:
            roi_rows = self.get_roi_timeseries(db, firm_id)
            latest = roi_rows[-1] if roi_rows else {}

            dept_query = """
                SELECT department,
                       SUM(allocated_budget) as allocated,
                       SUM(spent_budget) as spent
                FROM department_budgets
                WHERE firm_id = %s
                GROUP BY department
            """
            dept_rows = db.execute_query(dept_query, (firm_id,))
            total_budget = sum(float(r.get("allocated", 0)) for r in dept_rows) or 1_000_000

            dept_allocs = []
            for r in dept_rows:
                dept_allocs.append(float(r.get("allocated", 0)) / total_budget)

            return {
                "roi": float(latest.get("roi", 10.0)),
                "equity": float(latest.get("equity", 500_000)),
                "task_backlog": float(latest.get("task_count", 50)),
                "cash_flow": float(latest.get("cash_flow", 0)),
                "budget_allocated": float(latest.get("budget_allocated", total_budget)),
                "total_budget": total_budget,
                "dept_allocations": dept_allocs or [0.2] * 5,
                "roi_series": [float(r.get("roi", 0)) for r in roi_rows],
            }
        except Exception as e:
            logger.warning(f"get_firm_state failed: {e}")
            return self._default_state()

    # ------------------------------------------------------------------
    def get_market_data(self, symbol: str = "SPY") -> Dict[str, Any]:
        """Fetch market trend from Alpha Vantage."""
        try:
            resp = requests.get(ALPHA_VANTAGE_BASE, params={
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_KEY,
            }, timeout=5)
            data = resp.json().get("Global Quote", {})
            return {
                "symbol": symbol,
                "price": data.get("05. price", "N/A"),
                "change_pct": data.get("10. change percent", "N/A"),
                "volume": data.get("06. volume", "N/A"),
                "source": "Alpha Vantage",
            }
        except Exception as e:
            logger.warning(f"Alpha Vantage fetch failed: {e}")
            return {"symbol": symbol, "price": "N/A", "change_pct": "N/A",
                    "volume": "N/A", "source": "unavailable"}

    # ------------------------------------------------------------------
    def get_sector_performance(self) -> List[Dict]:
        """Fetch sector performance from Alpha Vantage."""
        try:
            resp = requests.get(ALPHA_VANTAGE_BASE, params={
                "function": "SECTOR",
                "apikey": ALPHA_VANTAGE_KEY,
            }, timeout=5)
            data = resp.json()
            rank = data.get("Rank A: Real-Time Performance", {})
            return [{"sector": k, "performance": v} for k, v in list(rank.items())[:8]]
        except Exception as e:
            logger.warning(f"Sector fetch failed: {e}")
            return []

    # ------------------------------------------------------------------
    def _synthetic_timeseries(self, firm_id: int) -> List[Dict]:
        """Generate synthetic ROI series when DB is empty."""
        from datetime import datetime, timedelta
        import numpy as np
        base = datetime(2024, 1, 1)
        roi = 8.0
        rows = []
        for i in range(12):
            roi += np.random.normal(0.5, 1.0)
            rows.append({
                "firm_id": firm_id,
                "timestamp": (base + timedelta(days=30 * i)).strftime("%Y-%m-%d"),
                "roi": round(roi, 4),
                "equity": 500_000,
                "task_count": 40 + i * 2,
                "budget_allocated": 120_000,
                "cash_flow": roi * 10_000,
            })
        return rows

    # ------------------------------------------------------------------
    def _default_state(self) -> Dict[str, Any]:
        return {
            "roi": 12.5, "equity": 500_000, "task_backlog": 45,
            "cash_flow": 125_000, "budget_allocated": 600_000,
            "total_budget": 1_000_000,
            "dept_allocations": [0.35, 0.15, 0.25, 0.15, 0.10],
            "roi_series": [8, 9, 10, 11, 12, 12.5],
        }
