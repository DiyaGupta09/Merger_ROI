"""
Data loading and validation module
"""
from typing import Dict, List, Any, Tuple
import logging
from datetime import datetime
from database import get_db_connection

logger = logging.getLogger(__name__)

class DataValidator:
    """Validates data integrity and completeness"""
    
    @staticmethod
    def validate_schema(db) -> Tuple[bool, List[str]]:
        """Validate database schema"""
        errors = []
        required_tables = ['firm', 'staff', 'sales']
        
        try:
            result = db.execute_query("SHOW TABLES")
            existing_tables = [list(row.values())[0] for row in result]
            
            for table in required_tables:
                if table not in existing_tables:
                    errors.append(f"Missing required table: {table}")
            
            return len(errors) == 0, errors
        except Exception as e:
            errors.append(f"Schema validation error: {str(e)}")
            return False, errors
    
    @staticmethod
    def check_referential_integrity(db) -> Tuple[bool, List[str]]:
        """Check foreign key relationships"""
        errors = []
        
        try:
            # Check staff.firm_id references firm.firm_id
            query = """
                SELECT COUNT(*) as count 
                FROM staff s 
                LEFT JOIN firm f ON s.firm_id = f.firm_id 
                WHERE f.firm_id IS NULL
            """
            result = db.execute_query(query)
            if result[0]['count'] > 0:
                errors.append(f"Found {result[0]['count']} staff records with invalid firm_id")
            
            # Check sales.firm_id references firm.firm_id
            query = """
                SELECT COUNT(*) as count 
                FROM sales s 
                LEFT JOIN firm f ON s.firm_id = f.firm_id 
                WHERE f.firm_id IS NULL
            """
            result = db.execute_query(query)
            if result[0]['count'] > 0:
                errors.append(f"Found {result[0]['count']} sales records with invalid firm_id")
            
            return len(errors) == 0, errors
        except Exception as e:
            errors.append(f"Referential integrity check error: {str(e)}")
            return False, errors
    
    @staticmethod
    def identify_missing_data(db) -> Tuple[bool, List[str]]:
        """Identify missing or null data in critical fields"""
        errors = []
        
        try:
            # Check for null values in firm table
            query = "SELECT COUNT(*) as count FROM firm WHERE firm_id IS NULL OR firm_name IS NULL"
            result = db.execute_query(query)
            if result[0]['count'] > 0:
                errors.append(f"Found {result[0]['count']} firm records with null critical fields")
            
            # Check for null values in staff table
            query = "SELECT COUNT(*) as count FROM staff WHERE staff_id IS NULL OR firm_id IS NULL"
            result = db.execute_query(query)
            if result[0]['count'] > 0:
                errors.append(f"Found {result[0]['count']} staff records with null critical fields")
            
            # Check for null values in sales table
            query = "SELECT COUNT(*) as count FROM sales WHERE sale_id IS NULL OR firm_id IS NULL"
            result = db.execute_query(query)
            if result[0]['count'] > 0:
                errors.append(f"Found {result[0]['count']} sales records with null critical fields")
            
            return len(errors) == 0, errors
        except Exception as e:
            errors.append(f"Missing data check error: {str(e)}")
            return False, errors

class DataLoader:
    """Loads data from database"""
    
    def __init__(self, db):
        self.db = db
    
    def load_firms(self, limit: int = None) -> List[Dict[str, Any]]:
        """Load firm data"""
        try:
            query = "SELECT * FROM firm"
            if limit:
                query += f" LIMIT {limit}"
            
            firms = self.db.execute_query(query)
            logger.info(f"Loaded {len(firms)} firms")
            return firms
        except Exception as e:
            logger.error(f"Failed to load firms: {e}")
            raise
    
    def load_staff(self, firm_id: int = None, limit: int = None) -> List[Dict[str, Any]]:
        """Load staff data"""
        try:
            query = "SELECT * FROM staff"
            params = None
            
            if firm_id:
                query += " WHERE firm_id = %s"
                params = (firm_id,)
            
            if limit:
                query += f" LIMIT {limit}"
            
            staff = self.db.execute_query(query, params)
            logger.info(f"Loaded {len(staff)} staff records")
            return staff
        except Exception as e:
            logger.error(f"Failed to load staff: {e}")
            raise
    
    def load_sales(self, firm_id: int = None, start_date: str = None, 
                   end_date: str = None, limit: int = None) -> List[Dict[str, Any]]:
        """Load sales data"""
        try:
            query = "SELECT * FROM sales WHERE 1=1"
            params = []
            
            if firm_id:
                query += " AND firm_id = %s"
                params.append(firm_id)
            
            if start_date:
                query += " AND sale_date >= %s"
                params.append(start_date)
            
            if end_date:
                query += " AND sale_date <= %s"
                params.append(end_date)
            
            if limit:
                query += f" LIMIT {limit}"
            
            sales = self.db.execute_query(query, tuple(params) if params else None)
            logger.info(f"Loaded {len(sales)} sales records")
            return sales
        except Exception as e:
            logger.error(f"Failed to load sales: {e}")
            raise
    
    def load_all(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load all data"""
        start_time = datetime.now()
        
        data = {
            'firms': self.load_firms(),
            'staff': self.load_staff(),
            'sales': self.load_sales()
        }
        
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"Loaded all data in {elapsed:.2f} seconds")
        
        return data
