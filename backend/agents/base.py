"""Base schemas and abstractions for the Multi-Agent Financial Intelligence System."""
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class AgentSignal(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"


class RiskTolerance(str, Enum):
    CONSERVATIVE = "CONSERVATIVE"
    MODERATE = "MODERATE"
    AGGRESSIVE = "AGGRESSIVE"


class InvestmentHorizon(str, Enum):
    SHORT_TERM = "SHORT_TERM"      # < 1 month
    MEDIUM_TERM = "MEDIUM_TERM"    # 1 - 12 months
    LONG_TERM = "LONG_TERM"        # > 1 year


class UserRiskProfile(BaseModel):
    user_id: str = Field(default="user_retail_01", description="Unique identifier for the retail investor")
    risk_tolerance: RiskTolerance = Field(default=RiskTolerance.MODERATE, description="User's loss and volatility tolerance")
    investment_horizon: InvestmentHorizon = Field(default=InvestmentHorizon.MEDIUM_TERM, description="Planned holding duration")
    max_portfolio_allocation_pct: float = Field(default=15.0, description="Max allowed capital allocation per single stock")
    capital_preservation_priority: bool = Field(default=False, description="Whether downside protection takes precedence")
    monthly_budget_inr: float = Field(default=50000.0, description="Monthly investable capital in INR")
    preferred_sectors: List[str] = Field(default_factory=lambda: ["Technology", "Banking", "Energy", "Automobile"])


class AgentResponse(BaseModel):
    """Universal schema interface for all analyst agent outputs."""
    agent_id: str = Field(..., description="Identifier of the executing agent")
    agent_name: str = Field(..., description="Display name of the agent")
    ticker: str = Field(..., description="Asset ticker symbol analysed")
    signal: AgentSignal = Field(..., description="Primary directional signal: BULLISH, BEARISH, NEUTRAL")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    reasoning: str = Field(..., description="Detailed textual rationale explaining the analysis")
    latency_ms: float = Field(default=0.0, description="Execution duration in milliseconds")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="ISO timestamp of generation")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Agent-specific structured data")


class AnalysisRequest(BaseModel):
    ticker: str = Field(..., description="Stock symbol to analyze (e.g., RELIANCE, TCS, HDFCBANK, INFY)")
    user_id: Optional[str] = Field(default="user_retail_01", description="User ID for profile lookup")
    custom_profile: Optional[UserRiskProfile] = Field(default=None, description="Optional override risk profile")
    include_raw_filings: Optional[bool] = Field(default=True, description="Whether to include retrieved SEBI document citations")


class CompleteAnalysisResult(BaseModel):
    ticker: str
    timestamp: str
    execution_mode: str = "PARALLEL_ASYNC_3_AGENTS"
    total_latency_ms: float
    
    # 3 Parallel Analyst Agent Outputs
    technical_agent: Dict[str, Any]
    sentiment_agent: Dict[str, Any]
    fundamentals_agent: Dict[str, Any]
    
    # Synthesis Agent Output (Conflict resolution + Aggregation)
    synthesis: Dict[str, Any]
    
    # Personalization Layer Output (Tailored to User Risk Profile)
    personalization: Dict[str, Any]
    
    # Applied User Profile Snapshot
    user_profile: UserRiskProfile
