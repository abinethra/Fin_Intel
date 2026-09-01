"""Standalone CLI Test Pipeline for the Multi-Agent Financial Intelligence System.

Executes:
1. Parallel execution of Technical, Sentiment, and Fundamentals RAG Agents
2. Synthesis consensus & conflict resolution
3. Dynamic personalization testing (CONSERVATIVE vs AGGRESSIVE profiles)
4. Telemetry logging to SQLite and metrics verification
"""
import asyncio
import json
import time

try:
    from backend.agents.base import UserRiskProfile, RiskTolerance, InvestmentHorizon
    from backend.agents.technical_agent import run_technical_agent
    from backend.agents.sentiment_agent import run_sentiment_agent
    from backend.agents.fundamentals_rag_agent import run_fundamentals_agent
    from backend.agents.synthesis_agent import run_synthesis_agent
    from backend.agents.personalization_agent import run_personalization_agent
    from backend.market_data.feed import market_feed_instance
    from backend.logging_module.performance_logger import performance_logger_instance
except ImportError:
    # Direct execution within backend directory
    from agents.base import UserRiskProfile, RiskTolerance, InvestmentHorizon
    from agents.technical_agent import run_technical_agent
    from agents.sentiment_agent import run_sentiment_agent
    from agents.fundamentals_rag_agent import run_fundamentals_agent
    from agents.synthesis_agent import run_synthesis_agent
    from agents.personalization_agent import run_personalization_agent
    from market_data.feed import market_feed_instance
    from logging_module.performance_logger import performance_logger_instance


async def main():
    ticker = "RELIANCE"
    print("=" * 70)
    print(f"🚀 RUNNING MULTI-AGENT FINANCIAL INTELLIGENCE PIPELINE FOR {ticker}")
    print("=" * 70)

    # 1. Fetch live simulated stock snapshot
    snapshot = market_feed_instance.get_stock_data(ticker)
    print(f"📊 Market Snapshot: {snapshot['name']} | Price: ₹{snapshot['current_price']} ({snapshot['change_pct']}%)")
    print("-" * 70)

    # 2. Parallel Async Execution of 3 Analyst Agents
    print("⚡ [Phase 1] Executing 3 Specialist Analyst Agents Concurrently...")
    start_time = time.perf_counter()

    tech_task = asyncio.create_task(run_technical_agent(ticker, snapshot))
    sent_task = asyncio.create_task(run_sentiment_agent(ticker, snapshot))
    fund_task = asyncio.create_task(run_fundamentals_agent(ticker, snapshot))

    tech_out, sent_out, fund_out = await asyncio.gather(tech_task, sent_task, fund_task)
    parallel_ms = round((time.perf_counter() - start_time) * 1000, 2)

    print(f"  ✓ 1. Technical Agent:    Signal = {tech_out['signal']:<8} (Conf: {int(tech_out['confidence']*100)}%) [{tech_out['latency_ms']} ms]")
    print(f"  ✓ 2. Sentiment Agent:    Signal = {sent_out['signal']:<8} (Conf: {int(sent_out['confidence']*100)}%) [{sent_out['latency_ms']} ms]")
    print(f"  ✓ 3. Fundamentals RAG:   Signal = {fund_out['signal']:<8} (Conf: {int(fund_out['confidence']*100)}%) [{fund_out['latency_ms']} ms]")
    print(f"  ⚡ Async Parallel Total: {parallel_ms} ms")
    print("-" * 70)

    # 3. Synthesis & Conflict Resolution
    print("🧠 [Phase 2] Executing Synthesis Agent (Conflict Resolution & Consensus)...")
    synthesis_out = await run_synthesis_agent(ticker, tech_out, sent_out, fund_out)
    print(f"  ★ Consensus Verdict:     {synthesis_out['aggregate_signal']} (Score: {synthesis_out['aggregate_score']}, Conf: {int(synthesis_out['aggregate_confidence']*100)}%)")
    print(f"  ★ Rationale:             {synthesis_out['synthesis_reasoning']}")
    print("-" * 70)

    # 4. Personalization Layer: Compare Profiles
    print("🛡️ [Phase 3] Testing Dynamic Retail Personalization Engine...")
    
    # Profile A: Conservative
    conservative_profile = UserRiskProfile(
        user_id="demo_conservative",
        risk_tolerance=RiskTolerance.CONSERVATIVE,
        investment_horizon=InvestmentHorizon.MEDIUM_TERM,
        max_portfolio_allocation_pct=8.0,
        capital_preservation_priority=True,
        monthly_budget_inr=50000.0,
        preferred_sectors=["Energy", "Banking"]
    )
    pers_conservative = await run_personalization_agent(ticker, synthesis_out, conservative_profile, snapshot)

    # Profile B: Aggressive
    aggressive_profile = UserRiskProfile(
        user_id="demo_aggressive",
        risk_tolerance=RiskTolerance.AGGRESSIVE,
        investment_horizon=InvestmentHorizon.LONG_TERM,
        max_portfolio_allocation_pct=25.0,
        capital_preservation_priority=False,
        monthly_budget_inr=50000.0,
        preferred_sectors=["Technology", "Automobile"]
    )
    pers_aggressive = await run_personalization_agent(ticker, synthesis_out, aggressive_profile, snapshot)

    print(f"  [CONSERVATIVE PROFILE]")
    print(f"    • Action:      {pers_conservative['recommended_action']}")
    print(f"    • Allocation:  {pers_conservative['suggested_allocation_pct']}% (₹{pers_conservative['suggested_capital_inr']:,})")
    print(f"    • Stop-Loss:   ₹{pers_conservative['stop_loss_price']:,}")
    print(f"    • Summary:     {pers_conservative['actionable_summary']}")

    print(f"\n  [AGGRESSIVE PROFILE]")
    print(f"    • Action:      {pers_aggressive['recommended_action']}")
    print(f"    • Allocation:  {pers_aggressive['suggested_allocation_pct']}% (₹{pers_aggressive['suggested_capital_inr']:,})")
    print(f"    • Target 12M:  ₹{pers_aggressive['target_price_12m']:,}")
    print(f"    • Summary:     {pers_aggressive['actionable_summary']}")
    print("-" * 70)

    # 5. Performance Logger Metrics
    print("📈 [Phase 4] Session Performance & Risk Telemetry...")
    performance_logger_instance.log_analysis_execution(
        ticker=ticker,
        tech_ms=tech_out["latency_ms"],
        sent_ms=sent_out["latency_ms"],
        fund_ms=fund_out["latency_ms"],
        synth_ms=synthesis_out["latency_ms"],
        pers_ms=pers_conservative["latency_ms"],
        total_ms=parallel_ms + synthesis_out["latency_ms"] + pers_conservative["latency_ms"],
        synthesis_signal=synthesis_out["aggregate_signal"],
        confidence=synthesis_out["aggregate_confidence"],
        current_price=snapshot["current_price"]
    )

    metrics = performance_logger_instance.get_summary_metrics()
    print(f"  • Signal Accuracy Win Rate: {metrics['signal_performance']['win_rate_pct']}% (Benchmark Alpha: +{metrics['signal_performance']['average_alpha_vs_benchmark_pct']}%)")
    print(f"  • Average Pipeline Latency:  {metrics['agent_latency_profile']['average_total_pipeline_ms']} ms")
    print(f"  • Portfolio Risk HHI Score:  {metrics['portfolio_risk']['hhi_score']} / 10,000 ({metrics['portfolio_risk']['concentration_category']})")
    print("=" * 70)
    print("✅ TEST PIPELINE RUN COMPLETED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(main())
