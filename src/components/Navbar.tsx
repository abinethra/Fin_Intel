import React from "react";
import { 
  Bot, 
  Activity, 
  FileText, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Sparkles 
} from "lucide-react";
import { UserRiskProfile } from "../types";

interface NavbarProps {
  activeTab: "analysis" | "market" | "filings" | "logs";
  setActiveTab: (tab: "analysis" | "market" | "filings" | "logs") => void;
  userProfile: UserRiskProfile;
  onOpenProfileModal: () => void;
  selectedTicker: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenProfileModal,
  selectedTicker,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 lg:px-8 py-3 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                FinIntel <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">MVP 24h</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                FastAPI + Chroma RAG
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              3 Parallel Analyst Agents &bull; Synthesis Consensus &bull; Personalized Risk
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            id="tab-analysis"
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "analysis"
                ? "bg-white text-indigo-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Agent Intelligence</span>
            {selectedTicker && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                {selectedTicker}
              </span>
            )}
          </button>

          <button
            id="tab-market"
            onClick={() => setActiveTab("market")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "market"
                ? "bg-white text-indigo-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Live Market Data</span>
          </button>

          <button
            id="tab-filings"
            onClick={() => setActiveTab("filings")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "filings"
                ? "bg-white text-indigo-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>SEBI RAG Filings</span>
          </button>

          <button
            id="tab-logs"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "logs"
                ? "bg-white text-indigo-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>Performance & Logs</span>
          </button>
        </nav>

        {/* Right: User Risk Profile Pill */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-user-profile"
            onClick={onOpenProfileModal}
            className="group flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
            title="Configure your retail investor risk profile"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-left leading-tight">
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Risk Profile</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>{userProfile.risk_tolerance}</span>
                  <span className="text-slate-500 font-normal">({userProfile.max_portfolio_allocation_pct}% max)</span>
                </div>
              </div>
            </div>
            <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
};
