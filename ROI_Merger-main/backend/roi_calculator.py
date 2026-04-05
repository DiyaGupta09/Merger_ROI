"""
ROI calculation and analysis engine
"""
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
from database import get_db_connection

logger = logging.getLogger(__name__)

class ROICalculator:
    """Calculates ROI metrics for firms"""
    
    def __init__(self, db):
        self.db = db
    
    def calculate_total_revenue(self, firm_id: int, start_date: str = None, 
                                end_date: str = None) -> float:
        """Calculate total revenue for a firm"""
        query = """
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue
            FROM sales
            WHERE firm_id = %s
        """
        params = [firm_id]
        
        if start_date:
            query += " AND sale_date >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND sale_date <= %s"
            params.append(end_date)
        
        result = self.db.execute_query(query, tuple(params))
        return float(result[0]['total_revenue'])
    
    def calculate_total_costs(self, firm_id: int) -> float:
        """Calculate total salary costs for a firm (annual)"""
        query = """
            SELECT COALESCE(SUM(salary), 0) as total_salary
            FROM staff
            WHERE firm_id = %s
        """
        result = self.db.execute_query(query, (firm_id,))
        return float(result[0]['total_salary'])
    
    def calculate_roi(self, firm_id: int, start_date: str = None, 
                     end_date: str = None) -> Dict[str, Any]:
        """Calculate ROI for a firm using total investment (salary + capital) as cost base"""
        revenue = self.calculate_total_revenue(firm_id, start_date, end_date)
        salary_costs = self.calculate_total_costs(firm_id)

        # Include firm capital as part of total investment for realistic ROI
        capital_query = "SELECT COALESCE(total_capital, 0) as capital FROM firm WHERE firm_id = %s"
        capital_result = self.db.execute_query(capital_query, (firm_id,))
        total_capital = float(capital_result[0]['capital']) if capital_result else 0

        # Total investment = annual salaries + capital deployed
        total_investment = salary_costs + total_capital

        if total_investment == 0:
            roi_percentage = 0.0
        else:
            roi_percentage = ((revenue - salary_costs) / total_investment) * 100

        # Round to 2 decimal places
        roi_percentage = round(roi_percentage, 2)

        return {
            'firm_id': firm_id,
            'revenue': revenue,
            'costs': salary_costs,
            'total_investment': total_investment,
            'net_profit': revenue - salary_costs,
            'roi_percentage': roi_percentage,
            'is_negative': roi_percentage < 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def calculate_all_firms_roi(self, start_date: str = None, 
                                end_date: str = None) -> List[Dict[str, Any]]:
        """Calculate ROI for all firms"""
        query = "SELECT firm_id FROM firm"
        firms = self.db.execute_query(query)
        
        roi_results = []
        for firm in firms:
            roi = self.calculate_roi(firm['firm_id'], start_date, end_date)
            roi_results.append(roi)
        
        # Sort by ROI percentage descending
        roi_results.sort(key=lambda x: x['roi_percentage'], reverse=True)
        
        logger.info(f"Calculated ROI for {len(roi_results)} firms")
        return roi_results
    
    def calculate_roi_trends(self, firm_id: int, periods: int = 12) -> List[Dict[str, Any]]:
        """Calculate ROI trends over time (monthly)"""
        query = """
            SELECT 
                DATE_FORMAT(sale_date, '%%Y-%%m') as period,
                SUM(total_amount) as revenue
            FROM sales
            WHERE firm_id = %s
            GROUP BY DATE_FORMAT(sale_date, '%%Y-%%m')
            ORDER BY period DESC
            LIMIT %s
        """
        
        results = self.db.execute_query(query, (firm_id, periods))
        costs = self.calculate_total_costs(firm_id)
        monthly_cost = costs / 12  # Approximate monthly cost
        
        trends = []
        for row in results:
            revenue = float(row['revenue'])
            roi = ((revenue - monthly_cost) / monthly_cost * 100) if monthly_cost > 0 else 0
            trends.append({
                'period': row['period'],
                'revenue': revenue,
                'roi_percentage': roi
            })
        
        trends.reverse()  # Chronological order
        return trends
    
    def get_negative_roi_firms(self) -> List[Dict[str, Any]]:
        """Get firms with negative ROI"""
        all_roi = self.calculate_all_firms_roi()
        negative_firms = [roi for roi in all_roi if roi['is_negative']]
        
        logger.info(f"Found {len(negative_firms)} firms with negative ROI")
        return negative_firms
    
    def calculate_average_roi(self) -> float:
        """Calculate average ROI across all firms"""
        all_roi = self.calculate_all_firms_roi()
        
        if not all_roi:
            return 0.0
        
        total_roi = sum(roi['roi_percentage'] for roi in all_roi if roi['roi_percentage'] != float('inf'))
        valid_count = sum(1 for roi in all_roi if roi['roi_percentage'] != float('inf'))
        
        return total_roi / valid_count if valid_count > 0 else 0.0
