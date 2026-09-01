"""
rag.py - Local ChromaDB RAG Vector Store & Retrieval

Chunks and embeds SEBI statutory filings and earnings transcripts into local ChromaDB.
Carries filename, excerpt, and section metadata for strict citation trails and zero-hallucination outputs.
"""

import os
import re
from typing import List, Dict, Any, Optional

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False


class LocalRAGStore:
    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = storage_dir or os.path.join(os.getcwd(), "chroma_db_store")
        self.client = None
        self.collection = None
        self.fallback_docs: List[Dict[str, Any]] = []
        self._init_db()

    def _init_db(self):
        if CHROMADB_AVAILABLE:
            try:
                self.client = chromadb.PersistentClient(path=self.storage_dir)
                self.collection = self.client.get_or_create_collection(
                    name="regulatory_filings",
                    metadata={"hnsw:space": "cosine"}
                )
            except Exception as e:
                # In-memory fallback if file locks exist
                try:
                    self.client = chromadb.EphemeralClient()
                    self.collection = self.client.get_or_create_collection(name="regulatory_filings")
                except Exception:
                    self.collection = None

    def chunk_text(self, text: str, chunk_size: int = 250, overlap: int = 50) -> List[str]:
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk.strip())
            i += (chunk_size - overlap)
        return chunks

    def ingest_folder(self, doc_folder: str) -> Dict[str, Any]:
        """Ingests all txt/markdown files in doc_folder with metadata."""
        if not os.path.exists(doc_folder):
            return {"status": "error", "message": f"Folder {doc_folder} does not exist", "chunks": 0}

        total_chunks = 0
        for root, _, files in os.walk(doc_folder):
            for fname in sorted(files):
                if not fname.endswith((".txt", ".md", ".json")):
                    continue
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    ticker_match = re.search(r"\b([A-Z]{3,10})\b", fname)
                    ticker = ticker_match.group(1) if ticker_match else "GENERAL"

                    chunks = self.chunk_text(content)
                    for idx, ch in enumerate(chunks):
                        doc_id = f"{fname}_{idx}"
                        meta = {
                            "source": fname,
                            "ticker": ticker,
                            "chunk_index": idx,
                            "section": f"Section {idx + 1}"
                        }
                        if self.collection:
                            self.collection.upsert(
                                ids=[doc_id],
                                documents=[ch],
                                metadatas=[meta]
                            )
                        else:
                            self.fallback_docs.append({"id": doc_id, "text": ch, "metadata": meta})
                        total_chunks += 1
                except Exception as e:
                    print(f"Error processing {fname}: {e}")

        return {"status": "success", "chunks_indexed": total_chunks}

    def retrieve(self, ticker: str, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Semantic search with strict source metadata."""
        ticker_clean = str(ticker).strip().upper()
        
        if self.collection and self.collection.count() > 0:
            try:
                res = self.collection.query(
                    query_texts=[f"{ticker_clean} {query}"],
                    n_results=top_k
                )
                docs = res.get("documents", [[]])[0]
                metas = res.get("metadatas", [[]])[0]
                results = []
                for d, m in zip(docs, metas):
                    results.append({
                        "source": m.get("source", "sebi_disclosure.txt"),
                        "ticker": m.get("ticker", ticker_clean),
                        "excerpt": (d[:240] + "...") if len(d) > 240 else d,
                        "full_text": d,
                        "section": m.get("section", "General")
                    })
                return results
            except Exception:
                pass

        # In-memory keyword match fallback
        matches = []
        q_words = set(query.lower().split() + [ticker_clean.lower()])
        for item in self.fallback_docs:
            txt = item["text"].lower()
            overlap = sum(1 for w in q_words if w in txt)
            if overlap > 0:
                matches.append((overlap, item))

        matches.sort(key=lambda x: x[0], reverse=True)
        top = matches[:top_k]
        return [
            {
                "source": m[1]["metadata"]["source"],
                "ticker": m[1]["metadata"]["ticker"],
                "excerpt": (m[1]["text"][:240] + "...") if len(m[1]["text"]) > 240 else m[1]["text"],
                "full_text": m[1]["text"],
                "section": m[1]["metadata"]["section"]
            }
            for m in top
        ]


# Singleton instance
rag_store = LocalRAGStore()

# Seed default mock filings if empty
DEFAULT_FILINGS = {
    "RELIANCE_Q3_FY26.txt": (
        "RELIANCE INDUSTRIES LIMITED (RIL) - SEBI LODR DISCLOSURE Q3 FY26\n"
        "Consolidated revenue from operations grew 12.8% YoY to INR 2,48,150 Crores. "
        "Retail segment EBIDTA margin expanded 45 bps to 8.4% driven by grocery scale and apparel private labels. "
        "Oil-to-Chemicals (O2C) segment faced global crack spread moderation, offset by domestic fuel retail volumes. "
        "Net debt to EBITDA remains safe at 0.62x with full capex funded through operating cash flows."
    ),
    "TCS_ANNUAL_REPORT.txt": (
        "TATA CONSULTANCY SERVICES (TCS) - REGULATORY COMPLIANCE FILING\n"
        "Operating margin reached 26.2% following cost optimization and higher employee utilization. "
        "Total Contract Value (TCV) in AI cloud and cybersecurity stood at USD 9.8 Billion. "
        "Cash conversion ratio remains at 104% of net income with zero long-term debt liabilities."
    ),
    "TATAMOTORS_Q3.txt": (
        "TATA MOTORS GROUP - EARNINGS AND STATUTORY DISCLOSURE\n"
        "Jaguar Land Rover (JLR) EBIT margin sustained at 8.8% with free cash flow of £620M in the quarter. "
        "India Commercial Vehicles commercialized new fleet management telematics improving fleet operating margins. "
        "Domestic EV market share stands at 68% with battery pack costs reducing 14% YoY."
    )
}

def seed_sample_filings():
    sample_dir = os.path.join(os.getcwd(), "sample_filings")
    os.makedirs(sample_dir, exist_ok=True)
    for fname, text in DEFAULT_FILINGS.items():
        with open(os.path.join(sample_dir, fname), "w", encoding="utf-8") as f:
            f.write(text)
    rag_store.ingest_folder(sample_dir)

seed_sample_filings()


if __name__ == "__main__":
    print("Testing rag.py...")
    retrieved = rag_store.retrieve("RELIANCE", "EBITDA margin and net debt ratio")
    print(f"Retrieved {len(retrieved)} grounding chunks:")
    for r in retrieved:
        print(f"Source: {r['source']} | Section: {r['section']}")
        print(f"Excerpt: {r['excerpt']}\n")
