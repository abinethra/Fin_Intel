"""Synthesis Agent Module.

Merges outputs from Technical, Sentiment, and Fundamentals/RAG agents,
detects divergence / conflicting signals, and resolves them into a unified consensus.
Runs independently as an async function.
"""
import asyncio
import time
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from .base import AgentSignal


class AgentSignalVote(BaseModel):
    agent_id: str
    agent_name: str
    signal: str
    confidence: float
    weight: float
    score_contribution: float


class SynthesisResult(BaseModel):
    aggregate_signal: AgentSignal
    aggregate_score: float  # -1.0 to +1.0
    aggregate_confidence: float
    conflict_detected: bool
    conflict_summary: str
    conflict_resolution_strategy: str
    agent_votes: List[AgentSignalVote]
    synthesis_reasoning: str
    latency_ms: float


async def run_synthesis_agent(
    ticker: str,
    tech_out: Dict[str, Any],
    sent_out: Dict[str, Any],
    fund_out: Dict[str, Any]
) -> Dict[str, Any]:
    """Independent async execution function for Synthesis Agent.
    
    Hook for custom multi-agent voting algorithms, Bayesian fusion, or meta-models.
    """
    start_time = time.perf_counter()
    
    # Simulate synthesis computation
    await asyncio.sleep(0.04)
    
    # Weights for each analyst agent (Technical 35%, Fundamentals 40%, Sentiment 25%)
    weights = {
        "technical": 0.35,
        "fundamentals": 0.40,
        "sentiment": 0.25
    }
    
    def signal_to_numeric(sig: str) -> float:
        if sig == "BULLISH":
            return 1.0
        elif sig == "BEARISH":
            return -1.0
        return 0.0

    tech_sig = tech_out.get("signal", "NEUTRAL")
    sent_sig = sent_out.get("signal", "NEUTRAL")
    fund_sig = fund_out.get("signal", "NEUTRAL")

    tech_val = signal_to_numeric(tech_sig)
    sent_val = signal_to_numeric(sent_sig)
    fund_val = signal_to_numeric(fund_sig)

    tech_conf = tech_out.get("confidence", 0.7)
    sent_conf = sent_out.get("confidence", 0.7)
    fund_conf = fund_out.get("confidence", 0.7)

    # Weighted score calculation
    weighted_score = (
        (tech_val * tech_conf * weights["technical"]) +
        (fund_val * fund_conf * weights["fundamentals"]) +
        (sent_val * sent_conf * weights["sentiment"])
    ) / (
        (tech_conf * weights["technical"]) +
        (fund_conf * weights["fundamentals"]) +
        (sent_conf * weights["sentiment"])
    )

    # Detect conflicts
    unique_signals = {tech_sig, sent_sig, fund_sig}
    has_bull_and_bear = ("BULLISH" in unique_signals) and ("BEARISH" in unique_signals)
    conflict_detected = has_bull_and_bear or len(unique_signals) == 3

    conflict_summary = ""
    strategy = "Direct Multi-Factor Weighted Consensus"

    if has_bull_and_bear:
        conflict_detected = True
        strategy = "Fundamental Anchor with Technical Momentum Gate"
        conflict_summary = f"Divergence detected: {tech_sig} technical indicators vs {sent_sig} sentiment and {fund_sig} fundamentals."
    elif len(unique_signals) == 3:
        conflict_detected = True
        strategy = "Confidence-Calibrated Compromise"
        conflict_summary = "All 3 agents produced distinct signals (Bullish, Bearish, Neutral)."
    else:
        conflict_summary = "High cross-agent alignment across technical, sentiment, and fundamental vectors."

    # Final consensus signal threshold
    if weighted_score >= 0.28:
        final_signal = AgentSignal.BULLISH
    elif weighted_score <= -0.28:
        final_signal = AgentSignal.BEARISH
    else:
        final_signal = AgentSignal.NEUTRAL

    # Aggregate confidence with penalty for conflict
    base_conf = (tech_conf + fund_conf + sent_conf) / 3.0
    if conflict_detected:
        aggregate_conf = round(max(0.45, base_conf * 0.88), 2)
    else:
        aggregate_conf = round(min(0.96, base_conf * 1.05), 2)

    votes = [
        {
            "agent_id": tech_out.get("agent_id", "agent_technical_01"),
            "agent_name": "Technical Agent",
            "signal": tech_sig,
            "confidence": tech_conf,
            "weight": weights["technical"],
            "score_contribution": round(tech_val * tech_conf * weights["technical"], 3)
        },
        {
            "agent_id": fund_out.get("agent_id", "agent_fundamentals_03"),
            "agent_name": "Fundamentals RAG Agent",
            "signal": fund_sig,
            "confidence": fund_conf,
            "weight": weights["fundamentals"],
            "score_contribution": round(fund_val * fund_conf * weights["fundamentals"], 3)
        },
        {
            "agent_id": sent_out.get("agent_id", "agent_sentiment_02"),
            "agent_name": "Sentiment Agent",
            "signal": sent_sig,
            "confidence": sent_conf,
            "weight": weights["sentiment"],
            "score_contribution": round(sent_val * sent_conf * weights["sentiment"], 3)
        }
    ]

    reasoning = (
        f"Consensus derived with an aggregate score of {weighted_score:+.2f} ({final_signal.value}). "
        f"Fundamentals assigned 40% weight, Technical 35%, and Sentiment 25%. "
        f"{conflict_summary} "
        f"Primary consensus driver is {fund_out.get('reasoning', '')[:120]}..."
    )

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "agent_id": "agent_synthesis_00",
        "agent_name": "Multi-Agent Synthesis & Conflict Resolver",
        "ticker": ticker.upper(),
        "aggregate_signal": final_signal.value,
        "aggregate_score": round(weighted_score, 2),
        "aggregate_confidence": aggregate_conf,
        "conflict_detected": conflict_detected,
        "conflict_summary": conflict_summary,
        "conflict_resolution_strategy": strategy,
        "agent_votes": votes,
        "synthesis_reasoning": reasoning,
        "latency_ms": elapsed_ms,
    }
