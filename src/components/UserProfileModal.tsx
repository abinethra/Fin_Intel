import React, { useState } from "react";
import { UserRiskProfile, RiskTolerance, InvestmentHorizon } from "../types";
import { X, ShieldCheck, Check, AlertCircle, DollarSign, Calendar, Sliders } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserRiskProfile;
  onSaveProfile: (updated: UserRiskProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<UserRiskProfile>({ ...userProfile });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        onSaveProfile(profile);
        onClose();
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Retail Investor Risk Profile</h3>
              <p className="text-[11px] text-slate-500">Controls the Personalization Layer constraints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Risk Tolerance Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold uppercase text-[10px] tracking-wider block">
              Risk Tolerance Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"] as RiskTolerance[]).map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setProfile({ ...profile, risk_tolerance: tier })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    profile.risk_tolerance === tier
                      ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs">{tier}</div>
                  <div className="text-[9px] opacity-80 mt-0.5 font-normal">
                    {tier === "CONSERVATIVE" ? "Capital Defense" : tier === "MODERATE" ? "Balanced Growth" : "Alpha Outperformance"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Horizon */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold uppercase text-[10px] tracking-wider block">
              Planned Holding Horizon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"] as InvestmentHorizon[]).map((hor) => (
                <button
                  type="button"
                  key={hor}
                  onClick={() => setProfile({ ...profile, investment_horizon: hor })}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    profile.investment_horizon === hor
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-1 ring-indigo-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs">{hor.replace("_", " ")}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {hor === "SHORT_TERM" ? "< 1 month" : hor === "MEDIUM_TERM" ? "1-12 months" : "> 1 year"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Max Single Stock Allocation */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                Max Single-Stock Cap
              </label>
              <span className="font-mono font-bold text-indigo-700 text-xs">
                {profile.max_portfolio_allocation_pct}% of portfolio
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={profile.max_portfolio_allocation_pct}
              onChange={(e) => setProfile({ ...profile, max_portfolio_allocation_pct: Number(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5% (Strict Defense)</span>
              <span>15% (Standard)</span>
              <span>30% (High Conviction)</span>
            </div>
          </div>

          {/* Monthly Budget */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold uppercase text-[10px] tracking-wider block">
              Monthly Investable Capital (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₹</span>
              <input
                type="number"
                value={profile.monthly_budget_inr}
                onChange={(e) => setProfile({ ...profile, monthly_budget_inr: Number(e.target.value) })}
                step="5000"
                min="5000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Capital Preservation Priority Toggle */}
          <label className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.capital_preservation_priority}
              onChange={(e) => setProfile({ ...profile, capital_preservation_priority: e.target.checked })}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <div>
              <div className="text-xs font-bold text-slate-800">Strict Capital Preservation Override</div>
              <div className="text-[10px] text-slate-500">Caps all recommendations to defensive limits and enforces tighter trailing stops</div>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Risk Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
