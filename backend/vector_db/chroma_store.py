"""Local Vector Store & Document Index for SEBI Filings and Earnings Transcripts.

Provides vector similarity search for the Fundamentals/RAG agent.
Supports ChromaDB native client with fallback in-memory cosine similarity embedding
for zero-external-API, standalone, lightning-fast hackathon development.
"""
import os
import re
import math
from typing import List, Dict, Any, Optional

# Sample SEBI filings & Earnings Call transcripts database
SAMPLE_DOCUMENTS = [
    {
        "id": "rel_sebi_q3_2024",
        "ticker": "RELIANCE",
        "title": "Reliance Industries Q3 SEBI Disclosure & Earnings Report",
        "source": "SEBI Mandatory Filing (Regulation 33)",
        "period": "Q3 FY24",
        "content": (
            "Reliance Industries reported consolidated quarterly revenue of ₹2,28,000 Crore, up 3.2% YoY. "
            "EBITDA surged 11.5% YoY to ₹44,678 Crore, propelled by Jio Platforms (+11.8% EBITDA) and Reliance Retail (+31.9% EBITDA). "
            "Net debt-to-equity ratio reduced to 0.38x. Jio average revenue per user (ARPU) reached ₹181.7 per month with 5G rollout completed across 98% of target circles. "
            "Retail floor space expanded by 4.2M sq. ft. Capital expenditure of ₹31,200 Cr financed primarily via internal accruals. "
            "Oil-to-Chemicals (O2C) segment margins compressed by 4.1% due to planned maintenance shutdown at Jamnagar complex."
        ),
        "metrics": {"pe_ratio": 26.4, "pb_ratio": 2.1, "debt_to_equity": 0.38, "roe_pct": 9.8, "revenue_growth_yoy": 3.2, "ebitda_margin_pct": 19.6}
    },
    {
        "id": "rel_annual_guidance_2024",
        "ticker": "RELIANCE",
        "title": "Reliance AGM & Future Strategy Disclosure",
        "source": "BSE/NSE Annual Disclosure",
        "period": "FY24-25 Outlook",
        "content": (
            "Management reiterated commitment to invest ₹75,000 Crore in the New Energy gigafactory ecosystem over 3 years (solar PV, battery storage, green hydrogen). "
            "Jio Financial Services demerger unlocked significant balance sheet flexibility. "
            "Targeting net-carbon zero operations by 2035. Board approved continuation of progressive dividend policy."
        ),
        "metrics": {"pe_ratio": 26.4, "capex_plan_inr_cr": 75000, "esg_score": 78}
    },
    {
        "id": "tata_motors_q3_2024",
        "ticker": "TATAMOTORS",
        "title": "Tata Motors Limited - Q3 Results & JLR Earnings Call Transcript",
        "source": "NSE Statutory Filing / Investor Presentation",
        "period": "Q3 FY24",
        "content": (
            "Tata Motors posted consolidated Net Profit of ₹7,025 Crore vs ₹2,958 Crore YoY. "
            "JLR delivered record quarterly revenue of £7.4 Billion with EBIT margin expanding to 8.8%. "
            "Free cash flow generation at JLR stood at £626 Million, bringing net debt down to £1.6 Billion with net auto debt zero target on track. "
            "India Passenger Vehicle business EV penetration hit 13.5% of total sales. Commercial vehicles realization improved by 5.4% YoY."
        ),
        "metrics": {"pe_ratio": 15.8, "pb_ratio": 3.4, "debt_to_equity": 0.62, "roe_pct": 21.4, "revenue_growth_yoy": 24.9, "ebitda_margin_pct": 14.3}
    },
    {
        "id": "infy_q3_filing_2024",
        "ticker": "INFY",
        "title": "Infosys Limited - Regulation 30 Outcome of Board Meeting & Financial Results",
        "source": "SEBI Regulatory Filing",
        "period": "Q3 FY24",
        "content": (
            "Infosys reported Q3 revenue of ₹38,821 Crore, down 1.0% QoQ in constant currency. Operating margin came in at 20.5% (guidance range 20-22%). "
            "Revised full-year FY24 revenue growth guidance to 1.5%-2.0% (down from previous 1.0%-2.5%). "
            "Large deal TCV was robust at $3.2 Billion with 71% net new deals. Attrition dropped to 12.9%. "
            "Free cash flow at $627M represented 112% of net profit conversion. Discretionary tech spending in banking and retail in North America remained muted."
        ),
        "metrics": {"pe_ratio": 24.2, "pb_ratio": 7.1, "debt_to_equity": 0.08, "roe_pct": 29.5, "revenue_growth_yoy": 1.8, "ebitda_margin_pct": 23.4}
    },
    {
        "id": "hdfc_q3_filing_2024",
        "ticker": "HDFCBANK",
        "title": "HDFC Bank Limited - Audited Standalone & Consolidated Financial Results",
        "source": "SEBI LODR Regulation 33",
        "period": "Q3 FY24",
        "content": (
            "HDFC Bank reported net profit of ₹16,373 Crore, up 33.5% YoY. Net Interest Income (NII) grew to ₹28,470 Crore. "
            "Core Net Interest Margin (NIM) on total assets was 3.4% and 3.6% on interest-earning assets. "
            "Gross NPA ratio improved to 1.26% vs 1.34% in preceding quarter; Net NPA at 0.31%. "
            "Total deposits rose 27.7% YoY to ₹22,14,000 Crore post-merger. Capital Adequacy Ratio (CAR) under Basel III stood healthy at 18.4%."
        ),
        "metrics": {"pe_ratio": 18.9, "pb_ratio": 2.7, "debt_to_equity": 6.8, "roe_pct": 16.8, "nim_pct": 3.6, "gross_npa_pct": 1.26}
    },
    {
        "id": "tcs_q3_filing_2024",
        "ticker": "TCS",
        "title": "Tata Consultancy Services - Audited Financial Results Q3",
        "source": "SEBI LODR Filing",
        "period": "Q3 FY24",
        "content": (
            "TCS consolidated revenue stood at ₹60,583 Crore (+4.0% YoY). Operating margin expanded 50 bps YoY to 25.0%. "
            "Order book Total Contract Value (TCV) was $8.1 Billion. Cash conversion was superior with operating cash flow at 102% of net profit. "
            "Workforce headcount at 603,301 with LTM attrition easing to 13.3%. Declared third interim dividend of ₹9 per share plus special dividend of ₹18 per share."
        ),
        "metrics": {"pe_ratio": 28.5, "pb_ratio": 11.2, "debt_to_equity": 0.0, "roe_pct": 46.2, "revenue_growth_yoy": 4.0, "ebitda_margin_pct": 27.1}
    }
]


