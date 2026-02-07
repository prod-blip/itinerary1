"""FastAPI entry point for the Travel Planner API."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from phoenix.otel import register
from app.config import settings
from app.api.routes import router
from openinference.instrumentation.langchain import LangChainInstrumentor
import os

load_dotenv()

def setup_tracing() -> None:
    """
    Set up optional tracing for observability.

    This is wrapped in try/except in case dependencies aren't available.
    """
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider

        # Set up basic tracer provider
        tracer_provider = register(
            endpoint=os.getenv("PHOENIX_COLLECTOR_ENDPOINT"),
            api_key=os.getenv("PHOENIX_API_KEY"),
            project_name="itinerary-creator",
            auto_instrument=True,
        )
        LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
        tracer = trace.get_tracer(__name__)

        print("OpenTelemetry tracing initialized")
    except ImportError:
        print("OpenTelemetry not available - tracing disabled")
    except Exception as e:
        print(f"Tracing setup failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    setup_tracing()
    print("Travel Planner API started")
    yield
    # Shutdown
    print("Travel Planner API shutting down")


# Create FastAPI application
app = FastAPI(
    title="Travel Planner API",
    description="Map-first, agentic itinerary generator API",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS middleware (allow all origins for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint for health check."""
    return {
        "status": "ok",
        "service": "travel-planner-api",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "travel-planner-api",
    }
