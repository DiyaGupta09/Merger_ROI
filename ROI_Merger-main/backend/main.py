"""
Main entry point for the backend application
"""
import uvicorn
from config import config

if __name__ == "__main__":
    uvicorn.run(
        "backend.api:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=True,
        log_level="info"
    )
