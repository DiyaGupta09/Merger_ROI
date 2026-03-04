"""
Capital measurement and productivity analysis
"""
from typing import Dict, List, Any
import logging
from database import get_db_connection

logger = logging.getLogger(__name__)

class CapitalAnalyzer:
    """Measures capital and productivity metrics"""
    
    def __init__(self, db):
        self.db = db
    
    def calculate_human_capital(self, firm_id: int) -> Dict[str, Any]:
        """Calculate human capital metrics for a firm"""
        query = """
            SELECT 
                COUNT(*) as staff_count,
                COALESCE(SUM(salary), 0) as total_salary,
                COALESCE(AVG(salary), 0) as avg_salary
            FROM staff
            WHERE firm_id = %s
        """
        result = self.db.execute_query(query, (firm_id,))
        
        return {
            'firm_id': firm_id,
            'staff_count': int(result[0]['staff_count']),
            'total_salary': float(result[0]['total_salary']),
            'avg_salary': float(result[0]['avg_salary'])
        }
    
    def calculate_capital_productivity(self, firm_id: int) -> Dict[str, Any]:
        """Calculate capital productivity metrics"""
        # Get revenue
        revenue_query = """
            SELECT COALESCE(SUM(total_amount), 0) as total_revenue
            FROM sales
            WHERE firm_id = %s
        """
        revenue_result = self.db.execute_query(revenue_query, (firm_id,))
        total_revenue = float(revenue_result[0]['total_revenue'])
        
        # Get human capital
        human_capital = self.calculate_human_capital(firm_id)
        staff_count = human_capital['staff_count']
        total_salary = human_capital['total_salary']
        
        # Calculate productivity metrics
        revenue_per_employee = total_revenue / staff_count if staff_count > 0 else 0
        capital_productivity = total_revenue / total_salary if total_salary > 0 else 0
        
        return {
            'firm_id': firm_id,
            'total_revenue': total_revenue,
            'staff_count': staff_count,
            'total_salary': total_salary,
            'revenue_per_employee': revenue_per_employee,
            'capital_productivity': capital_productivity
        }
    
    def calculate_aggregate_metrics(self) -> Dict[str, Any]:
        """Calculate aggregate capital metrics across all firms"""
        query = """
            SELECT 
                COUNT(DISTINCT f.firm_id) as firm_count,
                COUNT(s.staff_id) as total_staff,
                COALESCE(SUM(s.salary), 0) as total_salary,
                COALESCE(SUM(sales.revenue), 0) as total_revenue
            FROM firm f
            LEFT JOIN staff s ON f.firm_id = s.firm_id
            LEFT JOIN (
                SELECT firm_id, SUM(total_amount) as revenue
                FROM sales
                GROUP BY firm_id
            ) sales ON f.firm_id = sales.firm_id
        """
        result = self.db.execute_query(query)
        
        firm_count = int(result[0]['firm_count'])
        total_staff = int(result[0]['total_staff'])
        total_salary = float(result[0]['total_salary'])
        total_revenue = float(result[0]['total_revenue'])
        
        avg_revenue_per_employee = total_revenue / total_staff if total_staff > 0 else 0
        avg_capital_productivity = total_revenue / total_salary if total_salary > 0 else 0
        
        return {
            'firm_count': firm_count,
            'total_staff': total_staff,
            'total_salary': total_salary,
            'total_revenue': total_revenue,
            'avg_revenue_per_employee': avg_revenue_per_employee,
            'avg_capital_productivity': avg_capital_productivity
        }
    
    def identify_productivity_outliers(self) -> Dict[str, List[Dict[str, Any]]]:
        """Identify firms with above/below average productivity"""
        # Get all firms
        firms_query = "SELECT firm_id FROM firm"
        firms = self.db.execute_query(firms_query)
        
        # Calculate productivity for each firm
        productivity_data = []
        for firm in firms:
            metrics = self.calculate_capital_productivity(firm['firm_id'])
            productivity_data.append(metrics)
        
        # Calculate average
        avg_metrics = self.calculate_aggregate_metrics()
        avg_productivity = avg_metrics['avg_capital_productivity']
        
        # Identify outliers
        above_average = [
            p for p in productivity_data 
            if p['capital_productivity'] > avg_productivity * 1.1
        ]
        below_average = [
            p for p in productivity_data 
            if p['capital_productivity'] < avg_productivity * 0.9
        ]
        
        # Sort by productivity
        above_average.sort(key=lambda x: x['capital_productivity'], reverse=True)
        below_average.sort(key=lambda x: x['capital_productivity'])
        
        logger.info(f"Found {len(above_average)} above-average and {len(below_average)} below-average firms")
        
        return {
            'average_productivity': avg_productivity,
            'above_average': above_average,
            'below_average': below_average
        }
    
    def calculate_staff_efficiency(self, firm_id: int) -> Dict[str, Any]:
        """Calculate staff efficiency metrics"""
        productivity = self.calculate_capital_productivity(firm_id)
        
        # Get sales volume
        sales_query = """
            SELECT 
                COUNT(*) as transaction_count,
                COALESCE(SUM(quantity), 0) as total_quantity
            FROM sales
            WHERE firm_id = %s
        """
        sales_result = self.db.execute_query(sales_query, (firm_id,))
        
        transaction_count = int(sales_result[0]['transaction_count'])
        total_quantity = int(sales_result[0]['total_quantity'])
        staff_count = productivity['staff_count']
        
        transactions_per_employee = transaction_count / staff_count if staff_count > 0 else 0
        units_per_employee = total_quantity / staff_count if staff_count > 0 else 0
        
        return {
            'firm_id': firm_id,
            'staff_count': staff_count,
            'transaction_count': transaction_count,
            'total_quantity': total_quantity,
            'revenue_per_employee': productivity['revenue_per_employee'],
            'transactions_per_employee': transactions_per_employee,
            'units_per_employee': units_per_employee
        }
