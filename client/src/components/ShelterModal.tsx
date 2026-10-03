import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Home,
  MapPin,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

export const ShelterModal: React.FC = () => {
  const { shelterModalData, setShelterModalData, setActiveTab } = useEmergency();

  if (!shelterModalData) return null;

  const { fullShelter, targetShelter, redirectCount, evidence } = shelterModalData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-amber-700/80 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-6 py-4 border-b border-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600/30 rounded-lg border border-amber-500/50 text-amber-300">
              <Home className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                SHELTER LOAD BALANCING
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Facility at Capacity — Evacuee Redirection
              </h3>
            </div>
          </div>
          <button
            onClick={() => setShelterModalData(null)}
            className="p-1.5 rounded-lg bg-amber-900/40 text-amber-300 hover:bg-amber-800 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Shelter */}
            <div className="p-4 bg-red-950/30 rounded-lg border border-red-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-red-400 font-mono">
                <span>SATURATED FACILITY</span>
                <span className="font-bold px-1.5 py-0.5 bg-red-900/60 rounded">100% FULL</span>
              </div>
              <div className="font-semibold text-sm text-white">
                {fullShelter?.name || 'Govt High School Bhavanipuram'}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                {fullShelter?.location}
              </p>
              <div className="pt-2 border-t border-red-900/40 text-xs flex justify-between text-gray-300">
                <span>Occupancy:</span>
                <span className="font-mono font-bold text-red-400">
                  {fullShelter?.capacity} / {fullShelter?.capacity} Beds
                </span>
              </div>
            </div>

            {/* Target Redirect Shelter */}
            <div className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span>RECOMMENDED DESTINATION</span>
                <span className="font-bold px-1.5 py-0.5 bg-emerald-900/60 rounded">SURPLUS SPACE</span>
              </div>
              <div className="font-semibold text-sm text-white">
                {targetShelter?.name || 'Siddhartha College Indoor Arena'}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                {targetShelter?.location} ({targetShelter?.distanceKm || 3.1} km away)
              </p>
              <div className="pt-2 border-t border-emerald-900/40 text-xs flex justify-between text-gray-300">
                <span>Available Space:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {targetShelter?.availableCapacity} Beds Open
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Notice */}
          <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-lg text-xs text-amber-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Redirecting <strong className="text-white">{redirectCount || 40} incoming evacuees</strong> to {targetShelter?.name}. Automated transit bus dispatch requested.
            </span>
          </div>

          {/* Evidence */}
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Why was {targetShelter?.name} selected? (Evidence)</span>
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
          <span className="text-xs text-gray-400 font-mono">
            Audit Event Recorded
          </span>
          <button
            onClick={() => {
              setShelterModalData(null);
              setActiveTab('shelters');
            }}
            className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow"
          >
            Review Shelter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
