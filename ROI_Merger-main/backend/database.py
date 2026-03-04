"""
Database connection and session management
"""
import pymysql
from typing import Optional, Dict, List, Any
import logging
from contextlib import contextmanager
from config import config

logger = logging.getLogger(__name__)

class DatabaseConnector:
    """Manages MySQL database connections"""
    
    def __init__(self):
        self.connection: Optional[pymysql.connections.Connection] = None
        self.last_error: Optional[str] = None
        
    def connect(self) -> bool:
        """Establish database connection"""
        try:
            self.connection = pymysql.connect(
                host=config.DB_HOST,
                port=config.DB_PORT,
                user=config.DB_USER,
                password=config.DB_PASSWORD,
                database=config.DB_NAME,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False
            )
            logger.info("Database connection established")
            return True
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                results = cursor.fetchall()
                return results
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute INSERT/UPDATE/DELETE query"""
        try:
            with self.connection.cursor() as cursor:
                affected_rows = cursor.execute(query, params or ())
                self.connection.commit()
                return affected_rows
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Update execution failed: {e}")
            raise
    
    def is_connected(self) -> bool:
        """Check if connection is active"""
        try:
            if self.connection:
                self.connection.ping(reconnect=True)
                return True
        except:
            pass
        return False

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    db = DatabaseConnector()
    try:
        if db.connect():
            yield db
        else:
            raise Exception(f"Database connection failed: {db.last_error}")
    finally:
        db.disconnect()
