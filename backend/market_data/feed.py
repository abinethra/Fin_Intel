"""Simulated Market Data Feed Module.

Generates realistic mock OHLCV + volume data for 5-10 major Indian/global equities,
updating live price ticks every few seconds with stochastic Brownian micro-volatility.
"""
import random
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional


# Base stock registry with realistic starting prices & sector attributes
BASE_STOCKS = {
    "RELIANCE": {"name": "Reliance Industries Ltd", "sector": "Energy & Retail", "base_price": 2942.50, "beta": 1.15},
    "TCS": {"name": "Tata Consultancy Services", "sector": "Information Tech", "base_price": 4185.00, "beta": 0.85},
    "HDFCBANK": {"name": "HDFC Bank Limited", "sector": "Financial Services", "base_price": 1648.20, "beta": 1.05},
    "INFY": {"name": "Infosys Limited", "sector": "Information Tech", "base_price": 1824.60, "beta": 1.20},
    "ICICIBANK": {"name": "ICICI Bank Ltd", "sector": "Financial Services", "base_price": 1215.80, "beta": 1.10},
    "TATAMOTORS": {"name": "Tata Motors Ltd", "sector": "Automobile & EV", "base_price": 986.40, "beta": 1.45},
    "HINDUNILVR": {"name": "Hindustan Unilever Ltd", "sector": "Consumer Goods (FMCG)", "base_price": 2735.00, "beta": 0.65},
    "ITC": {"name": "ITC Limited", "sector": "Conglomerate & FMCG", "base_price": 492.30, "beta": 0.70},
}


class SimulatedMarketDataFeed:
    def __init__(self):
        self.stocks = {}
        self.history_cache = {}
        self._init_feed()

    def _init_feed(self):
        now = datetime.utcnow()
        for ticker, info in BASE_STOCKS.items():
            base_p = info["base_price"]
            day_open = round(base_p * (1.0 + random.uniform(-0.008, 0.008)), 2)
            cur_price = round(day_open * (1.0 + random.uniform(-0.015, 0.022)), 2)
            high_price = round(max(day_open, cur_price) * (1.0 + random.uniform(0.002, 0.012)), 2)
            low_price = round(min(day_open, cur_price) * (1.0 - random.uniform(0.002, 0.012)), 2)
            prev_close = base_p
            change = round(cur_price - prev_close, 2)
            change_pct = round((change / prev_close) * 100, 2)
            vol = random.randint(1500000, 6800000)

            self.stocks[ticker] = {
                "ticker": ticker,
                "name": info["name"],
                "sector": info["sector"],
                "current_price": cur_price,
                "open": day_open,
                "high": high_price,
                "low": low_price,
                "prev_close": prev_close,
                "change": change,
                "change_pct": change_pct,
                "volume": vol,
                "vwap": round((high_price + low_price + cur_price) / 3, 2),
                "bid": round(cur_price - 0.15, 2),
                "ask": round(cur_price + 0.15, 2),
                "last_updated": now.isoformat(),
                "beta": info["beta"],
            }
            
            # Generate 30-day historical OHLCV series
            self.history_cache[ticker] = self._generate_historical_series(ticker, cur_price)

    def _generate_historical_series(self, ticker: str, current_p: float, days: int = 30) -> List[Dict[str, Any]]:
        series = []
        p = current_p * 0.92  # 30 days ago starting point
        now = datetime.utcnow()
        for i in range(days, 0, -1):
            dt = now - timedelta(days=i)
            # Daily fluctuation
            ret = random.gauss(0.0015, 0.016)
            o = round(p, 2)
            c = round(p * (1.0 + ret), 2)
            h = round(max(o, c) * (1.0 + random.uniform(0.002, 0.015)), 2)
            l = round(min(o, c) * (1.0 - random.uniform(0.002, 0.015)), 2)
            v = random.randint(1200000, 7500000)
            series.append({
                "date": dt.strftime("%Y-%m-%d"),
                "timestamp": dt.isoformat(),
                "open": o,
                "high": h,
                "low": l,
                "close": c,
                "volume": v,
            })
            p = c
        # Append today
        series.append({
            "date": now.strftime("%Y-%m-%d"),
            "timestamp": now.isoformat(),
            "open": self.stocks[ticker]["open"] if ticker in self.stocks else round(p, 2),
            "high": self.stocks[ticker]["high"] if ticker in self.stocks else round(p * 1.01, 2),
            "low": self.stocks[ticker]["low"] if ticker in self.stocks else round(p * 0.99, 2),
            "close": current_p,
            "volume": self.stocks[ticker]["volume"] if ticker in self.stocks else 2500000,
        })
        return series

    def tick_update(self) -> Dict[str, Any]:
        """Simulate real-time stochastic market ticks for all symbols."""
        now = datetime.utcnow()
        for ticker, data in self.stocks.items():
            # Micro tick step (+/- 0.08% to 0.25%)
            delta_pct = random.gauss(0.0, 0.0018) * data["beta"]
            new_price = round(data["current_price"] * (1.0 + delta_pct), 2)
            data["current_price"] = new_price
            data["high"] = max(data["high"], new_price)
            data["low"] = min(data["low"], new_price)
            data["change"] = round(new_price - data["prev_close"], 2)
            data["change_pct"] = round((data["change"] / data["prev_close"]) * 100, 2)
            data["volume"] += random.randint(500, 8500)
            data["bid"] = round(new_price - 0.10, 2)
            data["ask"] = round(new_price + 0.10, 2)
            data["last_updated"] = now.isoformat()
        return self.stocks

    def get_market_overview(self) -> List[Dict[str, Any]]:
        self.tick_update()
        return list(self.stocks.values())

    def get_stock_data(self, ticker: str) -> Optional[Dict[str, Any]]:
        ticker_clean = ticker.upper().strip()
        self.tick_update()
        if ticker_clean in self.stocks:
            stock_info = dict(self.stocks[ticker_clean])
            stock_info["history"] = self.history_cache.get(ticker_clean, [])
            return stock_info
        return None


# Global singleton feed
market_feed_instance = SimulatedMarketDataFeed()
