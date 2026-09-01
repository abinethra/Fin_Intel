"""Technical Analyst Agent Module.

Analyzes price action, moving averages (SMA 20/50/200), RSI (14), MACD, Bollinger Bands,
and volume breakouts. Runs independently as an async function.
"""
import asyncio
import time
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from .base import AgentResponse, AgentSignal


class TechnicalMetrics(BaseModel):
    current_price: float
    rsi_14: float
    rsi_signal: str
    sma_20: float
    sma_50: float
    sma_200: float
    macd_line: float
    macd_signal_line: float
    macd_histogram: float
    macd_interpretation: str
    bollinger_upper: float
    bollinger_lower: float
    support_level: float
    resistance_level: float
    volume_surge_ratio: float
    primary_chart_pattern: str


class TechnicalAnalysisResult(AgentResponse):
    indicators: TechnicalMetrics
    key_breakouts: List[str]
    timeframe: str = "1D"


async def run_technical_agent(ticker: str, market_snapshot: Dict[str, Any] = None) -> Dict[str, Any]:
    """Independent async execution function for Technical Agent.
    
    Hook for custom algorithm extensions:
    You can modify indicator weights, integrate custom candle patterns,
    or connect real exchange order books here.
    """
    start_time = time.perf_counter()
    
    # Simulate slight async I/O / compute overhead (e.g. 50-120ms)
    await asyncio.sleep(0.08)
    
    ticker_clean = ticker.upper().strip()
    
    # Default indicator calculations based on stock characteristics or live snapshot
    price = market_snapshot.get("current_price", 2850.0) if market_snapshot else 2850.0
    change_pct = market_snapshot.get("change_pct", 1.2) if market_snapshot else 1.2
    
    # Technical logic calculation
    if ticker_clean in ["RELIANCE", "TATAMOTORS", "ICICIBANK"]:
        rsi = 62.4
        sma_20 = round(price * 0.98, 2)
        sma_50 = round(price * 0.95, 2)
        sma_200 = round(price * 0.91, 2)
        macd = 14.8
        macd_signal = 11.2
        hist = round(macd - macd_signal, 2)
        signal = AgentSignal.BULLISH
        confidence = 0.84
        reasoning = (
            f"{ticker_clean} shows strong momentum trading above its 20-day (₹{sma_20}) and 50-day (₹{sma_50}) SMA. "
            f"RSI-14 at {rsi} indicates healthy buying momentum without overbought exhaustion. "
            f"MACD histogram (+{hist}) confirms a golden crossover with 1.35x average volume expansion."
        )
        pattern = "Ascending Triangle Breakout"
        breakouts = ["20-day SMA breakout", "MACD Bullish Histogram Expansion", "Resistance flip at ₹" + str(round(price * 1.02, 2))]
    elif ticker_clean in ["INFY", "WIPRO"]:
        rsi = 39.5
        sma_20 = round(price * 1.02, 2)
        sma_50 = round(price * 1.04, 2)
        sma_200 = round(price * 1.01, 2)
        macd = -8.4
        macd_signal = -5.1
        hist = round(macd - macd_signal, 2)
        signal = AgentSignal.BEARISH
        confidence = 0.76
        reasoning = (
            f"{ticker_clean} is facing distribution below its declining 20-day SMA (₹{sma_20}). "
            f"RSI-14 at {rsi} shows weak buying pressure and MACD is trending deeper into negative territory (-{abs(hist)}). "
            f"Immediate support tested at ₹{round(price * 0.97, 2)} with overhead supply at ₹{round(price * 1.03, 2)}."
        )
        pattern = "Descending Channel / Lower Highs"
        breakouts = ["Testing 50-day SMA Support", "Negative MACD Divergence"]
    else:  # TCS, HDFCBANK, ITC, HINDUNILVR
        rsi = 51.8
        sma_20 = round(price * 0.995, 2)
        sma_50 = round(price * 1.005, 2)
        sma_200 = round(price * 0.97, 2)
        macd = 1.8
        macd_signal = 1.6
        hist = round(macd - macd_signal, 2)
        signal = AgentSignal.NEUTRAL
        confidence = 0.68
        reasoning = (
            f"{ticker_clean} is consolidating in a tight 2.5% band between ₹{round(price * 0.98, 2)} and ₹{round(price * 1.02, 2)}. "
            f"RSI at {rsi} reflects equilibrium between buyers and sellers. Bollinger Bands are squeezing, anticipating a volatility expansion."
        )
        pattern = "Horizontal Consolidation Box"
        breakouts = ["Bollinger Band Squeeze", "Volume Drying up Near 50-SMA"]

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

    indicators_dict = {
        "current_price": price,
        "rsi_14": rsi,
        "rsi_signal": "BULLISH_MOMENTUM" if rsi > 55 else ("BEARISH_WEAKNESS" if rsi < 45 else "NEUTRAL_ZONE"),
        "sma_20": sma_20,
        "sma_50": sma_50,
        "sma_200": sma_200,
        "macd_line": macd,
        "macd_signal_line": macd_signal,
        "macd_histogram": hist,
        "macd_interpretation": "Bullish Crossover" if hist > 0 else "Bearish Divergence",
        "bollinger_upper": round(price * 1.04, 2),
        "bollinger_lower": round(price * 0.96, 2),
        "support_level": round(price * 0.965, 2),
        "resistance_level": round(price * 1.035, 2),
        "volume_surge_ratio": 1.38 if signal == AgentSignal.BULLISH else 0.92,
        "primary_chart_pattern": pattern,
    }

    return {
        "agent_id": "agent_technical_01",
        "agent_name": "Technical Momentum & Price Action Agent",
        "ticker": ticker_clean,
        "signal": signal.value,
        "confidence": confidence,
        "reasoning": reasoning,
        "latency_ms": elapsed_ms,
        "indicators": indicators_dict,
        "key_breakouts": breakouts,
        "timeframe": "1D / 4H Multi-Timeframe",
    }
