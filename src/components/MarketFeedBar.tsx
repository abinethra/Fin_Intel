import React from "react";
import { TrendingUp, TrendingDown, Radio } from "lucide-react";
import { StockQuote } from "../types";

interface MarketFeedBarProps {
  stocks: StockQuote[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  lastUpdated?: string;
}

export const MarketFeedBar: React.FC<MarketFeedBarProps> = ({
  stocks,
  selectedTicker,
  onSelectTicker,
  lastUpdated,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Mock Market Feed</span>
          </div>
          <span className="text-slate-700">|</span>
        </div>

        {/* Horizontal Stock Scrollable Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            const isSelected = selectedTicker === stock.ticker;

            return (
              <button
                key={stock.ticker}
                id={`market-ticker-${stock.ticker}`}
                onClick={() => onSelectTicker(stock.ticker)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all shrink-0 text-left cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 border-indigo-400 shadow-xs ring-1 ring-indigo-400 text-white"
                    : "bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                }`}
              >
                <span className="font-bold text-white text-xs font-mono">{stock.ticker}</span>
                <span className="text-slate-200 font-mono text-xs">₹{stock.current_price.toLocaleString("en-IN")}</span>
                <span
                  className={`flex items-center text-[11px] font-mono font-bold ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                  )}
                  {isPositive ? "+" : ""}
                  {stock.change_pct}%
                </span>
              </button>
            );
          })}
        </div>

        {lastUpdated && (
          <div className="text-[10px] text-slate-400 font-mono shrink-0 hidden md:block">
            Tick: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};
