"""
Bottleneck detection using statistical analysis
"""
from typing import Dict, List, Any
import logging
from statistics import mean, stdev
from database import get_db_connection

logger = logging.getLogger(__name__)

class BottleneckDetector:
    """Detects workflow bottlenecks using statistical methods"""
    
    def __init__(self, db):
        self.db = db
    
    def detect_sales_bottlenecks(self) -> List[Dict[str, Any]]:
        """Detect bottlenecks in sales performance"""
        query = """
            SELECT 
                firm_id,
                DATE_FORMAT(sale_date, '%%Y-%%m') as period,
                COUNT(*) as transaction_count,
                SUM(total_amount) as revenue
            FROM sales
            WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY firm_id, DATE_FORMAT(sale_date, '%%Y-%%m')
            ORDER BY firm_id, period
        """
        results = self.db.execute_query(query)
        
        # Group by firm
        firm_data = {}
        for row in results:
            firm_id = row['firm_id']
            if firm_id not in firm_data:
                firm_data[firm_id] = []
            firm_data[firm_id].append({
                'period': row['period'],
                'transaction_count': int(row['transaction_count']),
                'revenue': float(row['revenue'])
            })
        
        bottlenecks = []
        for firm_id, periods in firm_data.items():
            try:
                if len(periods) < 3:
                    continue
                
                revenues = [p['revenue'] for p in periods if p['revenue'] is not None]
                if len(revenues) < 3:
                    continue
                    
                avg_revenue = mean(revenues)
                
                # Check for declining trend
                recent_3 = revenues[-3:]
                if len(recent_3) == 3 and recent_3[0] > 0 and all(recent_3[i] > recent_3[i+1] for i in range(2)):
                    decline_pct = ((recent_3[0] - recent_3[-1]) / recent_3[0]) * 100
                    bottlenecks.append({
                        'firm_id': firm_id,
                        'firm_name': f"Firm {firm_id}",
                        'type': 'sales_decline',
                        'severity': 'high' if decline_pct > 20 else 'medium',
                        'description': f'Sales declining for 3 consecutive months ({decline_pct:.1f}% drop)',
                        'impact': decline_pct,
                        'recommendation': 'Review sales strategy and market conditions'
                    })
            except Exception as e:
                logger.error(f"Error skipping firm {firm_id} in bottleneck detection: {e}")
                continue
        
        return bottlenecks
