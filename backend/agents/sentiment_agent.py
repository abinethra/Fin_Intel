"""Sentiment Analyst Agent Module.

Analyzes financial news headlines, social retail discussion sentiment,
macro market sentiment indicators, and institutional flow news.
Runs independently as an async function.
"""
import asyncio
import time
from typing import Dict, Any, List
from pydantic import BaseModel
from .base import AgentResponse, AgentSignal


class HeadlineItem(BaseModel):
    title: str
    source: str
    sentiment: str  # POSITIVE, NEGATIVE, NEUTRAL
    sentiment_score: float
    time_ago: str


class SentimentAnalysisResult(AgentResponse):
    overall_sentiment_score: float  # -1.0 to +1.0
    sentiment_label: str
    bullish_factors: List[str]
    bearish_factors: List[str]
    recent_headlines: List[HeadlineItem]
    social_volume_trend: str


async def run_sentiment_agent(ticker: str, market_snapshot: Dict[str, Any] = None) -> Dict[str, Any]:
    """Independent async execution function for Sentiment Agent.
    
    Hook for custom sentiment NLP models / Twitter/Reddit/News scrapers.
    Extend this to hook up real-time news RSS or LLM-based sentiment scoring.
    """
    start_time = time.perf_counter()
    
    # Simulate slight async I/O / NLP processing time (e.g. 70-150ms)
    await asyncio.sleep(0.11)
    
    ticker_clean = ticker.upper().strip()
    
    # Curated contextual sentiment feeds for top Indian/global stocks
    sentiment_db = {
        "RELIANCE": {
            "score": 0.72,
            "signal": AgentSignal.BULLISH,
            "confidence": 0.81,
            "label": "Strongly Positive",
            "bullish": ["Telecom ARPU growth guidance raised by 12%", "Retail division footfall at record highs", "Green Hydrogen pilot project commissioned"],
            "bearish": ["Oil-to-chemicals refining margins under mild pressure"],
            "social": "+28% discussion volume increase, 78% positive mentions",
            "headlines": [
                {"title": "Reliance Retail expands store network by 400+ locations in Q3", "source": "Economic Times", "sentiment": "POSITIVE", "sentiment_score": 0.85, "time_ago": "2h ago"},
                {"title": "Jio adds 3.4M 5G active subscribers beating analyst estimates", "source": "Mint", "sentiment": "POSITIVE", "sentiment_score": 0.79, "time_ago": "5h ago"},
                {"title": "Global refining crack spreads soften amidst mild winter demand", "source": "Reuters", "sentiment": "NEUTRAL", "sentiment_score": -0.15, "time_ago": "1d ago"},
            ]
        },
        "TATAMOTORS": {
            "score": 0.68,
            "signal": AgentSignal.BULLISH,
            "confidence": 0.79,
            "label": "Bullish Momentum",
            "bullish": ["JLR order book remains robust at >150k units", "EV market share leadership in passenger vehicle segment in India (>68%)"],
            "bearish": ["UK logistics and supply chain cost headwinds"],
            "social": "+34% retail trader interest across financial forums",
            "headlines": [
                {"title": "Tata Motors commercial vehicle export volumes rebound 14%", "source": "CNBC-TV18", "sentiment": "POSITIVE", "sentiment_score": 0.74, "time_ago": "3h ago"},
                {"title": "Jaguar Land Rover delivers strongest cash flow in 6 quarters", "source": "Bloomberg", "sentiment": "POSITIVE", "sentiment_score": 0.82, "time_ago": "8h ago"},
            ]
        },
        "INFY": {
            "score": -0.38,
            "signal": AgentSignal.BEARISH,
            "confidence": 0.74,
            "label": "Mildly Negative / Cautious",
            "bullish": ["BFSI large deal pipeline remains intact at $2.4B"],
            "bearish": ["US enterprise discretionary tech spending slowdown", "Q4 guidance revision concerns reported by brokerages"],
            "social": "-15% volume drop, mixed sentiment with retail profit-taking",
            "headlines": [
                {"title": "IT services sector sees delayed deal ramp-ups in North America", "source": "Business Standard", "sentiment": "NEGATIVE", "sentiment_score": -0.45, "time_ago": "4h ago"},
                {"title": "Infosys expands AI generative enterprise suite partnerships", "source": "TechCrunch", "sentiment": "POSITIVE", "sentiment_score": 0.60, "time_ago": "1d ago"},
            ]
        },
        "HDFCBANK": {
            "score": 0.45,
            "signal": AgentSignal.BULLISH,
            "confidence": 0.72,
            "label": "Moderately Positive",
            "bullish": ["Deposit mobilization accelerating post-merger integration", "Asset quality and Gross NPA stable at 1.24%"],
            "bearish": ["Net Interest Margin (NIM) compression of 8 bps over 2 quarters"],
            "social": "Steady institutional accumulation chatter, neutral retail sentiment",
            "headlines": [
                {"title": "HDFC Bank opens 150 new branches to drive low-cost CASA growth", "source": "Financial Express", "sentiment": "POSITIVE", "sentiment_score": 0.65, "time_ago": "6h ago"},
                {"title": "RBI monetary policy maintains stance; banking sector liquidity improves", "source": "Moneycontrol", "sentiment": "NEUTRAL", "sentiment_score": 0.20, "time_ago": "12h ago"},
            ]
        },
        "TCS": {
            "score": 0.15,
            "signal": AgentSignal.NEUTRAL,
            "confidence": 0.65,
            "label": "Neutral / Balanced",
            "bullish": ["Record order book book-to-bill ratio of 1.3x", "Attrition down to 12.1%"],
            "bearish": ["European market client budget freezes"],
            "social": "Stable sentiment, high long-term dividend investor loyalty",
            "headlines": [
                {"title": "TCS bags mega cloud modernization contract from European telecom major", "source": "Economic Times", "sentiment": "POSITIVE", "sentiment_score": 0.71, "time_ago": "1d ago"},
                {"title": "Global IT consulting spending growth projected to moderate in H1", "source": "Gartner Research", "sentiment": "NEGATIVE", "sentiment_score": -0.32, "time_ago": "2d ago"},
            ]
        },
    }

    data = sentiment_db.get(ticker_clean, {
        "score": 0.20,
        "signal": AgentSignal.NEUTRAL,
        "confidence": 0.60,
        "label": "Neutral Baseline",
        "bullish": ["Broad sector stability", "Institutional holdings maintained"],
        "bearish": ["Macro interest rate uncertainty"],
        "social": "Standard retail activity",
        "headlines": [
            {"title": f"Market analysts review quarterly outlook for {ticker_clean}", "source": "Market Watch", "sentiment": "NEUTRAL", "sentiment_score": 0.1, "time_ago": "5h ago"},
        ]
    })

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    
    reasoning = (
        f"Sentiment score of {data['score']:+.2f} ({data['label']}). "
        f"Primary positive catalyst: {data['bullish'][0] if data['bullish'] else 'None'}. "
        f"Primary risk factor: {data['bearish'][0] if data['bearish'] else 'None'}. "
        f"Social media trend: {data['social']}."
    )

    return {
        "agent_id": "agent_sentiment_02",
        "agent_name": "News & Market Sentiment Agent",
        "ticker": ticker_clean,
        "signal": data["signal"].value,
        "confidence": data["confidence"],
        "reasoning": reasoning,
        "latency_ms": elapsed_ms,
        "overall_sentiment_score": data["score"],
        "sentiment_label": data["label"],
        "bullish_factors": data["bullish"],
        "bearish_factors": data["bearish"],
        "recent_headlines": data["headlines"],
        "social_volume_trend": data["social"],
    }
