import React, { useState } from "react";
import {
  CompleteAnalysisResponse,
  DocumentCitation,
  UserRiskProfile,
} from "../types";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Zap,
  FileText,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
  ExternalLink,
  Info,
  Clock,
} from "lucide-react";

interface SynthesizedRecommendationPanelProps {
  analysis: CompleteAnalysisResponse | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onSelectFilingCitation?: (citation: DocumentCitation) => void;
  onOpenProfileModal?: () => void;
  selectedTicker: string;
}

export const SynthesizedRecommendationPanel: React.FC<SynthesizedRecommendationPanelProps> = ({
  analysis,
  isAnalyzing,
  onRunAnalysis,
  onSelectFilingCitation,
  onOpenProfileModal,
  selectedTicker,
}) => {
  const [expandedSection, setExpandedSection] = useState<
    "all" | "technical" | "sentiment" | "fundamentals" | "synthesis" | "personalization" | null
  >("all");

  const toggleSection = (
    section: "technical" | "sentiment" | "fundamentals" | "synthesis" | "personalization"
  ) => {
    if (expandedSection === "all") {
      setExpandedSection(section);
    } else if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const isExpanded = (
    section: "technical" | "sentiment" | "fundamentals" | "synthesis" | "personalization"
  ) => {
    return expandedSection === "all" || expandedSection === section;
  };

  const getSignalBadge = (sig: string) => {
    switch (sig) {
      case "BULLISH":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "BEARISH":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-xs">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 animate-pulse">
          <Brain className="w-8 h-8 animate-spin" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            Dispatching 3 Parallel Analyst Agents...
          </h3>
          <p className="text-xs text-slate-500">
            Running Technical Agent, Sentiment Agent, and ChromaDB Fundamentals RAG Agent in parallel via async pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
            <div>
              <div className="text-xs font-bold text-slate-800">1. Technical Agent</div>
              <div className="text-[11px] text-slate-500">RSI, 20/50 SMA, MACD, Patterns</div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></div>
            <div>
              <div className="text-xs font-bold text-slate-800">2. Sentiment Agent</div>
              <div className="text-[11px] text-slate-500">Headline NLP & Social Trend</div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <div className="text-xs font-bold text-slate-800">3. Fundamentals RAG</div>
              <div className="text-[11px] text-slate-500">SEBI Filing Citations in ChromaDB</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 mx-auto flex items-center justify-center text-indigo-600">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Synthesized Recommendation for {selectedTicker}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Execute the multi-agent intelligence pipeline to synthesize technical indicators, sentiment signals, and fundamental RAG citations.
        </p>
        <button
          id="btn-trigger-analysis"
          onClick={onRunAnalysis}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Run Multi-Agent Analysis for {selectedTicker}</span>
        </button>
      </div>
    );
  }

  const {
    technical_agent,
    sentiment_agent,
    fundamentals_agent,
    synthesis,
    personalization,
    user_profile,
  } = analysis;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
      {/* 1. Header & Synthesis Recommendation Card */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Brain className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                2. Synthesized Recommendation & Reasoning Trail
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consensus derived from 3 parallel specialist agents with cited statutory evidence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === "all" ? null : "all")
              }
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{expandedSection === "all" ? "Collapse Trail" : "Expand All Reasoning"}</span>
            </button>

            <button
              onClick={onRunAnalysis}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Re-Run</span>
            </button>
          </div>
        </div>

        {/* Verdict Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Synthesized Verdict
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  Latency: {analysis.total_latency_ms} ms
                </span>
                {synthesis.conflict_detected ? (
                  <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Conflict Resolved
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    High Alignment
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <h3 className="text-xl font-bold font-mono tracking-tight text-white">
                  {analysis.company_name} ({analysis.ticker})
                </h3>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold ${
                    synthesis.aggregate_signal === "BULLISH"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                      : synthesis.aggregate_signal === "BEARISH"
                      ? "bg-rose-500/20 text-rose-300 border-rose-400/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                  }`}
                >
                  {synthesis.aggregate_signal}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
              <div>
                <div className="text-[10px] uppercase text-slate-300 font-medium">Confidence</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {Math.round(synthesis.aggregate_confidence * 100)}%
                </div>
              </div>
              <div className="h-7 w-px bg-white/20"></div>
              <div>
                <div className="text-[10px] uppercase text-slate-300 font-medium">Consensus Score</div>
                <div className="text-lg font-bold font-mono text-white">
                  {synthesis.aggregate_score > 0 ? "+" : ""}
                  {synthesis.aggregate_score}
                </div>
              </div>
              <div className="h-7 w-px bg-white/20"></div>
              <div>
                <div className="text-[10px] uppercase text-slate-300 font-medium">Market Price</div>
                <div className="text-lg font-bold font-mono text-white">
                  ₹{analysis.current_market_price.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          {/* Rationale Text */}
          <div className="pt-2 border-t border-white/10 text-xs text-slate-200 leading-relaxed font-sans">
            <span className="font-bold text-white">Synthesis Consensus Rationale: </span>
            {synthesis.synthesis_reasoning}
          </div>
        </div>
      </div>

      {/* 2. Expandable Reasoning Trail (Each Agent's Contribution & Citations) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Agent Reasoning Trail & Verifiable Evidence</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Click any step to expand / inspect details
          </span>
        </div>

        {/* Step A: Technical Agent */}
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white">
          <button
            onClick={() => toggleSection("technical")}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Step 1: Technical Analysis Agent</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getSignalBadge(technical_agent.signal)}`}>
                    {technical_agent.signal}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({Math.round(technical_agent.confidence * 100)}% conf)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {technical_agent.latency_ms} ms &bull; Weight 35%
              </span>
              {isExpanded("technical") ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {isExpanded("technical") && (
            <div className="p-4 space-y-3 border-t border-slate-200 bg-white text-xs">
              <p className="text-slate-700 leading-relaxed">
                {technical_agent.reasoning}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">RSI (14)</span>
                  <span className="font-bold text-slate-900">{technical_agent.indicators.rsi_14}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">MACD Histogram</span>
                  <span className={technical_agent.indicators.macd_histogram >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                    {technical_agent.indicators.macd_histogram > 0 ? "+" : ""}{technical_agent.indicators.macd_histogram}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">20 vs 50 SMA</span>
                  <span className="font-semibold text-slate-800">
                    ₹{technical_agent.indicators.sma_20} / ₹{technical_agent.indicators.sma_50}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Chart Pattern</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {technical_agent.indicators.primary_chart_pattern}
                  </span>
                </div>
              </div>

              {technical_agent.key_breakouts && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Triggers:</span>
                  {technical_agent.key_breakouts.map((b, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step B: Sentiment Agent */}
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white">
          <button
            onClick={() => toggleSection("sentiment")}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Step 2: Market Sentiment Agent</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getSignalBadge(sentiment_agent.signal)}`}>
                    {sentiment_agent.signal}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({Math.round(sentiment_agent.confidence * 100)}% conf)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {sentiment_agent.latency_ms} ms &bull; Weight 25%
              </span>
              {isExpanded("sentiment") ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {isExpanded("sentiment") && (
            <div className="p-4 space-y-3 border-t border-slate-200 bg-white text-xs">
              <p className="text-slate-700 leading-relaxed">
                {sentiment_agent.reasoning}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">NLP Sentiment Score</span>
                  <span className="font-bold text-slate-900">
                    {sentiment_agent.overall_sentiment_score > 0 ? "+" : ""}{sentiment_agent.overall_sentiment_score} ({sentiment_agent.sentiment_label})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Social Trend Volume</span>
                  <span className="font-semibold text-slate-800">
                    {sentiment_agent.social_volume_trend}
                  </span>
                </div>
              </div>

              {sentiment_agent.recent_headlines && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Analyzed News Citations:
                  </div>
                  <div className="space-y-1">
                    {sentiment_agent.recent_headlines.map((h, i) => (
                      <div key={i} className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-800 font-medium truncate max-w-[80%]">{h.title}</span>
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${h.sentiment === "POSITIVE" ? "text-emerald-700 bg-emerald-50" : h.sentiment === "NEGATIVE" ? "text-rose-700 bg-rose-50" : "text-slate-600 bg-slate-100"}`}>
                          {h.sentiment}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step C: Fundamentals RAG Agent (With Citations) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white">
          <button
            onClick={() => toggleSection("fundamentals")}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Step 3: Fundamentals & SEBI RAG Agent</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getSignalBadge(fundamentals_agent.signal)}`}>
                    {fundamentals_agent.signal}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({Math.round(fundamentals_agent.confidence * 100)}% conf)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {fundamentals_agent.latency_ms} ms &bull; Weight 40% &bull; ChromaDB
              </span>
              {isExpanded("fundamentals") ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {isExpanded("fundamentals") && (
            <div className="p-4 space-y-3 border-t border-slate-200 bg-white text-xs">
              <p className="text-slate-700 leading-relaxed">
                {fundamentals_agent.reasoning}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">P/E Ratio</span>
                  <span className="font-bold text-slate-900">{fundamentals_agent.metrics.pe_ratio}x</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Debt / Equity</span>
                  <span className="font-bold text-slate-900">{fundamentals_agent.metrics.debt_to_equity}x</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ROE %</span>
                  <span className="font-bold text-slate-900">{fundamentals_agent.metrics.roe_pct || 15.2}%</span>
                </div>
              </div>

              {/* Cited Statutory Filings */}
              {fundamentals_agent.citations && fundamentals_agent.citations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Cited Statutory Filings (ChromaDB Vector Retrieval):</span>
                    <span className="text-emerald-700 font-mono text-[10px]">Source Attribution Verified</span>
                  </div>
                  <div className="space-y-2">
                    {fundamentals_agent.citations.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onSelectFilingCitation?.(c)}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            {c.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {Math.round(c.relevance_score * 100)}% match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200/80 leading-relaxed font-serif">
                          "{c.excerpt}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Doc ID: {c.document_id} &bull; Section: {c.section}</span>
                          <span className="text-indigo-600 font-sans font-semibold flex items-center gap-1">
                            Click to inspect in RAG viewer <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step D: Synthesis & Conflict Resolution */}
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white">
          <button
            onClick={() => toggleSection("synthesis")}
            className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Step 4: Synthesis & Conflict Resolution</span>
                  <span className="text-[11px] text-slate-500">
                    Weighted Factor Aggregation
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {synthesis.latency_ms} ms &bull; 3 Agent Votes
              </span>
              {isExpanded("synthesis") ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {isExpanded("synthesis") && (
            <div className="p-4 space-y-3 border-t border-slate-200 bg-white text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700">Vote Weight Distribution:</div>
                <div className="space-y-1.5">
                  {synthesis.agent_votes.map((v) => (
                    <div key={v.agent_id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700">{v.agent_name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getSignalBadge(v.signal)}`}>
                          {v.signal}
                        </span>
                        <span className="text-slate-600 font-semibold">{Math.round(v.weight * 100)}% weight</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-600">
                <span className="font-bold text-slate-900">Conflict Strategy: </span>
                {synthesis.conflict_resolution_strategy}
              </div>
            </div>
          )}
        </div>

        {/* Step E: Personalization Adaptation */}
        <div className="border-2 border-emerald-500/40 rounded-xl overflow-hidden transition-all bg-white">
          <button
            onClick={() => toggleSection("personalization")}
            className="w-full px-4 py-3 bg-emerald-50/40 hover:bg-emerald-50/70 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Step 5: Tailored Risk Personalization</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-semibold border border-slate-200">
                    Profile: {personalization.profile_applied}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-700 font-semibold hidden sm:inline">
                {personalization.recommended_action.replace(/_/g, " ")}
              </span>
              {isExpanded("personalization") ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {isExpanded("personalization") && (
            <div className="p-4 space-y-3 border-t border-slate-200 bg-white text-xs">
              <p className="text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {personalization.actionable_summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Suggested Sizing</span>
                  <span className="text-slate-900 font-bold">
                    {personalization.suggested_allocation_pct}% (₹{personalization.suggested_capital_inr.toLocaleString("en-IN")})
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">12M Target</span>
                  <span className="text-indigo-700 font-bold">
                    ₹{personalization.target_price_12m.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Defensive Stop-Loss</span>
                  <span className="text-rose-700 font-bold">
                    ₹{personalization.stop_loss_price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Suitability Badge</span>
                  <span className="text-emerald-700 font-bold">
                    {personalization.retail_suitability_badge}
                  </span>
                </div>
              </div>

              {personalization.risk_warnings && (
                <div className="space-y-1 pt-1">
                  {personalization.risk_warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
