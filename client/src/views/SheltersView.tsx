import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Shelter } from '../types';
import { api } from '../services/api';
import {
  Home,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const SheltersView: React.FC = () => {
  const { role, setShelterModalData, refreshData } = useEmergency();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const loadShelters = async () => {
    try {
      const data = await api.getShelters();
      setShelters(data);
    } catch (err) {
      console.error('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleSimulateOvercrowd = async (shelterId: string = 'SHL-02') => {
    setIsSimulating(true);
    try {
      const result = await api.simulateShelterOvercrowd(shelterId, role);
      setShelterModalData(result);
      await loadShelters();
      await refreshData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            <span>Emergency Evacuation Shelters & Relief Camps</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Capacity management, food rations & automated overflow load-balancing
          </p>
        </div>

        <button
          onClick={() => handleSimulateOvercrowd('SHL-02')}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all shadow"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Simulate Shelter S-02 Full (Overcrowd)</span>
        </button>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {shelters.map((shelter) => {
          const occupancyPercent = Math.round((shelter.occupied / shelter.capacity) * 100);
          const isFull = shelter.status === 'Full' || occupancyPercent >= 100;
          const isNear = shelter.status === 'Near Capacity' || occupancyPercent >= 90;

          return (
            <div
              key={shelter.id}
              className={`bg-gray-900 rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                isFull
                  ? 'border-red-600/70 bg-gradient-to-b from-red-950/20 to-gray-900'
                  : isNear
                  ? 'border-amber-600/60 bg-gradient-to-b from-amber-950/20 to-gray-900'
                  : 'border-gray-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {shelter.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 leading-snug">
                    {shelter.name}
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isFull
                      ? 'bg-red-900/60 text-red-300 border-red-700'
                      : isNear
                      ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {isFull ? 'FULL (100%)' : isNear ? 'NEAR CAPACITY' : 'AVAILABLE'}
                </span>
              </div>

              {/* Location */}
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{shelter.location}</span>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1.5 p-3 bg-gray-850 rounded-lg border border-gray-750">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Occupancy:</span>
                  <span className="font-mono font-bold text-white">
                    {shelter.occupied} / {shelter.capacity} Beds
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFull ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                  <span>Available Space:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {shelter.availableCapacity} remaining
                  </span>
                </div>
              </div>

              {/* On-site Facilities */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                  Verified On-Site Facilities
                </span>
                <div className="flex flex-wrap gap-1">
                  {shelter.facilities.map((fac, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Manager & Contact */}
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block text-[10px]">CAMP IN-CHARGE:</span>
                  <span className="text-gray-300 font-medium">{shelter.manager}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px]">HOTLINE:</span>
                  <span className="text-blue-400 font-mono">{shelter.contact}</span>
                </div>
              </div>

              {/* Action Button for Overcrowding */}
              {isFull && (
                <div className="pt-2">
                  <button
                    onClick={() => handleSimulateOvercrowd(shelter.id)}
                    className="w-full py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Evacuee Redirection Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
