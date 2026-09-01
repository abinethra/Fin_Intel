# 🛡️ Multi-Agent Retail Investment Intelligence System

A production-grade multi-agent financial intelligence system designed to protect retail investors from emotional decision-making, information overload, and ungrounded AI hallucinations.

---

## 🏛️ System Architecture

```
                                  [ Market Data / User Input ]
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        ▼                      ▼                      ▼
               ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
               │ Technical Agent │   │ Sentiment Agent  │   │ Fundamentals RAG │
               │ (RSI, MA Cross, │   │ (News Stream NLP,│   │ (Local ChromaDB, │
               │ Volume Anomaly) │   │ Key Phrases)     │   │ Statutory Filings│
               └────────┬────────┘   └────────┬─────────┘   └────────┬─────────┘
                        │                     │                      │
                        └─────────────────────┼──────────────────────┘
                                               ▼
                                  ┌───────────────────────────┐
                                  │   Synthesis Consensus     │
                                  │   Conflict Resolution     │
                                  │   (Fundamentals Priority) │
                                  └────────────┬──────────────┘
                                               │
                                               ▼
                                  ┌───────────────────────────┐
                                  │   Personalization Layer   │
                                  │   (SQLite Risk Profile &  │
                                  │   Capital Preservation)   │
                                  └────────────┬──────────────┘
                                               │
                                               ▼
                             [ Transparent Synthesized Output ]
                             • Final Action (Buy / Hold / Avoid)
                             • Suggested Sizing (%) & ₹ Budget
                             • Trailing Stop-Loss (%)
                             • Grounded Citations & Audit Trail
```

---

## 📁 Repository Structure

| File | Purpose |
|---|---|
| **`backend/agents.py`** | Core multi-agent pipeline. Orchestrates Technical, Sentiment, Fundamentals, and Synthesis agents. Run standalone with `python backend/agents.py`. |
| **`backend/data_feed.py`** | Live price/volume ingestion with synthetic historical fallback (Requirement #8: Graceful Degradation). |
| **`backend/rag.py`** | Local ChromaDB vector store. Embeds SEBI statutory filings with strict metadata and source citation trails. |
| **`backend/db.py`** | SQLite storage for retail investor risk profiles, session logs, per-agent latency telemetry, and HHI portfolio concentration score. |
| **`backend/app.py`** | Streamlit interactive UI. Allows selecting tickers, editing risk profiles, viewing conflict chains, and inspecting citations. |
| **`src/` & `server.ts`** | React + TypeScript + Tailwind full-stack web application interface. |

---

## 🚀 Quick Start Guide

### 1. Run the Multi-Agent Pipeline Directly (CLI)
You can run the core pipeline immediately with **zero external API keys** and zero external service dependencies:

```bash
python3 backend/agents.py
```

This will run an end-to-end analysis on the sample market data and print **two differentiated recommendations for the EXACT SAME asset** under both a **Conservative** profile and an **Aggressive** profile (Requirement #4 Proof):

```text
[1] CONSERVATIVE INVESTOR PROFILE EXECUTION:
-> Base Synthesis: BUY CONSIDERATION
-> Personalized Action: BUY CONSIDERATION
-> Max Cap: 6.0% (₹3,000.0)
-> Stop Loss: 4.0%
-> Rationale: Defensive sizing capped at 6.0% to protect principal under CONSERVATIVE constraints.

[2] AGGRESSIVE INVESTOR PROFILE EXECUTION (SAME MARKET DATA):
-> Base Synthesis: BUY CONSIDERATION
-> Personalized Action: BUY CONSIDERATION
-> Max Cap: 20.0% (₹40,000.0)
-> Stop Loss: 8.5%
-> Rationale: High-conviction allocation of 20.0% allowed under aggressive growth mandate.
```

---

### 2. Optional: Plug in an LLM API Key

The pipeline runs out-of-the-box using rule-based and vector-grounded algorithms. To activate real-time LLM reasoning, export your API key:

```bash
# For Google Gemini
export GEMINI_API_KEY="your-gemini-api-key"

# Or for Anthropic / OpenAI
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export OPENAI_API_KEY="your-openai-api-key"
```

---

### 3. Launch the Streamlit Dashboard (Optional)

```bash
pip install streamlit
streamlit run backend/app.py
```

---

### 4. Launch the Web Application (React + Vite + Tailwind)

```bash
npm install
npm run build
npm start
```
The web dashboard is served on port `3000`.

---

## 📋 Priority-Ordered Next Steps

1. **Verify Dual-Profile Sizing**: Run `python3 backend/agents.py` to confirm that conservative and aggressive profiles yield mathematically distinct risk caps and stop losses on identical market data.
2. **Add Custom Filings to ChromaDB**: Drop any `.txt` or `.md` SEBI filings or annual reports into `./sample_filings/` and run `python3 -c "from backend.rag import seed_sample_filings; seed_sample_filings()"` to automatically index them.
3. **Inspect Real-Time Latency**: View per-agent latency in `backend/db.py` via `get_performance_logs()` to monitor response times and HHI risk concentration scores.
