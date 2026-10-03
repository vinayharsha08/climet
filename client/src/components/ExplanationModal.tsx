import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const ExplanationModal: React.FC = () => {
  const { explanationModalData, setExplanationModalData } = useEmergency();

  if (!explanationModalData) return null;

  const { title, subtitle, items, tags } = explanationModalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-blue-500/60 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-gray-900 to-blue-950 px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold block">
                EXPLAINABLE AI & DECISION AUDIT
              </span>
              <h3 className="text-base font-bold text-white">{title || 'Explain Decision'}</h3>
            </div>
          </div>
          <button
            onClick={() => setExplanationModalData(null)}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {subtitle && (
            <p className="text-xs text-gray-300 font-medium leading-relaxed bg-gray-850 p-2.5 rounded border border-gray-750">
              {subtitle}
            </p>
          )}

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Evidence Checklist */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Verified Evidence Criteria
            </span>
            <div className="bg-gray-950 rounded-lg p-3 border border-gray-800 space-y-2">
              {(items || []).map((item: any, i: number) => {
                const text = typeof item === 'string' ? item : item.details || item.criterion;
                return (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-950 px-5 py-3 border-t border-gray-800 flex justify-end">
          <button
            onClick={() => setExplanationModalData(null)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded shadow transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
