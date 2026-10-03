import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';

export const RoadBlockageModal: React.FC = () => {
  const { blockageModalData, setBlockageModalData, setActiveTab } = useEmergency();

  if (!blockageModalData) return null;

  const { delivery, explanation } = blockageModalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-red-700/80 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-gray-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 px-6 py-4 border-b border-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 rounded-lg border border-red-500/50 text-red-300">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-red-300 font-bold">
                CRITICAL LIVE SCENARIO: SYSTEM ADAPTATION
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Road Blockage Detected & Route Rerouted
              </h3>
            </div>
          </div>
          <button
            onClick={() => setBlockageModalData(null)}
            className="p-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Highlight Notification Banner */}
          <div className="p-3.5 bg-red-950/60 border border-red-700/60 rounded-lg flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <p className="text-xs text-red-200 font-medium leading-relaxed">
              <strong className="text-white">Adaptation Notice: </strong>
              &ldquo;Assignment changed because the original route became unavailable.&rdquo;
            </p>
          </div>

          {/* Before & After Adaptation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before (Original Route) */}
            <div className="p-4 bg-gray-850 rounded-lg border border-gray-750 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                <span>ORIGINAL ROUTE</span>
                <span className="text-red-400 font-bold">BLOCKED ✕</span>
              </div>
              <div className="font-semibold text-sm text-gray-200">
                Prakasam Barrage Approach
              </div>
              <p className="text-xs text-gray-400">
                Direct riverbank crossing to Zone A
              </p>
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400">Original ETA:</span>
                <span className="font-mono text-gray-300 font-semibold">{explanation?.previousEta || '14 minutes'}</span>
              </div>
              <div className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded border border-red-900/60 mt-1">
                <strong>Hazard: </strong> {delivery?.blockageDetails || 'Flash surge inundating road embankment by +3.2m.'}
              </div>
            </div>

            {/* After (System Recalculation) */}
            <div className="p-4 bg-blue-950/40 rounded-lg border border-blue-500/40 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                AUTONOMOUS DETOUR
              </div>
              <div className="flex items-center justify-between text-xs text-blue-300 font-mono">
                <span>RECALCULATED ROUTE</span>
                <span className="text-emerald-400 font-bold">ACTIVE ✓</span>
              </div>
              <div className="font-semibold text-sm text-white">
                Kanaka Durga Elevated Bypass
              </div>
              <p className="text-xs text-blue-200/80">
                High-clearance viaduct & Inner Ring Road
              </p>
              <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between text-xs">
                <span className="text-blue-300">Revised ETA:</span>
                <span className="font-mono text-amber-300 font-bold">{explanation?.newEta || '24 minutes'} (+10m)</span>
              </div>
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-900/60 mt-1">
                <strong>Status: </strong> Rerouted to ensure zero-risk transit for payload.
              </div>
            </div>
          </div>

          {/* Explainable Evidence Checklist */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evidence & Decision Rationale</span>
            </h4>
            <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 space-y-2">
              {(explanation?.evidence || [
                '✓ Real-time telemetry identified road impassability at Prakasam Barrage North',
                '✓ Original route marked unavailable in dispatch grid',
                '✓ Alternative elevated bypass (Kanaka Durga Flyover) verified accessible for emergency vehicles',
                '✓ Assignment updated dynamically with revised ETA of 24 minutes',
                '✓ Command Center and Field Response Team automatically alerted',
              ]).map((point: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-950 px-6 py-3.5 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            Operation ID: {delivery?.id || 'OP-102'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBlockageModalData(null);
                setActiveTab('audit');
              }}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              View in Audit Log
            </button>
            <button
              onClick={() => {
                setBlockageModalData(null);
                setActiveTab('tracking');
              }}
              className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open Live Map Tracking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
