"""FastAPI Multi-Agent Financial Intelligence System Entry Point.

Exposes REST endpoints:
- GET  /market-data       : Live simulated market feed & historical OHLCV
- POST /run-analysis      : Parallel async execution of 3 Analyst Agents + Synthesis + Personalization
- GET  /user-profile      : Retrieve current retail investor profile
- POST /user-profile      : Update retail risk tolerance and constraints
- GET  /logs              : Signal accuracy, agent response latency, portfolio concentration metrics
- GET  /documents         : Explore SEBI statutory filings & earnings transcripts
- GET  /health            : Health check
"""
import asyncio
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .agents.base import (
    UserRiskProfile,
    AnalysisRequest,
    CompleteAnalysisResult,
    RiskTolerance,
    InvestmentHorizon
)
from .agents.technical_agent import run_technical_agent
from .agents.sentiment_agent import run_sentiment_agent
from .agents.fundamentals_rag_agent import run_fundamentals_agent
from .agents.synthesis_agent import run_synthesis_agent
from .agents.personalization_agent import run_personalization_agent
from .market_data.feed import market_feed_instance
from .vector_db.chroma_store import vector_db_instance
from .logging_module.performance_logger import performance_logger_instance

app = FastAPI(
    title="Multi-Agent Financial Intelligence System",
    description="24-Hour Hackathon MVP Architecture with Parallel Analyst Agents, Vector RAG, and Personalization",
    version="1.0.0"
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user profile repository (default profile initialized)
USER_PROFILES: Dict[str, UserRiskProfile] = {
    "user_retail_01": UserRiskProfile(
        user_id="user_retail_01",
        risk_tolerance=RiskTolerance.MODERATE,
        investment_horizon=InvestmentHorizon.MEDIUM_TERM,
        max_portfolio_allocation_pct=15.0,
        capital_preservation_priority=False,
        monthly_budget_inr=50000.0,
        preferred_sectors=["Technology", "Banking", "Energy", "Automobile"]
    )
}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "multi-agent-financial-intelligence",
        "timestamp": datetime.utcnow().isoformat(),
        "vector_store_active": True,
        "chromadb_mode": "ChromaDB-Vector" if vector_db_instance.has_chroma else "In-Memory-Vector-Cosine"
    }


@app.get("/market-data")
async def get_market_data(ticker: Optional[str] = Query(None, description="Optional stock ticker")):
    """Returns real-time simulated tick data and historical OHLCV."""
    if ticker:
        stock = market_feed_instance.get_stock_data(ticker)
        if not stock:
            raise HTTPException(status_code=404, detail=f"Stock ticker {ticker} not found in simulated market feed")
        return stock
    
    return {
        "market_status": "OPEN",
        "timestamp": datetime.utcnow().isoformat(),
        "stocks": market_feed_instance.get_market_overview()
    }


