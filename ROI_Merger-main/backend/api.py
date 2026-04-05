"""
FastAPI application - AI-Powered Financial Decision Intelligence Platform
"""
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import logging
import numpy as np

from config import config
from database import get_db_connection
from data_loader import DataLoader, DataValidator
from roi_calculator import ROICalculator
from capital_analyzer import CapitalAnalyzer
from bottleneck_detector import BottleneckDetector
from resource_optimizer import ResourceOptimizer
from merger_analyzer import MergerAnalyzer

# AI Agents
from data_agent import DataAgent
from forecasting_agent import ForecastingAgent
from explanation_agent import ExplanationAgent
from rl_agent import RLAgent
from simulation_agent import SimulationAgent
from ai_merger_agent import AIMergerAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Financial Decision Intelligence API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton agent instances (stateful models persist across requests)
_data_agent = DataAgent()
_forecasting_agent = ForecastingAgent(horizon=30, lags=3)
_explanation_agent = ExplanationAgent()
_rl_agent = RLAgent()
_simulation_agent = SimulationAgent(horizon=30)
_ai_merger_agent = AIMergerAgent()


# ---------------------------------------------------------------------------
# Health & Root
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "AI Financial Decision Intelligence API", "version": "2.0.0"}


@app.get("/api/health")
def health_check():
    try:
        with get_db_connection() as db:
            db.execute_query("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "degraded", "database": "disconnected", "error": str(e)}


# ---------------------------------------------------------------------------
# Existing endpoints (preserved)
# ---------------------------------------------------------------------------
@app.get("/api/firms")
def get_firms(limit: Optional[int] = Query(None, le=100)):
    try:
        with get_db_connection() as db:
            loader = DataLoader(db)
            firms = loader.load_firms(limit=limit)
        return {"firms": firms, "count": len(firms)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/roi")
def get_roi(firm_id: Optional[int] = None):
    try:
        with get_db_connection() as db:
            calculator = ROICalculator(db)
            if firm_id:
                roi = calculator.calculate_roi(firm_id)
                # Add firm name
                rows = db.execute_query("SELECT firm_name FROM firm WHERE firm_id = %s", (firm_id,))
                roi["firm_name"] = rows[0]["firm_name"] if rows else f"Firm {firm_id}"
                return roi
            roi_list = calculator.calculate_all_firms_roi()
            # Enrich with firm names
            firm_rows = db.execute_query("SELECT firm_id, firm_name FROM firm")
            firm_map = {r["firm_id"]: r["firm_name"] for r in firm_rows}
            for r in roi_list:
                r["firm_name"] = firm_map.get(r["firm_id"], f"Firm {r['firm_id']}")
            return {"roi_metrics": roi_list, "count": len(roi_list)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/capital/productivity")
def get_capital_productivity(firm_id: Optional[int] = None):
    try:
        with get_db_connection() as db:
            analyzer = CapitalAnalyzer(db)
            if firm_id:
                return analyzer.calculate_capital_productivity(firm_id)
            return {
                "aggregate": analyzer.calculate_aggregate_metrics(),
                "outliers": analyzer.identify_productivity_outliers(),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/bottlenecks")
def get_bottlenecks():
    try:
        with get_db_connection() as db:
            detector = BottleneckDetector(db)
            bottlenecks = detector.detect_sales_bottlenecks()
        return {"bottlenecks": bottlenecks, "count": len(bottlenecks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/resources/recommendations")
def get_resource_recommendations():
    try:
        with get_db_connection() as db:
            optimizer = ResourceOptimizer(db)
            recommendations = optimizer.recommend_staff_reallocation()
        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/merger/analyze")
def analyze_merger(firm_a_id: int, firm_b_id: int):
    """AI-powered merger analysis using XGBoost + SHAP + forecasting."""
    try:
        with get_db_connection() as db:
            result = _ai_merger_agent.analyze(db, firm_a_id, firm_b_id)
        return result
    except Exception as e:
        logger.error(f"/api/merger/analyze error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    try:
        with get_db_connection() as db:
            total_revenue = db.execute_query(
                "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales"
            )[0]["total"]
            total_firms = db.execute_query(
                "SELECT COUNT(*) as count FROM firm"
            )[0]["count"]
            total_staff = db.execute_query(
                "SELECT COUNT(*) as count FROM staff"
            )[0]["count"]
            calculator = ROICalculator(db)
            avg_roi = calculator.calculate_average_roi()
        return {
            "total_revenue": float(total_revenue),
            "total_firms": int(total_firms),
            "total_staff": int(total_staff),
            "average_roi": avg_roi,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# AI Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/forecast")
def forecast_roi(firm_id: Optional[int] = Query(1)):
    """Returns 30-day ROI forecast with confidence intervals."""
    try:
        with get_db_connection() as db:
            state = _data_agent.get_firm_state(db, firm_id)
        roi_series = state.get("roi_series", [])
        result = _forecasting_agent.forecast(roi_series)
        return {
            "firm_id": firm_id,
            "horizon_days": 30,
            **result,
        }
    except Exception as e:
        logger.error(f"/api/forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/explain")
def explain_roi(firm_id: Optional[int] = Query(1)):
    """Returns SHAP-based feature importance and narrative explanation."""
    try:
        with get_db_connection() as db:
            # Build feature matrix from all firms for training
            roi_rows = db.execute_query("""
                SELECT f.total_capital, COALESCE(SUM(s.total_amount),0) as revenue,
                       COALESCE(SUM(st.salary),0) as salary_cost,
                       COUNT(DISTINCT st.staff_id) as staff_count,
                       COALESCE(AVG(st.performance_score),0) as avg_perf,
                       COUNT(s.sale_id) as task_count
                FROM firm f
                LEFT JOIN sales s ON s.firm_id = f.firm_id
                LEFT JOIN staff st ON st.firm_id = f.firm_id
                GROUP BY f.firm_id, f.total_capital
            """)

        if not roi_rows:
            raise HTTPException(status_code=404, detail="No data available")

        X_list, y_list = [], []
        for row in roi_rows:
            rev = float(row.get("revenue", 0))
            cost = float(row.get("salary_cost", 1))
            cap = float(row.get("total_capital", 1))
            staff = float(row.get("staff_count", 1))
            perf = float(row.get("avg_perf", 0))
            tasks = float(row.get("task_count", 0))
            roi = (rev - cost) / max(cost, 1) * 100
            rev_per_emp = rev / max(staff, 1)
            budget = cost * 1.2
            cash = rev - cost
            X_list.append([rev, cost, staff, perf, cap, rev_per_emp, tasks, budget, cash])
            y_list.append(roi)

        X = np.array(X_list, dtype=np.float32)
        y = np.array(y_list, dtype=np.float32)
        _explanation_agent.fit(X, y)

        # Explain the target firm
        target_idx = min(firm_id - 1, len(X_list) - 1)
        result = _explanation_agent.explain(X[target_idx])
        return {"firm_id": firm_id, **result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"/api/explain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/optimize")
def optimize_capital(firm_id: Optional[int] = Query(1), train: bool = False):
    """Returns RL-based capital allocation recommendation."""
    try:
        with get_db_connection() as db:
            state = _data_agent.get_firm_state(db, firm_id)

        if train or not _rl_agent._trained:
            _rl_agent.train(state, timesteps=3000)

        result = _rl_agent.recommend(state)
        return {"firm_id": firm_id, **result}
    except Exception as e:
        logger.error(f"/api/optimize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/simulate")
def simulate(firm_id: Optional[int] = Query(1)):
    """Runs 30-day simulation: current strategy vs RL-optimized strategy."""
    try:
        with get_db_connection() as db:
            state = _data_agent.get_firm_state(db, firm_id)

        if not _rl_agent._trained:
            _rl_agent.train(state, timesteps=3000)

        rl_result = _rl_agent.recommend(state)
        sim_result = _simulation_agent.simulate(state, rl_result["recommendations"])
        return {
            "firm_id": firm_id,
            "rl_recommendations": rl_result,
            **sim_result,
        }
    except Exception as e:
        logger.error(f"/api/simulate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/market")
def get_market_data(symbol: str = "SPY"):
    """Fetch live market data from Alpha Vantage."""
    try:
        data = _data_agent.get_market_data(symbol)
        sectors = _data_agent.get_sector_performance()
        return {"market": data, "sectors": sectors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/timeseries")
def get_timeseries(firm_id: Optional[int] = Query(1)):
    """Returns historical ROI time-series for a firm — computed from real sales data."""
    try:
        with get_db_connection() as db:
            # Compute monthly ROI directly from sales + staff costs
            rows = db.execute_query("""
                SELECT
                    DATE_FORMAT(s.sale_date, '%%Y-%%m-01') as timestamp,
                    SUM(s.total_amount) as revenue,
                    COUNT(s.sale_id) as task_count
                FROM sales s
                WHERE s.firm_id = %s
                GROUP BY DATE_FORMAT(s.sale_date, '%%Y-%%m-01')
                ORDER BY timestamp ASC
            """, (firm_id,))

            monthly_cost_row = db.execute_query(
                "SELECT COALESCE(SUM(salary),0) as annual_cost FROM staff WHERE firm_id = %s",
                (firm_id,)
            )
            annual_cost = float(monthly_cost_row[0]["annual_cost"]) if monthly_cost_row else 0
            monthly_cost = annual_cost / 12

            firm_row = db.execute_query(
                "SELECT total_capital FROM firm WHERE firm_id = %s", (firm_id,)
            )
            equity = float(firm_row[0]["total_capital"]) if firm_row else 500000
            # Monthly investment = monthly salary + capital/12
            monthly_investment = monthly_cost + (equity / 12)

            result = []
            for r in rows:
                rev = float(r["revenue"])
                roi = ((rev - monthly_cost) / monthly_investment * 100) if monthly_investment > 0 else 0
                result.append({
                    "firm_id": firm_id,
                    "timestamp": str(r["timestamp"])[:10],
                    "roi": round(roi, 2),
                    "equity": equity,
                    "task_count": int(r["task_count"]),
                    "budget_allocated": round(monthly_cost * 1.2, 2),
                    "cash_flow": round(rev - monthly_cost, 2),
                })

            # Fall back to stored timeseries if no sales data
            if not result:
                result = _data_agent.get_roi_timeseries(db, firm_id)

        return {"firm_id": firm_id, "data": result, "count": len(result)}
    except Exception as e:
        logger.error(f"/api/timeseries error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
