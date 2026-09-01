import React from "react";
import { UserRiskProfile, PortfolioHolding, RiskTolerance } from "../types";
import {
  PieChart,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sliders,
  DollarSign,
  Wallet,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";

interface UserPortfolioPanelProps {
  userProfile: UserRiskProfile;
  onChangeRiskTolerance: (tolerance: RiskTolerance) => void;
  onSelectTicker?: (ticker: string) => void;
  selectedTicker?: string;
}

export const UserPortfolioPanel: React.FC<UserPortfolioPanelProps> = ({
  userProfile,
  onChangeRiskTolerance,
  onSelectTicker,
  selectedTicker,
}) => {
  const holdings = userProfile.holdings || [];

  const totalPortfolioValue = holdings.reduce(
    (acc, h) => acc + h.current_value_inr,
    0
  );
  const totalPnlAmount = holdings.reduce((acc, h) => acc + h.pnl_amount_inr, 0);
  const totalPnlPct =
    totalPortfolioValue > 0
      ? (totalPnlAmount / (totalPortfolioValue - totalPnlAmount)) * 100
      : 0;

  const isNetPositive = totalPnlAmount >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* 1. Header & Risk Profile Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              3. User Portfolio & Watchlist Panel
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real holdings, sector allocation, and instant risk profile switching for live demo personalization
          </p>
        </div>

        {/* Interactive Risk Profile Segmented Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 px-2 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3 h-3 text-indigo-600" />
            <span>Demo Risk Profile:</span>
          </span>

          <div className="grid grid-cols-3 gap-1">
            {(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"] as RiskTolerance[]).map(
              (tier) => {
                const isActive = userProfile.risk_tolerance === tier;
                return (
                  <button
                    key={tier}
                    id={`risk-toggle-${tier.toLowerCase()}`}
                    onClick={() => onChangeRiskTolerance(tier)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      isActive
                        ? tier === "CONSERVATIVE"
                          ? "bg-blue-600 text-white shadow-xs"
                          : tier === "MODERATE"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                    }`}
                  >
                    {tier}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* 2. Portfolio Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Total Portfolio Value</span>
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            ₹{totalPortfolioValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-slate-500">
            Across {holdings.length} Core Equities
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Unrealized Net P&L</span>
            {isNetPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            )}
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              isNetPositive ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isNetPositive ? "+" : ""}₹{totalPnlAmount.toLocaleString("en-IN")}{" "}
            <span className="text-xs font-normal">
              ({isNetPositive ? "+" : ""}
              {Math.round(totalPnlPct * 100) / 100}%)
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            Realized 5D Benchmark Alpha: +2.16%
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-between">
            <span>Risk Mandate Active</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 pt-0.5">
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[11px]">
              {userProfile.risk_tolerance}
            </span>
            <span className="text-slate-600 text-[11px]">
              (Max {userProfile.max_portfolio_allocation_pct}% cap)
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            {userProfile.risk_tolerance === "CONSERVATIVE"
              ? "Downgrades BUY signals if conf < 80%"
              : userProfile.risk_tolerance === "AGGRESSIVE"
              ? "Enables alpha growth sizing up to 18%"
              : "Standard balanced factor diversification"}
          </div>
        </div>
      </div>

      {/* 3. Holdings Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Current Equity Holdings & Weights
          </h3>
          <span className="text-[11px] text-slate-500">
            Click any row to run multi-agent analysis
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Shares</th>
                <th className="py-2.5 px-3 text-right">Avg Cost (₹)</th>
                <th className="py-2.5 px-3 text-right">Current (₹)</th>
                <th className="py-2.5 px-3 text-right">Value (₹)</th>
                <th className="py-2.5 px-3 text-right">Weight</th>
                <th className="py-2.5 px-3 text-right">P&L (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {holdings.map((h) => {
                const isSelected = selectedTicker === h.ticker;
                const isPos = h.pnl_pct >= 0;
                return (
                  <tr
                    key={h.ticker}
                    id={`holding-row-${h.ticker}`}
                    onClick={() => onSelectTicker?.(h.ticker)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/70 font-semibold"
                        : "hover:bg-slate-50 bg-white"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-900 font-bold flex items-center gap-1.5">
                      <span>{h.ticker}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                      {h.sector}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {h.shares}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      ₹{h.avg_buy_price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{h.current_price.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{h.current_value_inr.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                        {h.weight_pct}%
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        isPos ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {h.pnl_pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
