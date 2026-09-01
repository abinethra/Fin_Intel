import React from "react";
import { StockQuote } from "../types";
import { TrendingUp, TrendingDown, Radio, Activity, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface LiveMarketSignalsPanelProps {
  stocks: StockQuote[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  lastUpdated?: string;
  isPolling?: boolean;
}

export const LiveMarketSignalsPanel: React.FC<LiveMarketSignalsPanelProps> = ({
  stocks,
  selectedTicker,
  onSelectTicker,
  lastUpdated,
  isPolling = true,
}) => {
  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case "BULLISH":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          icon: <TrendingUp className="w-3 h-3 text-emerald-600" />,
        };
      case "BEARISH":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          icon: <TrendingDown className="w-3 h-3 text-rose-600" />,
        };
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          icon: <Activity className="w-3 h-3 text-amber-600" />,
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Radio className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">1. Live Market Signals Panel</h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time feed with multi-factor directional classification (Bullish / Bearish / Neutral) & confidence
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isPolling ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
            {isPolling ? "5s Live Polling" : "Polling Paused"}
          </span>
          {lastUpdated && (
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              Tick: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Grid of Ticker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {stocks.map((stock) => {
          const isSelected = selectedTicker === stock.ticker;
          const isPositive = stock.change >= 0;
          const badge = getSignalBadge(stock.signal);

          return (
            <button
              key={stock.ticker}
              id={`signal-card-${stock.ticker}`}
              onClick={() => onSelectTicker(stock.ticker)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group ${
                isSelected
                  ? "bg-indigo-50/50 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20"
                  : "bg-slate-50 hover:bg-white hover:border-slate-300 border-slate-200"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 rounded-bl-lg"></div>
              )}

              {/* Ticker & Signal Badge */}
              <div className="flex items-center justify-between gap-1">
                <div>
                  <span className="font-bold text-slate-900 text-xs font-mono tracking-tight block">
                    {stock.ticker}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block max-w-[100px]">
                    {stock.sector}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${badge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  {stock.signal}
                </span>
              </div>

              {/* Price & Change */}
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-base font-bold font-mono text-slate-900">
                  ₹{stock.current_price.toLocaleString("en-IN")}
                </div>
                <div
                  className={`flex items-center text-xs font-mono font-bold ${
                    isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stock.change_pct}%
                </div>
              </div>

              {/* Confidence & Catalyst */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Confidence</span>
                  <span className="font-mono font-bold text-slate-700">
                    {Math.round(stock.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stock.signal === "BULLISH"
                        ? "bg-emerald-500"
                        : stock.signal === "BEARISH"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${stock.confidence * 100}%` }}
                  ></div>
                </div>
                {stock.catalyst && (
                  <p className="text-[10px] text-slate-500 line-clamp-1 italic pt-0.5">
                    {stock.catalyst}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
