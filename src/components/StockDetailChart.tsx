import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { StockQuote } from "../types";
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap } from "lucide-react";

interface StockDetailChartProps {
  stock: StockQuote;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const StockDetailChart: React.FC<StockDetailChartProps> = ({
  stock,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const isPositive = stock.change >= 0;
  const historyData = stock.history || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{stock.ticker}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
              {stock.sector}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-medium border border-indigo-200">
              Beta: {stock.beta}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{stock.name}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{stock.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-xs font-mono font-bold ${
                isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isPositive ? "+" : ""}
                {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
                {stock.change_pct.toFixed(2)}%)
              </span>
            </div>
          </div>

          <button
            id="btn-run-analysis-primary"
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Executing Multi-Agent Pipeline..." : "Analyze with 3 Agents"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 my-2 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Day Range</span>
          <span className="font-mono text-slate-800 font-bold">
            ₹{stock.low} - ₹{stock.high}
          </span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Open / Prev Close</span>
          <span className="font-mono text-slate-800 font-bold">
            ₹{stock.open} / ₹{stock.prev_close}
          </span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Simulated Volume</span>
          <span className="font-mono text-slate-800 font-bold">
            {(stock.volume / 100000).toFixed(2)} Lakhs
          </span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-[11px]">Feed Status</span>
          <span className="font-mono text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Mock Tick Stream
          </span>
        </div>
      </div>

      {/* 30-Day OHLCV History Area Chart */}
      <div className="h-64 mt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium text-slate-700">30-Day Historical Price & Volume (OHLCV)</span>
          <span className="text-[11px] font-mono text-slate-400">FastAPI /market-data Feed</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#059669" : "#4f46e5"} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isPositive ? "#059669" : "#4f46e5"} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              tickFormatter={(val) => val.slice(5)}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              domain={["auto", "auto"]}
              tickLine={false}
              orientation="right"
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs font-mono text-slate-200">
                      <div className="text-slate-400 text-[10px] mb-1">{data.date}</div>
                      <div>Close: <span className="text-white font-bold">₹{data.close}</span></div>
                      <div className="text-[11px] text-slate-400">High: ₹{data.high} | Low: ₹{data.low}</div>
                      <div className="text-[11px] text-slate-400">Vol: {(data.volume / 100000).toFixed(1)}L</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? "#059669" : "#4f46e5"}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
