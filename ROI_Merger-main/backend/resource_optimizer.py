"""
Resource allocation optimization
"""
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class ResourceOptimizer:
    """Optimizes resource allocation based on historical data"""
    
    def __init__(self, db):
        self.db = db
    
    def analyze_staff_distribution(self) -> List[Dict[str, Any]]:
        """Analyze current staff distribution across firms"""
        query = """
            SELECT 
                f.firm_id,
                f.firm_name,
                COUNT(s.staff_id) as staff_count,
                COALESCE(SUM(sales.revenue), 0) as total_revenue,
                COALESCE(SUM(sales.revenue) / COUNT(s.staff_id), 0) as revenue_per_employee
            FROM firm f
            LEFT JOIN staff s ON f.firm_id = s.firm_id
            LEFT JOIN (
                SELECT firm_id, SUM(total_amount) as revenue
                FROM sales
                GROUP BY firm_id
            ) sales ON f.firm_id = sales.firm_id
            GROUP BY f.firm_id, f.firm_name
        """
        results = self.db.execute_query(query)
        
        return [{
            'firm_id': row['firm_id'],
            'firm_name': row['firm_name'],
            'staff_count': int(row['staff_count']),
            'total_revenue': float(row['total_revenue']),
            'revenue_per_employee': float(row['revenue_per_employee'])
        } for row in results]
    
    def recommend_staff_reallocation(self) -> List[Dict[str, Any]]:
        """Recommend staff reallocation based on performance"""
        distribution = self.analyze_staff_distribution()
        
        if not distribution:
            return []
        
        avg_rpe = sum(d['revenue_per_employee'] for d in distribution) / len(distribution)
        
        recommendations = []
        for firm in distribution:
            if firm['revenue_per_employee'] < avg_rpe * 0.7 and firm['staff_count'] > 2:
                recommendations.append({
                    'firm_id': firm['firm_id'],
                    'firm_name': firm['firm_name'],
                    'current_staff': firm['staff_count'],
                    'recommended_staff': int(firm['staff_count'] * 0.8),
                    'reason': 'Below-average revenue per employee',
                    'expected_impact': 'Cost reduction without significant revenue loss'
                })
        
        return recommendations