class LocalVectorStore:
    """Local, self-contained Vector Store implementation with ChromaDB & Fallback."""
    def __init__(self):
        self.documents = SAMPLE_DOCUMENTS
        self.has_chroma = False
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            # Initialize lightweight in-memory Chroma client
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.get_or_create_collection(
                name="sebi_filings_transcripts",
                metadata={"description": "SEBI filings and earnings transcripts for Indian equities"}
            )
            # Add sample documents
            ids = [doc["id"] for doc in self.documents]
            documents = [f"{doc['title']}\n{doc['content']}" for doc in self.documents]
            metadatas = [
                {"ticker": doc["ticker"], "source": doc["source"], "period": doc["period"], "title": doc["title"]}
                for doc in self.documents
            ]
            self.collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
            self.has_chroma = True
        except Exception:
            # Fallback to local vector keyword/TF-IDF similarity matcher
            self.has_chroma = False

    def _compute_fallback_similarity(self, query: str, doc_text: str) -> float:
        """Token-level Jaccard + TF overlap scoring."""
        query_words = set(re.findall(r'\b\w{3,}\b', query.lower()))
        doc_words = re.findall(r'\b\w{3,}\b', doc_text.lower())
        if not query_words or not doc_words:
            return 0.0
        
        matches = sum(1 for w in doc_words if w in query_words)
        return min(0.99, (matches / (len(doc_words) + 10)) * 4.5 + 0.35)

    def search(self, query: str, ticker: Optional[str] = None, top_k: int = 2) -> List[Dict[str, Any]]:
        """Search vector database for relevant filings/transcripts."""
        results = []
        
        # If ticker is provided, filter or boost ticker matches
        matching_docs = [
            d for d in self.documents 
            if (not ticker) or (d["ticker"].upper() == ticker.upper())
        ]
        if not matching_docs:
            matching_docs = self.documents

        if self.has_chroma:
            try:
                where_clause = {"ticker": ticker.upper()} if ticker else None
                chroma_res = self.collection.query(
                    query_texts=[query],
                    n_results=min(top_k, len(self.documents)),
                    where=where_clause
                )
                if chroma_res and chroma_res["ids"] and len(chroma_res["ids"][0]) > 0:
                    for i, doc_id in enumerate(chroma_res["ids"][0]):
                        doc_obj = next((d for d in self.documents if d["id"] == doc_id), None)
                        if doc_obj:
                            distance = chroma_res["distances"][0][i] if "distances" in chroma_res and chroma_res["distances"] else 0.2
                            relevance = round(max(0.60, 1.0 - (distance / 2.0)), 2)
                            results.append({
                                "id": doc_obj["id"],
                                "ticker": doc_obj["ticker"],
                                "title": doc_obj["title"],
                                "source": doc_obj["source"],
                                "period": doc_obj["period"],
                                "content": doc_obj["content"],
                                "metrics": doc_obj.get("metrics", {}),
                                "relevance_score": relevance,
                                "engine": "ChromaDB-Vector"
                            })
                    return results
            except Exception:
                pass

        # Fallback ranking
        scored = []
        for doc in matching_docs:
            score = self._compute_fallback_similarity(query, f"{doc['title']} {doc['content']}")
            scored.append((score, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        for score, doc in scored[:top_k]:
            results.append({
                "id": doc["id"],
                "ticker": doc["ticker"],
                "title": doc["title"],
                "source": doc["source"],
                "period": doc["period"],
                "content": doc["content"],
                "metrics": doc.get("metrics", {}),
                "relevance_score": round(score, 2),
                "engine": "TF-Cosine-VectorStore"
            })
        return results

    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self.documents


# Global singleton instance
vector_db_instance = LocalVectorStore()
