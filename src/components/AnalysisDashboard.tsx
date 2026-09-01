import React from "react";
import {
  CompleteAnalysisResponse,
  UserRiskProfile,
  DocumentCitation,
} from "../types";
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Scale,
  Brain,
  Shield,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from "lucide-react";

interface AnalysisDashboardProps {
  analysis: CompleteAnalysisResponse | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onSelectFilingCitation?: (citation: DocumentCitation) => void;
  onOpenProfileModal: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  isAnalyzing,
  onRunAnalysis,
  onSelectFilingCitation,
  onOpenProfileModal,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 animate-pulse">
          <Brain className="w-8 h-8 animate-spin" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Running 3 Parallel Analyst Agents...</h3>
          <p className="text-xs text-slate-500">
            Dispatching Technical Agent, Sentiment Agent, and Fundamentals RAG Agent via async tasks.
          </p>
        </div>

        {/* Parallel Agent Progress Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
            <div>
              <div className="text-xs font-bold text-slate-800">1. Technical Agent</div>
              <div className="text-[11px] text-slate-500">Computing RSI, SMA, MACD, Patterns</div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></div>
            <div>
              <div className="text-xs font-bold text-slate-800">2. Sentiment Agent</div>
              <div className="text-[11px] text-slate-500">Analyzing headlines & social volume</div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <div className="text-xs font-bold text-slate-800">3. Fundamentals RAG</div>
              <div className="text-[11px] text-slate-500">ChromaDB vector query over SEBI docs</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 mx-auto flex items-center justify-center text-indigo-600">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Multi-Agent Analysis Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Click the button below to trigger the 3 parallel agents, synthesis consensus resolution, and personalized risk profiling.
        </p>
        <button
          onClick={onRunAnalysis}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          Run Analysis on Selected Stock
        </button>
      </div>
    );
  }

  const { technical_agent, sentiment_agent, fundamentals_agent, synthesis, personalization, user_profile } = analysis;

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

  return (
    <div className="space-y-6">
      {/* 1. TOP SYNTHESIS & CONSENSUS HERO CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                Synthesis Agent Consensus
              </span>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Pipeline Latency: {analysis.total_latency_ms} ms
              </span>
              {synthesis.conflict_detected ? (
                <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Conflict Detected & Resolved
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  High Agent Alignment
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <span>{analysis.company_name} ({analysis.ticker})</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold ${getSignalBadge(synthesis.aggregate_signal)}`}>
                {synthesis.aggregate_signal}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Consensus Score</div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {synthesis.aggregate_score > 0 ? "+" : ""}
                {synthesis.aggregate_score}
                <span className="text-xs text-slate-500 font-normal"> / 1.0</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Confidence</div>
              <div className="text-lg font-bold font-mono text-emerald-700">
                {Math.round(synthesis.aggregate_confidence * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Synthesis Reasoning & Conflict Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="md:col-span-2 space-y-2">
            <div className="text-slate-700 leading-relaxed font-sans">
              <span className="font-bold text-slate-900">Consensus Rationale: </span>
              {synthesis.synthesis_reasoning}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="text-indigo-600 font-semibold">Resolution Strategy:</span>
              <span className="text-slate-700">{synthesis.conflict_resolution_strategy}</span>
            </div>
          </div>

          {/* Voting Weights */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-700">Agent Vote Distribution</div>
            {synthesis.agent_votes.map((v) => (
              <div key={v.agent_id} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 truncate max-w-[120px]">{v.agent_name.replace(" Agent", "")}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${getSignalBadge(v.signal)}`}>{v.signal}</span>
                  <span className="text-slate-700 font-semibold">{Math.round(v.weight * 100)}% wt</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. THE 3 PARALLEL ANALYST AGENTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Parallel Analyst Agent Breakdown
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Executed Asynchronously (asyncio.gather)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* A. Technical Agent Card */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Technical Agent</h4>
                    <span className="text-[10px] text-slate-500">{technical_agent.latency_ms} ms</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getSignalBadge(technical_agent.signal)}`}>
                    {technical_agent.signal}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {Math.round(technical_agent.confidence * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {technical_agent.reasoning}
              </p>

              {/* Indicator Pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">RSI (14)</span>
                  <span className="text-slate-800 font-bold">{technical_agent.indicators.rsi_14}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MACD Histogram</span>
                  <span className={technical_agent.indicators.macd_histogram >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                    {technical_agent.indicators.macd_histogram > 0 ? "+" : ""}{technical_agent.indicators.macd_histogram}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">20-SMA / 50-SMA</span>
                  <span className="text-slate-800 font-semibold">₹{technical_agent.indicators.sma_20} / ₹{technical_agent.indicators.sma_50}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Pattern</span>
                  <span className="text-slate-800 font-semibold truncate block">{technical_agent.indicators.primary_chart_pattern}</span>
                </div>
              </div>
            </div>

            {/* Breakout list */}
            {technical_agent.key_breakouts && technical_agent.key_breakouts.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Key Triggers</div>
                <div className="flex flex-wrap gap-1">
                  {technical_agent.key_breakouts.map((b, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* B. Sentiment Agent Card */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Sentiment Agent</h4>
                    <span className="text-[10px] text-slate-500">{sentiment_agent.latency_ms} ms</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getSignalBadge(sentiment_agent.signal)}`}>
                    {sentiment_agent.signal}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {Math.round(sentiment_agent.confidence * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {sentiment_agent.reasoning}
              </p>

              {/* Sentiment Score Metric */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">NLP Sentiment Score</span>
                  <span className="text-slate-900 font-bold">
                    {sentiment_agent.overall_sentiment_score > 0 ? "+" : ""}{sentiment_agent.overall_sentiment_score} ({sentiment_agent.sentiment_label})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Social Trend</span>
                  <span className="text-slate-700 font-semibold text-[11px]">{sentiment_agent.social_volume_trend.split(",")[0]}</span>
                </div>
              </div>

              {/* Headlines Feed */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Analyzed News Headlines</div>
                {sentiment_agent.recent_headlines?.slice(0, 2).map((h, i) => (
                  <div key={i} className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-0.5">
                    <div className="text-slate-800 font-medium line-clamp-1">{h.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{h.source} &bull; {h.time_ago}</span>
                      <span className={`font-mono font-bold ${h.sentiment === "POSITIVE" ? "text-emerald-600" : h.sentiment === "NEGATIVE" ? "text-rose-600" : "text-slate-600"}`}>
                        {h.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* C. Fundamentals & RAG Agent Card */}
          <div className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Fundamentals & RAG Agent</h4>
                    <span className="text-[10px] text-slate-500">{fundamentals_agent.latency_ms} ms &bull; ChromaDB</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getSignalBadge(fundamentals_agent.signal)}`}>
                    {fundamentals_agent.signal}
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {Math.round(fundamentals_agent.confidence * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {fundamentals_agent.reasoning}
              </p>

              {/* Fundamental Ratios */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">P/E Ratio</span>
                  <span className="text-slate-900 font-bold">{fundamentals_agent.metrics.pe_ratio}x</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Debt/Equity</span>
                  <span className="text-slate-900 font-bold">{fundamentals_agent.metrics.debt_to_equity}x</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ROE</span>
                  <span className="text-slate-900 font-bold">{fundamentals_agent.metrics.roe_pct || 15.2}%</span>
                </div>
              </div>

              {/* ChromaDB RAG Citations */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
                  <span>SEBI Statutory RAG Citation</span>
                  <span className="text-emerald-700 font-mono font-semibold">Chroma Match</span>
                </div>
                {fundamentals_agent.citations?.slice(0, 1).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectFilingCitation?.(c)}
                    className="cursor-pointer group bg-slate-50 hover:bg-indigo-50/60 p-2.5 rounded-lg border border-slate-200 transition-all text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      <span className="truncate">{c.title}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold shrink-0 ml-1">
                        {Math.round(c.relevance_score * 100)}% match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                      "{c.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONALIZATION LAYER CARD */}
      <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 lg:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Personalization Layer (Tailored Retail Execution)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  Profile: {personalization.profile_applied}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Adjusts multi-agent synthesis based on your stored investment horizon, risk tolerance, and max cap.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenProfileModal}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 underline underline-offset-4 cursor-pointer"
          >
            Adjust Risk Profile
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Recommended Retail Action</span>
            <div className="text-sm font-bold font-mono text-emerald-700 flex items-center gap-1">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>{personalization.recommended_action.replace(/_/g, " ")}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Suitability: <span className="font-bold text-slate-700">{personalization.retail_suitability_badge}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Suggested Allocation</span>
            <div className="text-base font-bold font-mono text-slate-900">
              {personalization.suggested_allocation_pct}%{" "}
              <span className="text-xs text-slate-500 font-normal">
                (₹{personalization.suggested_capital_inr.toLocaleString("en-IN")})
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              Budget: ₹{user_profile.monthly_budget_inr.toLocaleString("en-IN")} / mo
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Target Price (12M)</span>
            <div className="text-base font-bold font-mono text-indigo-700 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
              <span>₹{personalization.target_price_12m.toLocaleString("en-IN")}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Upside: +{Math.round(((personalization.target_price_12m - analysis.current_market_price) / analysis.current_market_price) * 100)}%
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Stop Loss Defense</span>
            <div className="text-base font-bold font-mono text-rose-700 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              <span>₹{personalization.stop_loss_price.toLocaleString("en-IN")}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Risk buffer: -{Math.round(((analysis.current_market_price - personalization.stop_loss_price) / analysis.current_market_price) * 100)}%
            </div>
          </div>
        </div>

        {/* Personalized Guidance Text & Steps */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
          <p className="text-slate-800 leading-relaxed font-medium">
            {personalization.actionable_summary}
          </p>

          {personalization.implementation_steps && personalization.implementation_steps.length > 0 && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Step-by-Step Retail Execution Checklist:
              </div>
              <ul className="space-y-1">
                {personalization.implementation_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
