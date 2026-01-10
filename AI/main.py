"""
Entry point for running the RAG API server.

Usage:
    # Development
    python main.py
    
    # Production with multiple workers
    uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
    
    # With GPU and multiple workers
    uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
"""

import uvicorn
from config import config

if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=False,  # Set to True for development
        log_level=config.LOG_LEVEL.lower()    
    )