@app.post("/run-analysis")
async def run_analysis(request: AnalysisRequest):
    """Executes the full multi-agent pipeline:
    1. Runs Technical, Sentiment, and Fundamentals/RAG agents concurrently (asyncio.gather)
    2. Runs Synthesis Agent to resolve conflicts and calculate consensus
    3. Runs Personalization Layer to tailor recommendations to the retail investor profile
    4. Logs latency, accuracy, and portfolio concentration impact
    """
    total_start = time.perf_counter()
    ticker = request.ticker.upper().strip()
    
    # 1. Retrieve market snapshot
    stock_snapshot = market_feed_instance.get_stock_data(ticker)
    if not stock_snapshot:
        raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' is not supported in the market data universe.")

    # 2. Retrieve user risk profile
    profile = request.custom_profile
    if not profile:
        profile = USER_PROFILES.get(request.user_id or "user_retail_01", USER_PROFILES["user_retail_01"])

    # 3. Parallel Async Execution of the 3 Analyst Agents
    tech_task = asyncio.create_task(run_technical_agent(ticker, stock_snapshot))
    sent_task = asyncio.create_task(run_sentiment_agent(ticker, stock_snapshot))
    fund_task = asyncio.create_task(run_fundamentals_agent(ticker, stock_snapshot))

    # Concurrently gather all 3 agent outputs
    tech_res, sent_res, fund_res = await asyncio.gather(
        tech_task,
        sent_task,
        fund_task
    )

    # 4. Synthesis Agent (Merges signals, resolves conflicts, determines consensus)
    synthesis_res = await run_synthesis_agent(
        ticker=ticker,
        tech_out=tech_res,
        sent_out=sent_res,
        fund_out=fund_res
    )

    # 5. Personalization Layer (Applies retail user risk profile & sizing)
    personalization_res = await run_personalization_agent(
        ticker=ticker,
        synthesis_out=synthesis_res,
        profile=profile,
        market_snapshot=stock_snapshot
    )

    total_latency_ms = round((time.perf_counter() - total_start) * 1000, 2)

    # 6. Log Execution Performance
    performance_logger_instance.log_analysis_execution(
        ticker=ticker,
        tech_ms=tech_res.get("latency_ms", 0.0),
        sent_ms=sent_res.get("latency_ms", 0.0),
        fund_ms=fund_res.get("latency_ms", 0.0),
        synth_ms=synthesis_res.get("latency_ms", 0.0),
        pers_ms=personalization_res.get("latency_ms", 0.0),
        total_ms=total_latency_ms,
        synthesis_signal=synthesis_res.get("aggregate_signal", "NEUTRAL"),
        confidence=synthesis_res.get("aggregate_confidence", 0.7),
        current_price=stock_snapshot.get("current_price", 0.0)
    )

    return {
        "ticker": ticker,
        "company_name": stock_snapshot.get("name", ticker),
        "timestamp": datetime.utcnow().isoformat(),
        "execution_mode": "PARALLEL_ASYNC_3_AGENTS",
        "total_latency_ms": total_latency_ms,
        "current_market_price": stock_snapshot.get("current_price", 0.0),
        "change_pct": stock_snapshot.get("change_pct", 0.0),
        
        # Agent Results
        "technical_agent": tech_res,
        "sentiment_agent": sent_res,
        "fundamentals_agent": fund_res,
        "synthesis": synthesis_res,
        "personalization": personalization_res,
        
        # Profile Context
        "user_profile": profile.dict()
    }


@app.get("/user-profile")
async def get_user_profile(user_id: str = Query("user_retail_01")):
    """Retrieve stored user risk profile."""
    profile = USER_PROFILES.get(user_id)
    if not profile:
        profile = USER_PROFILES["user_retail_01"]
    return profile


@app.post("/user-profile")
async def update_user_profile(profile: UserRiskProfile):
    """Update stored user risk profile."""
    USER_PROFILES[profile.user_id] = profile
    return {
        "status": "success",
        "message": f"Risk profile for '{profile.user_id}' updated successfully.",
        "profile": profile
    }


@app.get("/logs")
async def get_performance_logs():
    """Retrieve performance metrics:
    - Signal accuracy vs. forward return
    - Agent response latencies
    - Portfolio risk concentration score (Herfindahl-Hirschman Index)
    """
    return performance_logger_instance.get_summary_metrics()


@app.get("/documents")
async def get_documents(ticker: Optional[str] = Query(None)):
    """Retrieve indexed statutory SEBI filings and earnings transcripts."""
    all_docs = vector_db_instance.get_all_documents()
    if ticker:
        return [d for d in all_docs if d["ticker"].upper() == ticker.upper()]
    return all_docs


@app.get("/documents/search")
async def search_documents(query: str = Query(..., min_length=2), ticker: Optional[str] = None):
    """Vector similarity search across indexed documents."""
    return vector_db_instance.search(query=query, ticker=ticker, top_k=4)
