import React, { useState, useEffect } from "react";
import {
  StockQuote,
  CompleteAnalysisResponse,
  UserRiskProfile,
  DocumentCitation,
} from "./types";
import { Navbar } from "./components/Navbar";
import { MarketFeedBar } from "./components/MarketFeedBar";
import { StockDetailChart } from "./components/StockDetailChart";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { VectorFilingsExplorer } from "./components/VectorFilingsExplorer";
import { PerformanceLogsView } from "./components/PerformanceLogsView";
import { UserProfileModal } from "./components/UserProfileModal";
import { Bot, Layers, Sparkles, TrendingUp, ShieldAlert, Cpu } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"analysis" | "market" | "filings" | "logs">("analysis");
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("RELIANCE");
  const [currentStock, setCurrentStock] = useState<StockQuote | null>(null);
  const [analysis, setAnalysis] = useState<CompleteAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [lastFeedTick, setLastFeedTick] = useState<string>("");

  const [userProfile, setUserProfile] = useState<UserRiskProfile>({
    user_id: "user_retail_01",
    risk_tolerance: "MODERATE",
    investment_horizon: "MEDIUM_TERM",
    max_portfolio_allocation_pct: 15.0,
    capital_preservation_priority: false,
    monthly_budget_inr: 50000.0,
    preferred_sectors: ["Technology", "Banking", "Energy", "Automobile"],
  });

  // 1. Initial Data Fetch: User Profile & Market Overview
  useEffect(() => {
    fetchUserProfile();
    fetchMarketOverview();
    // Start market feed tick polling every 4 seconds
    const interval = setInterval(() => {
      fetchMarketOverview(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch specific stock data whenever selectedTicker changes
  useEffect(() => {
    if (selectedTicker) {
      fetchStockDetails(selectedTicker);
      runAgentAnalysis(selectedTicker);
    }
  }, [selectedTicker]);

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

  const fetchMarketOverview = async (updateSelectedStock = true) => {
    try {
      const res = await fetch("/market-data");
      if (res.ok) {
        const data = await res.json();
        if (data.stocks && Array.isArray(data.stocks)) {
          setStocks(data.stocks);
          setLastFeedTick(data.timestamp);
          if (updateSelectedStock && !currentStock) {
            const defaultStock = data.stocks.find((s: StockQuote) => s.ticker === selectedTicker) || data.stocks[0];
            if (defaultStock) {
              fetchStockDetails(defaultStock.ticker);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching market data feed:", err);
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
      console.error(`Error fetching details for ${ticker}:`, err);
    }
  };

  const runAgentAnalysis = async (ticker = selectedTicker) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          user_id: userProfile.user_id,
          custom_profile: userProfile,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error(`Error running multi-agent analysis for ${ticker}:`, err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        selectedTicker={selectedTicker}
      />

      {/* Simulated Live Market Ticker Tape */}
      <MarketFeedBar
        stocks={stocks}
        selectedTicker={selectedTicker}
        onSelectTicker={handleSelectTicker}
        lastUpdated={lastFeedTick}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === "analysis" && (
          <div className="space-y-6">
            {/* Top Row: Stock Chart and Summary */}
            {currentStock && (
              <StockDetailChart
                stock={currentStock}
                onRunAnalysis={() => runAgentAnalysis(selectedTicker)}
                isAnalyzing={isAnalyzing}
              />
            )}

            {/* Core Multi-Agent Dashboard */}
            <AnalysisDashboard
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={() => runAgentAnalysis(selectedTicker)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onSelectFilingCitation={(citation) => {
                setActiveTab("filings");
              }}
            />
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-6">
            {currentStock && (
              <StockDetailChart
                stock={currentStock}
                onRunAnalysis={() => {
                  setActiveTab("analysis");
                  runAgentAnalysis(selectedTicker);
                }}
                isAnalyzing={isAnalyzing}
              />
            )}

            {/* Market Universe Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Simulated Equities Universe (8 Equities)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time stochastic Brownian motion feed with dynamic spreads & volume surges.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                  Feed Active (FastAPI /market-data)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stocks.map((stock) => {
                  const isPositive = stock.change >= 0;
                  const isSelected = selectedTicker === stock.ticker;

                  return (
                    <div
                      key={stock.ticker}
                      onClick={() => {
                        setSelectedTicker(stock.ticker);
                        setActiveTab("analysis");
                      }}
                      className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-slate-900">{stock.ticker}</span>
                        <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          Beta {stock.beta}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{stock.name}</div>
                      <div className="flex items-baseline justify-between pt-1 font-mono">
                        <div className="text-base font-bold text-slate-900">
                          ₹{stock.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? "+" : ""}{stock.change_pct}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "filings" && (
          <VectorFilingsExplorer
            onSelectTicker={(ticker) => {
              setSelectedTicker(ticker);
              setActiveTab("analysis");
            }}
          />
        )}

        {activeTab === "logs" && <PerformanceLogsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium text-slate-700">Multi-Agent Financial Intelligence System &bull; 24-Hour Hackathon MVP</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            FastAPI Endpoints: <span className="text-indigo-600 font-semibold">/market-data</span>, <span className="text-indigo-600 font-semibold">/run-analysis</span>, <span className="text-indigo-600 font-semibold">/user-profile</span>, <span className="text-indigo-600 font-semibold">/logs</span>
          </div>
        </div>
      </footer>

      {/* User Risk Profile Configuration Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(updated) => {
          setUserProfile(updated);
          if (selectedTicker) {
            runAgentAnalysis(selectedTicker);
          }
        }}
      />
    </div>
  );
}
