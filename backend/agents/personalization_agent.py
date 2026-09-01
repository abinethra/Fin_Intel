"""Personalization Layer Module.

Adjusts multi-agent synthesis signals according to the user's stored risk profile,
loss tolerance, investment horizon, and capital preservation constraints.
"""
import time
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from .base import UserRiskProfile, RiskTolerance, InvestmentHorizon, AgentSignal


class PersonalizedRecommendation(BaseModel):
    user_id: str
    ticker: str
    profile_applied: str
    recommended_action: str
    suggested_allocation_pct: float
    suggested_capital_inr: float
    stop_loss_price: float
    target_price_12m: float
    risk_alignment_score: float  # 0.0 to 100.0
    actionable_summary: str
    retail_suitability_badge: str  # e.g., "HIGH_SUITABILITY", "PROCEED_WITH_CAUTION", "NOT_RECOMMENDED"
    risk_warnings: List[str]
    implementation_steps: List[str]
    latency_ms: float


async def run_personalization_agent(
    ticker: str,
    synthesis_out: Dict[str, Any],
    profile: UserRiskProfile,
    market_snapshot: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Applies retail investor risk profiling rules to synthesis signal."""
    start_time = time.perf_counter()
    
    sig = synthesis_out.get("aggregate_signal", "NEUTRAL")
    agg_score = synthesis_out.get("aggregate_score", 0.0)
    conf = synthesis_out.get("aggregate_confidence", 0.7)
    
    price = market_snapshot.get("current_price", 2850.0) if market_snapshot else 2850.0
    
    user_risk = profile.risk_tolerance
    horizon = profile.investment_horizon
    max_cap = profile.max_portfolio_allocation_pct
    budget = profile.monthly_budget_inr
    
    risk_warnings = []
    implementation_steps = []
    
    # Base allocation calculation
    if sig == "BULLISH":
        if user_risk == RiskTolerance.CONSERVATIVE:
            action = "STAGGERED_SIP_BUY"
            alloc_pct = min(max_cap * 0.5, 6.0)
            suitability = "HIGH_SUITABILITY" if conf > 0.75 else "PROCEED_WITH_CAUTION"
            stop_loss = round(price * 0.94, 2)
            target = round(price * 1.15, 2)
            guidance = (
                f"For your Conservative profile, {ticker} qualifies for a systematic SIP allocation. "
                f"Limit single-stock exposure to {alloc_pct}% to protect capital while capturing dividend and large-cap upside."
            )
            risk_warnings.append("Maintain strict stop loss to prevent drawdowns exceeding your conservative threshold.")
            implementation_steps = [
                f"Split planned allocation of ₹{round(budget * (alloc_pct / 100.0))} into 3 equal monthly tranches.",
                f"Set a trailing stop loss at ₹{stop_loss}."
            ]
        elif user_risk == RiskTolerance.MODERATE:
            action = "ACCUMULATE_ON_DIPS"
            alloc_pct = min(max_cap * 0.85, 12.0)
            suitability = "HIGH_SUITABILITY"
            stop_loss = round(price * 0.92, 2)
            target = round(price * 1.22, 2)
            guidance = (
                f"Well-aligned with your Moderate Growth profile. "
                f"Recommended target allocation of {alloc_pct}%, accumulating on minor pullbacks towards support levels."
            )
            implementation_steps = [
                f"Deploy 50% capital (₹{round(budget * (alloc_pct / 100.0) * 0.5)}) immediately; reserve remainder for dips.",
                f"Review position quarterly against earnings updates."
            ]
        else:  # AGGRESSIVE
            action = "STRONG_BUY_ALPHA"
            alloc_pct = min(max_cap, 18.0)
            suitability = "HIGH_SUITABILITY"
            stop_loss = round(price * 0.88, 2)
            target = round(price * 1.30, 2)
            guidance = (
                f"Aggressive growth profile permits maximum conviction sizing of {alloc_pct}%. "
                f"Strong multi-factor consensus indicates upside momentum towards target ₹{target}."
            )
            implementation_steps = [
                f"Allocate up to ₹{round(budget * (alloc_pct / 100.0))} across current breakout levels.",
                f"Target profit booking near ₹{target}."
            ]
    elif sig == "BEARISH":
        if user_risk == RiskTolerance.CONSERVATIVE:
            action = "AVOID_AND_PROTECT_CAPITAL"
            alloc_pct = 0.0
            suitability = "NOT_RECOMMENDED"
            stop_loss = round(price * 0.98, 2)
            target = round(price * 0.90, 2)
            guidance = f"Not recommended for Conservative investors due to technical and valuation headwinds."
            risk_warnings.append("Elevated risk of near-term capital erosion.")
            implementation_steps = ["Do not initiate new positions; redirect capital to liquid or index instruments."]
        else:
            action = "TRIM_OR_HEDGE"
            alloc_pct = 0.0
            suitability = "PROCEED_WITH_CAUTION"
            stop_loss = round(price * 0.95, 2)
            target = round(price * 0.88, 2)
            guidance = f"Multi-agent indicators signal distribution. Existing holders should consider booking profits or trimming exposure."
            risk_warnings.append("Downward momentum may persist across the upcoming quarter.")
            implementation_steps = ["Consider reducing allocation by 30-50% on any relief bounce."]
    else:  # NEUTRAL
        action = "HOLD_AND_MONITOR"
        alloc_pct = min(max_cap * 0.4, 5.0)
        suitability = "NEUTRAL_SUITABILITY"
        stop_loss = round(price * 0.95, 2)
        target = round(price * 1.08, 2)
        guidance = f"{ticker} is range-bound. Hold existing positions; wait for clear breakout confirmation before increasing allocation."
        implementation_steps = [f"Set price alert at ₹{round(price * 1.03, 2)} for upside breakout."]

    risk_alignment_score = round(min(100.0, max(20.0, 75.0 + (agg_score * 20.0) + (conf * 10.0))), 1)
    allocated_inr = round(budget * (alloc_pct / 100.0), 2)
    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "user_id": profile.user_id,
        "ticker": ticker.upper(),
        "profile_applied": f"{user_risk.value} ({horizon.value})",
        "recommended_action": action,
        "suggested_allocation_pct": alloc_pct,
        "suggested_capital_inr": allocated_inr,
        "stop_loss_price": stop_loss,
        "target_price_12m": target,
        "risk_alignment_score": risk_alignment_score,
        "actionable_summary": guidance,
        "retail_suitability_badge": suitability,
        "risk_warnings": risk_warnings,
        "implementation_steps": implementation_steps,
        "latency_ms": elapsed_ms,
    }
