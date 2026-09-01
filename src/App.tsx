import React, { useState, useEffect, useRef } from "react";
import {
  StockQuote,
  CompleteAnalysisResponse,
  UserRiskProfile,
  DocumentCitation,
  PerformanceLogsResponse,
  RiskTolerance,
} from "./types";
import { Navbar } from "./components/Navbar";
import { MarketFeedBar } from "./components/MarketFeedBar";
import { LiveMarketSignalsPanel } from "./components/LiveMarketSignalsPanel";
import { SynthesizedRecommendationPanel } from "./components/SynthesizedRecommendationPanel";
import { UserPortfolioPanel } from "./components/UserPortfolioPanel";
import { PerformanceLogsPanel } from "./components/PerformanceLogsPanel";
import { StockDetailChart } from "./components/StockDetailChart";
import { VectorFilingsExplorer } from "./components/VectorFilingsExplorer";
import { UserProfileModal } from "./components/UserProfileModal";
import {
  Bot,
  Activity,
  Sparkles,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Cpu,
  Layers,
  Radio,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "signals" | "filings" | "logs">("dashboard");
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("RELIANCE");
  const [currentStock, setCurrentStock] = useState<StockQuote | null>(null);
  const [analysis, setAnalysis] = useState<CompleteAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [logs, setLogs] = useState<PerformanceLogsResponse | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [lastFeedTick, setLastFeedTick] = useState<string>("");
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [pollCountdown, setPollCountdown] = useState<number>(5);

  const [userProfile, setUserProfile] = useState<UserRiskProfile>({
    user_id: "user_retail_01",
    risk_tolerance: "MODERATE",
    investment_horizon: "MEDIUM_TERM",
    max_portfolio_allocation_pct: 15.0,
    capital_preservation_priority: false,
    monthly_budget_inr: 50000.0,
    preferred_sectors: ["Technology", "Banking", "Energy", "Automobile"],
    holdings: [
      { ticker: "RELIANCE", name: "Reliance Industries", shares: 45, avg_buy_price: 2650.0, current_price: 2942.50, current_value_inr: 132412.5, weight_pct: 28.5, pnl_amount_inr: 13162.5, pnl_pct: 11.04, sector: "Energy & Retail" },
      { ticker: "TCS", name: "Tata Consultancy Services", shares: 25, avg_buy_price: 3950.0, current_price: 4185.00, current_value_inr: 104625.0, weight_pct: 22.5, pnl_amount_inr: 5875.0, pnl_pct: 5.95, sector: "Information Tech" },
      { ticker: "HDFCBANK", name: "HDFC Bank Ltd", shares: 60, avg_buy_price: 1580.0, current_price: 1648.20, current_value_inr: 98892.0, weight_pct: 21.3, pnl_amount_inr: 4092.0, pnl_pct: 4.32, sector: "Financial Services" },
      { ticker: "TATAMOTORS", name: "Tata Motors Ltd", shares: 80, avg_buy_price: 820.0, current_price: 986.40, current_value_inr: 78912.0, weight_pct: 17.0, pnl_amount_inr: 13312.0, pnl_pct: 20.29, sector: "Automobile & EV" },
      { ticker: "INFY", name: "Infosys Ltd", shares: 28, avg_buy_price: 1890.0, current_price: 1824.60, current_value_inr: 51088.8, weight_pct: 10.7, pnl_amount_inr: -1831.2, pnl_pct: -3.46, sector: "Information Tech" },
    ],
    portfolio_concentration: {
      holdings: { RELIANCE: 28.5, TCS: 22.5, HDFCBANK: 21.3, TATAMOTORS: 17.0, INFY: 10.7 },
      sector_exposure: { "Energy & Retail": 28.5, "Information Tech": 33.2, "Financial Services": 21.3, "Automobile & EV": 17.0 },
      target_stock_weight_pct: 28.5,
      target_sector: "Energy & Retail",
      target_sector_weight_pct: 28.5,
    }
  });

  // 1. Initial Load: Fetch all 4 endpoints
  useEffect(() => {
    fetchAllEndpoints();
  }, []);

  // 2. 5-Second Polling Loop to simulate real-time updates
  useEffect(() => {
    if (!isPollingActive) return;

    const interval = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) {
          fetchMarketData(false);
          fetchLogs();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPollingActive, selectedTicker]);

  // 3. Re-run analysis when selectedTicker changes
  useEffect(() => {
    if (selectedTicker) {
      fetchStockDetails(selectedTicker);
      runAgentAnalysis(selectedTicker, userProfile);
    }
  }, [selectedTicker]);

  const fetchAllEndpoints = async () => {
    await Promise.all([
      fetchUserProfile(),
      fetchMarketData(true),
      fetchLogs(),
    ]);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/user-profile");
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchMarketData = async (updateSelectedStock = false) => {
    try {
      const res = await fetch("/market-data");
      if (res.ok) {
        const data = await res.json();
        if (data.stocks && Array.isArray(data.stocks)) {
          setStocks(data.stocks);
          setLastFeedTick(data.timestamp || new Date().toISOString());
          if (updateSelectedStock && !currentStock) {
            const defaultStock =
              data.stocks.find((s: StockQuote) => s.ticker === selectedTicker) ||
              data.stocks[0];
            if (defaultStock) {
              fetchStockDetails(defaultStock.ticker);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching /market-data:", err);
    }
  };

  const fetchStockDetails = async (ticker: string) => {
    try {
      const res = await fetch(`/market-data?ticker=${ticker}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentStock(data);
      }
    } catch (err) {
      console.error(`Error fetching /market-data?ticker=${ticker}:`, err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error fetching /logs:", err);
    }
  };

  const runAgentAnalysis = async (ticker = selectedTicker, profile = userProfile) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          user_id: profile.user_id,
          custom_profile: profile,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        fetchLogs(); // refresh performance logs after run
      }
    } catch (err) {
      console.error(`Error running /run-analysis for ${ticker}:`, err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Instant Risk Profile Switcher for demo purposes
  const handleRiskToleranceChange = async (newTolerance: RiskTolerance) => {
    const updatedProfile: UserRiskProfile = {
      ...userProfile,
      risk_tolerance: newTolerance,
      capital_preservation_priority: newTolerance === "CONSERVATIVE",
      max_portfolio_allocation_pct:
        newTolerance === "CONSERVATIVE"
          ? 8.0
          : newTolerance === "AGGRESSIVE"
          ? 25.0
          : 15.0,
    };

    setUserProfile(updatedProfile);

    // Persist to /user-profile
    try {
      await fetch("/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
    } catch (err) {
      console.error("Error saving updated profile:", err);
    }

    // Immediately re-run analysis with the new risk profile
    runAgentAnalysis(selectedTicker, updatedProfile);
  };

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 lg:px-8 py-3 text-slate-900 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                  FinIntel Multi-Agent <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">24h MVP</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  FastAPI Endpoints Active
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                3 Specialist Agents &bull; Synthesis Consensus &bull; Stored Risk Personalization
              </p>
            </div>
          </div>

          {/* Quick View Filter Segment */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full Single-Page Dashboard</span>
            </button>

            <button
              id="nav-tab-filings"
              onClick={() => setActiveTab("filings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "filings"
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>SEBI RAG Explorer</span>
            </button>
          </nav>

          {/* Polling & Demo Profile Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPollingActive(!isPollingActive)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isPollingActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
              title="Toggle real-time 5-second polling"
            >
              <Radio className={`w-3.5 h-3.5 ${isPollingActive ? "animate-pulse text-emerald-600" : "text-slate-400"}`} />
              <span>{isPollingActive ? `Polling in ${pollCountdown}s` : "Polling Paused"}</span>
            </button>

            <button
              id="btn-open-user-profile"
              onClick={() => setIsProfileModalOpen(true)}
              className="group flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Risk Profile</div>
                <div className="text-xs font-bold text-slate-800">
                  {userProfile.risk_tolerance}
                </div>
              </div>
              <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Live Market Ticker Tape */}
      <MarketFeedBar
        stocks={stocks}
        selectedTicker={selectedTicker}
        onSelectTicker={handleSelectTicker}
        lastUpdated={lastFeedTick}
      />

      {/* 3. Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Interactive Stock Detail Chart Hero */}
            {currentStock && (
              <StockDetailChart
                stock={currentStock}
                onRunAnalysis={() => runAgentAnalysis(selectedTicker, userProfile)}
                isAnalyzing={isAnalyzing}
              />
            )}

            {/* PANEL 1: Live Market Signals Panel */}
            <LiveMarketSignalsPanel
              stocks={stocks}
              selectedTicker={selectedTicker}
              onSelectTicker={handleSelectTicker}
              lastUpdated={lastFeedTick}
              isPolling={isPollingActive}
            />

            {/* PANEL 2: Synthesized Recommendation Panel with Expandable Reasoning Trail */}
            <SynthesizedRecommendationPanel
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={() => runAgentAnalysis(selectedTicker, userProfile)}
              onSelectFilingCitation={(citation) => {
                setActiveTab("filings");
              }}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              selectedTicker={selectedTicker}
            />

            {/* PANEL 3: User Portfolio & Watchlist Panel with Live Demo Risk Switcher */}
            <UserPortfolioPanel
              userProfile={userProfile}
              onChangeRiskTolerance={handleRiskToleranceChange}
              onSelectTicker={handleSelectTicker}
              selectedTicker={selectedTicker}
            />

            {/* PANEL 4: Performance Log Panel (3 Tracked Session Metrics) */}
            <PerformanceLogsPanel
              logs={logs}
              onRefresh={fetchLogs}
            />
          </div>
        )}

        {activeTab === "filings" && (
          <VectorFilingsExplorer
            onSelectTicker={(ticker) => {
              setSelectedTicker(ticker);
              setActiveTab("dashboard");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-700">
              Multi-Agent Financial Intelligence Architecture &bull; 24-Hour Production-Ready System
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Connected Endpoints: <span className="text-indigo-600 font-semibold">/market-data</span>,{" "}
            <span className="text-indigo-600 font-semibold">/run-analysis</span>,{" "}
            <span className="text-indigo-600 font-semibold">/user-profile</span>,{" "}
            <span className="text-indigo-600 font-semibold">/logs</span> (5s interval polling)
          </div>
        </div>
      </footer>

      {/* Stored Risk Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          if (selectedTicker) {
            runAgentAnalysis(selectedTicker, updated);
          }
        }}
      />
    </div>
  );
}
