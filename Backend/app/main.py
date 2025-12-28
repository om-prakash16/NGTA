"""
This module defines the main FastAPI application for the NSE Stock Analyzer API.

It includes:
- Application setup with CORS middleware.
- Lifespan management for background tasks (e.g., market data refresh).
- Inclusion of various API routes (authentication, admin, blogs, stocks, watchlist).
- A root endpoint for health checks.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.config import settings
from app.routes import stocks, watchlist, advanced
from app.services.stocks import refresh_market_data
import asyncio
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app_state = {}

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # HSTS only for production (if not local)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan (startup and shutdown events).

    On startup, it initializes a background task to refresh market data.
    """
    # Startup: Initialize background data fetch
    try:
        asyncio.create_task(refresh_market_data())
        print("Background task started: Market Data Refresh", flush=True)
    except Exception as e:
        print(f"Failed to start background task: {e}", flush=True)
    
    yield
    # Shutdown logic can be added here if needed

    # Shutdown logic can be added here if needed

app = FastAPI(
    title="NSE Stock Analyzer",
    description="API for analyzing NSE F&O stocks with real-time data and tracking.",
    version="1.0.0",
    lifespan=lifespan,
    redoc_url=None,
    docs_url=None, # Docs disabled for performance/security
)

# Integrations
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
# NOTE: Allow all origins is enabled for development convenience.
# For production, replace ["*"] with specific domain list.
import os

# origins_str = os.getenv("ALLOWED_ORIGINS", "*")
# origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityHeadersMiddleware)
# TrustedHostMiddleware for Host Header Injection Protection
if not settings.DEBUG:
    from fastapi.middleware.trustedhost import TrustedHostMiddleware
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# TrustedHostMiddleware REMOVED to fix "Invalid Host Header" on Render
# app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Register Routes
app.include_router(stocks.router, prefix="/api/v1", tags=["Stocks"])
app.include_router(watchlist.router, prefix="/api/v1", tags=["Watchlist"])
app.include_router(advanced.router, prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {"message": "NSE Stock Analyzer API is running", "status": "active"}
