"""
FastAPI application for Merger ROI Dashboard
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import logging

from config import config
from database import get_db_connection
from data_loader import DataLoader, DataValidator
from roi_calculator import ROICalculator
from capital_analyzer import CapitalAnalyzer
from bottleneck_detector import BottleneckDetector
from resource_optimizer import ResourceOptimizer
from merger_analyzer import MergerAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Merger ROI Dashboard API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Merger ROI Dashboard API", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    try:
        with get_db_connection() as db:
            db.execute_query("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/firms")
def get_firms(limit: Optional[int] = Query(None, le=100)):
    """Get all firms"""
    try:
        with get_db_connection() as db:
            loader = DataLoader(db)
            firms = loader.load_firms(limit=limit)
        return {"firms": firms, "count": len(firms)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roi")
def get_roi(firm_id: Optional[int] = None):
    """Get ROI metrics"""
    try:
        with get_db_connection() as db:
            calculator = ROICalculator(db)
            if firm_id:
                roi = calculator.calculate_roi(firm_id)
                return roi
            else:
                roi_list = calculator.calculate_all_firms_roi()
                return {"roi_metrics": roi_list, "count": len(roi_list)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/capital/productivity")
def get_capital_productivity(firm_id: Optional[int] = None):
    """Get capital productivity metrics"""
    try:
        with get_db_connection() as db:
            analyzer = CapitalAnalyzer(db)
            if firm_id:
                metrics = analyzer.calculate_capital_productivity(firm_id)
                return metrics
            else:
                aggregate = analyzer.calculate_aggregate_metrics()
                outliers = analyzer.identify_productivity_outliers()
                return {"aggregate": aggregate, "outliers": outliers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bottlenecks")
def get_bottlenecks():
    """Get identified bottlenecks"""
    try:
        with get_db_connection() as db:
            detector = BottleneckDetector(db)
            bottlenecks = detector.detect_sales_bottlenecks()
        return {"bottlenecks": bottlenecks, "count": len(bottlenecks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/recommendations")
def get_resource_recommendations():
    """Get resource allocation recommendations"""
    try:
        with get_db_connection() as db:
            optimizer = ResourceOptimizer(db)
            recommendations = optimizer.recommend_staff_reallocation()
        return {"recommendations": recommendations, "count": len(recommendations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/merger/analyze")
def analyze_merger(firm_a_id: int, firm_b_id: int):
    """Analyze merger opportunity"""
    try:
        with get_db_connection() as db:
            analyzer = MergerAnalyzer(db)
            analysis = analyzer.analyze_merger(firm_a_id, firm_b_id)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    """Get executive summary metrics"""
    try:
        with get_db_connection() as db:
            # Total revenue
            revenue_query = "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales"
            total_revenue = db.execute_query(revenue_query)[0]['total']
            
            # Total firms
            firms_query = "SELECT COUNT(*) as count FROM firm"
            total_firms = db.execute_query(firms_query)[0]['count']
            
            # Total staff
            staff_query = "SELECT COUNT(*) as count FROM staff"
            total_staff = db.execute_query(staff_query)[0]['count']
            
            # Average ROI
            calculator = ROICalculator(db)
            avg_roi = calculator.calculate_average_roi()
            
        return {
            "total_revenue": float(total_revenue),
            "total_firms": int(total_firms),
            "total_staff": int(total_staff),
            "average_roi": avg_roi
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
