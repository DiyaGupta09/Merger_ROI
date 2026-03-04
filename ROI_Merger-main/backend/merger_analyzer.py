"""
Merger equity analysis and recommendations
"""
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class MergerAnalyzer:
    """Analyzes merger opportunities and equity distribution"""
    
    def __init__(self, db):
        self.db = db
    
    def analyze_merger(self, firm_a_id: int, firm_b_id: int) -> Dict[str, Any]:
        """Analyze merger opportunity between two firms"""
        # Get firm A metrics
        firm_a = self._get_firm_metrics(firm_a_id)
        firm_b = self._get_firm_metrics(firm_b_id)
        
        # Calculate combined metrics
        combined_revenue = firm_a['revenue'] + firm_b['revenue']
        combined_costs = firm_a['costs'] + firm_b['costs']
        
        # Estimate synergies (10% cost reduction from economies of scale)
        estimated_synergies = combined_costs * 0.10
        
        # Calculate ROI
        net_benefit = combined_revenue - (combined_costs - estimated_synergies)
        merger_cost = combined_costs * 0.05  # Assume 5% of costs for merger
        roi = ((net_benefit - merger_cost) / merger_cost) * 100 if merger_cost > 0 else 0
        
        # Equity distribution based on revenue contribution
        total_revenue = firm_a['revenue'] + firm_b['revenue']
        equity_a = (firm_a['revenue'] / total_revenue * 100) if total_revenue > 0 else 50
        equity_b = 100 - equity_a
        
        return {
            'firm_a': firm_a,
            'firm_b': firm_b,
            'combined_revenue': combined_revenue,
            'combined_costs': combined_costs,
            'estimated_synergies': estimated_synergies,
            'net_benefit': net_benefit,
            'merger_cost': merger_cost,
            'roi_percentage': roi,
            'equity_distribution': {
                'firm_a_percentage': equity_a,
                'firm_b_percentage': equity_b
            },
            'recommendation': 'Proceed' if roi > 20 else 'Review' if roi > 0 else 'Decline'
        }
    
    def _get_firm_metrics(self, firm_id: int) -> Dict[str, Any]:
        """Get key metrics for a firm"""
        revenue_query = "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM sales WHERE firm_id = %s"
        revenue = self.db.execute_query(revenue_query, (firm_id,))[0]['revenue']
        
        costs_query = "SELECT COALESCE(SUM(salary), 0) as costs FROM staff WHERE firm_id = %s"
        costs = self.db.execute_query(costs_query, (firm_id,))[0]['costs']
        
        firm_query = "SELECT firm_name FROM firm WHERE firm_id = %s"
        firm_name = self.db.execute_query(firm_query, (firm_id,))[0]['firm_name']
        
        return {
            'firm_id': firm_id,
            'firm_name': firm_name,
            'revenue': float(revenue),
            'costs': float(costs)
        }
