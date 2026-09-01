import React, { useState, useEffect } from "react";
import { Search, FileText, Database, Check, ExternalLink, Sparkles, Building2, Tag } from "lucide-react";
import { FilingDocument } from "../types";

interface VectorFilingsExplorerProps {
  onSelectTicker?: (ticker: string) => void;
}

export const VectorFilingsExplorer: React.FC<VectorFilingsExplorerProps> = ({ onSelectTicker }) => {
  const [documents, setDocuments] = useState<FilingDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTickerFilter, setSelectedTickerFilter] = useState<string>("ALL");
  const [selectedDoc, setSelectedDoc] = useState<FilingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async (query = "", ticker = "") => {
    setIsLoading(true);
    try {
      let url = "/documents";
      if (query.trim()) {
        url = `/documents/search?query=${encodeURIComponent(query.trim())}${ticker && ticker !== "ALL" ? `&ticker=${ticker}` : ""}`;
      } else if (ticker && ticker !== "ALL") {
        url = `/documents?ticker=${ticker}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
        if (data.length > 0 && !selectedDoc) {
          setSelectedDoc(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(searchQuery, selectedTickerFilter);
  }, [selectedTickerFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments(searchQuery, selectedTickerFilter);
  };

  const sampleSearchPrompts = [
    "Jio 5G ARPU expansion & retail store count",
    "JLR free cash flow and net debt target",
    "Operating margin guidance and deal TCV",
    "Asset quality Gross NPA and CASA deposits",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Local ChromaDB Vector Filings Corpus</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Synthesized & statutory SEBI Regulation 33 quarterly disclosures and earnings transcripts. Vectorized locally for sub-millisecond semantic retrieval by the Fundamentals Agent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ChromaDB Store: Active (Zero External API)
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SEBI disclosures with natural language queries (e.g. 'capital expenditure and debt ratio')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? "Searching Vector DB..." : "Semantic Search"}
          </button>
        </form>

        {/* Quick prompt pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" /> Try RAG query:
          </span>
          {sampleSearchPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(prompt);
                fetchDocuments(prompt, selectedTickerFilter);
              }}
              className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Ticker Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-200">
          <span className="text-[11px] text-slate-500 mr-1 font-medium">Filter Stock:</span>
          {["ALL", "RELIANCE", "TATAMOTORS", "HDFCBANK", "INFY", "TCS"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTickerFilter(t)}
              className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-all cursor-pointer ${
                selectedTickerFilter === t
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Indexed Filings ({documents.length})
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all space-y-1.5 ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {doc.ticker}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{doc.period}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                    {doc.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="truncate max-w-[140px]">{doc.source}</span>
                    {doc.relevance_score && (
                      <span className="text-emerald-700 font-mono font-bold">
                        {Math.round(doc.relevance_score * 100)}% match
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Full Reader */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          {selectedDoc ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {selectedDoc.ticker}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{selectedDoc.period}</span>
                    <span className="text-xs text-slate-500">&bull; {selectedDoc.source}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedDoc.title}</h3>
                </div>

                {onSelectTicker && (
                  <button
                    onClick={() => onSelectTicker(selectedDoc.ticker)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Run Multi-Agent Analysis</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Extracted Ratios/Metrics */}
              {selectedDoc.metrics && Object.keys(selectedDoc.metrics).length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    Extracted Financial Health Indicators (RAG Extractor)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {Object.entries(selectedDoc.metrics).map(([k, v]) => (
                      <div key={k} className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] block capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="text-slate-900 font-bold">{typeof v === "number" ? v : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Text Body */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Audited Statutory Content & Disclosure Excerpt
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedDoc.content}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select a statutory filing from the left panel to inspect full contents and extracted metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
