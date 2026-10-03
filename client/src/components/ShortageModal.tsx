import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Share2,
  ShieldCheck,
  TrendingDown,
  X,
} from 'lucide-react';

export const ShortageModal: React.FC = () => {
  const { shortageModalData, setShortageModalData, setActiveTab } = useEmergency();

  if (!shortageModalData) return null;

  const { requestedResource, quantityNeeded, totalAvailable, deficit, recommendations, evidence } =
    shortageModalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-purple-700/80 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 px-6 py-4 border-b border-purple-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/30 rounded-lg border border-purple-500/50 text-purple-300">
              <Boxes className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-purple-300 font-bold">
                CRITICAL LIVE SCENARIO: RESOURCE SHORTAGE
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Supply Deficit Analysis & Inter-Agency Mitigation
              </h3>
            </div>
          </div>
          <button
            onClick={() => setShortageModalData(null)}
            className="p-1.5 rounded-lg bg-purple-900/40 text-purple-300 hover:bg-purple-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Numbers Card */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-950 rounded-lg border border-gray-800 text-center">
            <div>
              <span className="text-[11px] text-gray-400 font-medium block">Total Required</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {quantityNeeded} units
              </span>
              <span className="text-[10px] text-gray-500">{requestedResource}</span>
            </div>
            <div className="border-x border-gray-800">
              <span className="text-[11px] text-gray-400 font-medium block">Available in City</span>
              <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
                {totalAvailable} units
              </span>
              <span className="text-[10px] text-blue-300/80">Across all 3 orgs</span>
            </div>
            <div>
              <span className="text-[11px] text-red-400 font-bold block flex items-center justify-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Deficit Shortage
              </span>
              <span className="text-xl font-bold font-mono text-red-400 mt-1 block">
                -{deficit} units
              </span>
              <span className="text-[10px] text-red-300/80">Immediate shortfall</span>
            </div>
          </div>

          {/* Actionable Multi-tier Mitigation Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Recommended Multi-Tier Mitigation Strategy</span>
            </h4>
            <div className="space-y-2.5">
              {(recommendations || []).map((rec: any, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-gray-850 rounded-lg border border-gray-750 flex items-start gap-3 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/50 flex items-center justify-center font-bold font-mono shrink-0">
                    {rec.priority || i + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">{rec.strategy}</span>
                    <p className="text-gray-300 text-[11px]">{rec.action}</p>
                    <span className="text-[10px] text-gray-400 italic block mt-0.5">
                      Rationale: {rec.rationale}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Why this recommendation? (Evidence points)</span>
            </h4>
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1.5 text-xs text-gray-300">
              {(evidence || []).map((pt: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-950 px-6 py-3.5 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Escalation generated to State Command Grid
          </span>
          <button
            onClick={() => {
              setShortageModalData(null);
              setActiveTab('resources');
            }}
            className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow"
          >
            Review Resource Inventory
          </button>
        </div>
      </div>
    </div>
  );
};
