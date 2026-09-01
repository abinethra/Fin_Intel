"""
app.py - Streamlit Interactive Dashboard for Multi-Agent Investment Intelligence

Enables live stock analysis, risk profile switching, cited document inspector,
conflict resolution trace viewer, and latency telemetry benchmarks.
"""

try:
    import streamlit as st
    STREAMLIT_AVAILABLE = True
except ImportError:
    STREAMLIT_AVAILABLE = False

import json
import time
from agents import run_multi_agent_pipeline
from db import get_user_profile, save_user_profile, get_performance_logs


def main():
    if not STREAMLIT_AVAILABLE:
        print("Streamlit not installed. To run GUI: pip install streamlit && streamlit run app.py")
        print("To run CLI multi-agent demo directly: python agents.py")
        return

    st.set_page_config(
        page_title="Multi-Agent Investment Intelligence",
        page_icon="📈",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.title("🛡️ Multi-Agent Retail Investment Intelligence MVP")
    st.caption("Parallel AI Agents • Grounded ChromaDB RAG • Conflict Resolution • Personalization Layer")

    # --- Sidebar: User Profile Config ---
    st.sidebar.header("👤 Retail Investor Profile")
    risk_tier = st.sidebar.selectbox("Risk Tolerance", ["CONSERVATIVE", "MODERATE", "AGGRESSIVE"], index=1)
    horizon = st.sidebar.selectbox("Investment Horizon", ["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"], index=1)
    alloc_cap = st.sidebar.slider("Max Single-Stock Cap (%)", 2.0, 30.0, 15.0, 0.5)
    monthly_budget = st.sidebar.number_input("Monthly Investable Capital (INR)", min_value=5000, value=100000, step=5000)
    capital_preserve = st.sidebar.checkbox("Strict Capital Preservation Priority", value=(risk_tier == "CONSERVATIVE"))

    profile = {
        "user_id": f"web_{risk_tier.lower()}",
        "risk_tolerance": risk_tier,
        "investment_horizon": horizon,
        "max_portfolio_allocation_pct": alloc_cap,
        "monthly_budget_inr": monthly_budget,
        "capital_preservation_priority": capital_preserve
    }
    save_user_profile(profile)

    # --- Main Analysis Section ---
    col1, col2 = st.columns([3, 1])
    with col1:
        ticker = st.selectbox("Select Target Asset", ["RELIANCE", "TCS", "HDFCBANK", "TATAMOTORS", "INFY", "AAPL", "NVDA"], index=0)
    with col2:
        st.write("")
        st.write("")
        run_btn = st.button("🚀 Run Multi-Agent Analysis", use_container_width=True, type="primary")

    if run_btn or "last_run" not in st.session_state:
        with st.spinner(f"Executing parallel agents for {ticker}..."):
            res = run_multi_agent_pipeline(ticker, user_id=f"web_{risk_tier.lower()}")
            st.session_state["last_run"] = res

    res = st.session_state["last_run"]
    synth = res["synthesis"]
    tech = res["technical"]
    sent = res["sentiment"]
    fund = res["fundamentals"]

    st.markdown("---")

    # --- Executive Consensus Banner ---
    st.subheader("🎯 Executive Synthesis Consensus")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Final Personalized Action", synth["final_recommendation"].upper())
    c2.metric("Synthesis Confidence", f"{int(synth['overall_confidence'] * 100)}%")
    c3.metric("Agent Agreement", synth["agent_agreement"].upper())
    c4.metric("Pipeline Latency", f"{res['total_latency_ms']} ms")

    # Personalization Card
    p_action = synth["personalized_action"]
    st.info(
        f"**Personalized Risk Constraints Applied ({risk_tier}):** "
        f"Position Sizing: **{p_action['suggested_weight_pct']}%** (₹{p_action['suggested_inr_commitment']:,}) • "
        f"Trailing Stop Loss: **{p_action['trailing_stop_loss_pct']}%** • "
        f"*{p_action['risk_rationale']}*"
    )

    # --- 3 Agent Columns ---
    st.markdown("### 🤖 Parallel Analyst Agents")
    a_col1, a_col2, a_col3 = st.columns(3)

    with a_col1:
        st.markdown("#### 📊 Technical Agent")
        st.write(f"**Signal:** `{tech['signal'].upper()}` ({int(tech['confidence']*100)}% conf)")
        st.write(f"- RSI(14): `{tech['indicators'].get('rsi', 'N/A')}`")
        st.write(f"- MA Cross: `{tech['indicators'].get('ma_cross', {}).get('status', 'N/A')}`")
        st.caption(tech["reasoning"])

    with a_col2:
        st.markdown("#### 📰 Sentiment Agent")
        st.write(f"**Score:** `{sent['sentiment_score']:+.2f}` ({int(sent['confidence']*100)}% conf)")
        st.write(f"- Key Drivers: {', '.join(sent['key_phrases']) if sent['key_phrases'] else 'None'}")
        st.caption(sent["reasoning"])

    with a_col3:
        st.markdown("#### 🏛️ Fundamentals RAG")
        st.write(f"**View:** `{fund['view'].upper()}` ({int(fund['confidence']*100)}% conf)")
        st.caption(fund["reasoning"])
        if fund.get("cited_sources"):
            st.write(f"- **Cited:** `{fund['cited_sources'][0]['source']}`")

    # --- Step-by-Step Reasoning Chain ---
    st.markdown("---")
    st.subheader("🔍 Transparent Reasoning Chain & Conflict Resolution")
    for idx, step in enumerate(synth["reasoning_chain"]):
        st.markdown(f"**{idx + 1}.** {step}")

    # --- Grounded Citations ---
    st.markdown("---")
    st.subheader("📚 Grounded Statutory Filings (ChromaDB RAG Citations)")
    if synth["cited_sources"]:
        for src in synth["cited_sources"]:
            with st.expander(f"📄 {src['source']}"):
                st.write(src["excerpt"])
    else:
        st.warning("No statutory evidence cited for this query.")

    # --- Latency & Audit Logs ---
    st.markdown("---")
    st.subheader("⚡ Performance Telemetry")
    t_col1, t_col2 = st.columns([1, 2])
    with t_col1:
        st.json(res["latencies_ms"])
    with t_col2:
        logs = get_performance_logs()
        st.write(f"**Verified Signals Win Rate:** `{logs['win_rate_pct']}%`")
        st.write(f"**Portfolio Risk Concentration (HHI Score):** `{logs['current_hhi_score']} / 10,000` (Diversified)")
        st.write(f"**Avg Total Multi-Agent Pipeline Latency:** `{logs['avg_pipeline_latency_ms']} ms`")


if __name__ == "__main__":
    main()
