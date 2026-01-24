"""Hugging Face Space entry point for FastAPI backend."""
import uvicorn
from src.main import app

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=7860,  # Hugging Face Spaces default port
        log_level="info"
    )
