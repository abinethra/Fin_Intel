export type AgentSignal = "BULLISH" | "BEARISH" | "NEUTRAL";
export type RiskTolerance = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";
export type InvestmentHorizon = "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";

export interface PortfolioHolding {
  ticker: string;
  name: string;
  shares: number;
  avg_buy_price: number;
  current_price: number;
  current_value_inr: number;
  weight_pct: number;
  pnl_amount_inr: number;
  pnl_pct: number;
  sector: string;
}

export interface StockQuote {
  ticker: string;
  name: string;
  sector: string;
  current_price: number;
  open: number;
  high: number;
  low: number;
  prev_close: number;
  change: number;
  change_pct: number;
  volume: number;
  beta: number;
  signal: AgentSignal;
  confidence: number;
  catalyst?: string;
  history?: Array<{
    date: string;
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface UserRiskProfile {
  user_id: string;
  risk_tolerance: RiskTolerance;
  investment_horizon: InvestmentHorizon;
  max_portfolio_allocation_pct: number;
  capital_preservation_priority: boolean;
  monthly_budget_inr: number;
  preferred_sectors: string[];
  holdings?: PortfolioHolding[];
  portfolio_concentration?: {
    holdings: Record<string, number>;
    sector_exposure: Record<string, number>;
    target_stock_weight_pct?: number;
    target_sector?: string;
    target_sector_weight_pct?: number;
  };
}

export interface TechnicalIndicators {
  current_price: number;
  rsi_14: number;
  rsi_signal: string;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  macd_line: number;
  macd_signal_line: number;
  macd_histogram: number;
  macd_interpretation: string;
  bollinger_upper: number;
  bollinger_lower: number;
  support_level: number;
  resistance_level: number;
  volume_surge_ratio: number;
  primary_chart_pattern: string;
}

export interface TechnicalAgentOutput {
  agent_id: string;
  agent_name: string;
  ticker: string;
  signal: AgentSignal;
  confidence: number;
  reasoning: string;
  latency_ms: number;
  indicators: TechnicalIndicators;
  key_breakouts: string[];
  timeframe: string;
}

export interface HeadlineItem {
  title: string;
  source: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentiment_score: number;
  time_ago: string;
}

export interface SentimentAgentOutput {
  agent_id: string;
  agent_name: string;
  ticker: string;
  signal: AgentSignal;
  confidence: number;
  reasoning: string;
  latency_ms: number;
  overall_sentiment_score: number;
  sentiment_label: string;
  bullish_factors: string[];
  bearish_factors: string[];
  recent_headlines: HeadlineItem[];
  social_volume_trend: string;
}

export interface DocumentCitation {
  id: string;
  ticker: string;
  title: string;
  source: string;
  period: string;
  relevance_score: number;
  excerpt: string;
  engine?: string;
}

export interface FundamentalMetrics {
  pe_ratio: number;
  pb_ratio?: number;
  debt_to_equity: number;
  roe_pct?: number;
  revenue_growth_yoy?: number;
  ebitda_margin_pct?: number;
  valuation_status: string;
  solvency_risk: string;
}

export interface FundamentalsAgentOutput {
  agent_id: string;
  agent_name: string;
  ticker: string;
  signal: AgentSignal;
  confidence: number;
  reasoning: string;
  latency_ms: number;
  metrics: FundamentalMetrics;
  citations: DocumentCitation[];
  governance_score: number;
  earnings_quality: string;
}

export interface AgentVote {
  agent_id: string;
  agent_name: string;
  signal: string;
  confidence: number;
  weight: number;
  score_contribution: number;
}

export interface SynthesisOutput {
  agent_id: string;
  agent_name: string;
  ticker: string;
  aggregate_signal: AgentSignal;
  aggregate_score: number;
  aggregate_confidence: number;
  conflict_detected: boolean;
  conflict_summary: string;
  conflict_resolution_strategy: string;
  agent_votes: AgentVote[];
  synthesis_reasoning: string;
  latency_ms: number;
}

export interface PersonalizationOutput {
  user_id: string;
  ticker: string;
  profile_applied: string;
  recommended_action: string;
  suggested_allocation_pct: number;
  suggested_capital_inr: number;
  stop_loss_price: number;
  target_price_12m: number;
  risk_alignment_score: number;
  actionable_summary: string;
  retail_suitability_badge: string;
  risk_warnings: string[];
  implementation_steps: string[];
  latency_ms: number;
}

export interface CompleteAnalysisResponse {
  ticker: string;
  company_name: string;
  timestamp: string;
  execution_mode: string;
  total_latency_ms: number;
  current_market_price: number;
  change_pct: number;
  technical_agent: TechnicalAgentOutput;
  sentiment_agent: SentimentAgentOutput;
  fundamentals_agent: FundamentalsAgentOutput;
  synthesis: SynthesisOutput;
  personalization: PersonalizationOutput;
  user_profile: UserRiskProfile;
}

export interface SignalAccuracyRecord {
  id: string;
  ticker: string;
  date_generated: string;
  agent_signal: string;
  synthesis_confidence: number;
  price_at_signal: number;
  forward_price_5d: number;
  forward_return_5d_pct: number;
  is_accurate: boolean;
  alpha_generated_pct: number;
}

export interface LatencyRecord {
  timestamp: string;
  ticker: string;
  technical_ms: number;
  sentiment_ms: number;
  fundamentals_ms: number;
  synthesis_ms: number;
  personalization_ms: number;
  total_pipeline_ms: number;
}

export interface PerformanceLogsResponse {
  signal_performance: {
    win_rate_pct: number;
    total_signals_tracked: number;
    verified_signals: number;
    average_alpha_vs_benchmark_pct: number;
    profit_factor: number;
    history: SignalAccuracyRecord[];
  };
  agent_latency_profile: {
    average_total_pipeline_ms: number;
    breakdown_ms: {
      technical_agent: number;
      sentiment_agent: number;
      fundamentals_rag_agent: number;
      synthesis_conflict_agent: number;
    };
    recent_logs: LatencyRecord[];
  };
  portfolio_risk: {
    hhi_score: number;
    concentration_category: string;
    risk_label: string;
    top_holding: { ticker: string; weight_pct: number };
    top_sector: { sector: string; weight_pct: number };
    sector_breakdown: Record<string, number>;
    effective_number_of_bets: number;
    portfolio_beta: number;
    recommended_rebalance: boolean;
  };
}

export interface FilingDocument {
  id: string;
  ticker: string;
  title: string;
  source: string;
  period: string;
  content: string;
  metrics?: Record<string, any>;
  relevance_score?: number;
}
