"""
Vote.ai - Ambassador Voice Platform
Main FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from routers import auth, suggestions


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Smart voting and ranking system for ambassador suggestions with AI-powered duplicate detection",
    version="1.0.0",
    debug=settings.DEBUG
)


# CORS Configuration
# Allows frontend (React) to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(suggestions.router)


# Root endpoint
@app.get("/")
async def root():
    """
    Health check endpoint
    """
    return {
        "message": "Welcome to Ambassador Voice Platform API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "auth": "/auth",
            "suggestions": "/suggestions"
        }
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Simple health check for monitoring
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG  # Auto-reload on code changes in development
    )
