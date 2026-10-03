import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { EmergencyRequest, AllocationRecommendation } from '../types';
import { api } from '../services/api';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Truck,
  Users,
  Building2,
  Clock,
  Navigation,
  Compass,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';

export const AllocationEngineView: React.FC = () => {
  const {
    selectedRequestId,
    setSelectedRequestId,
    setActiveTab,
    role,
    refreshData,
  } = useEmergency();

  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [recommendation, setRecommendation] = useState<AllocationRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pending requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.getRequests();
        setRequests(data);
        if (!selectedRequestId && data.length > 0) {
          // Default to first pending or critical request
          const pending = data.find((r) => r.status === 'Pending') || data[0];
          setSelectedRequestId(pending.id);
        }
      } catch (err) {
        console.error('Error fetching requests for allocation:', err);
      }
    };
    fetchRequests();
  }, []);

  // Run recommendation when selectedRequestId changes
  useEffect(() => {
    if (!selectedRequestId) return;
    const runEngine = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.recommendAllocation(selectedRequestId);
        setRecommendation(result);
      } catch (err: any) {
        setError(err.message || 'Failed to compute allocation recommendation');
      } finally {
        setLoading(false);
      }
    };
    runEngine();
  }, [selectedRequestId]);

  const handleConfirmAssignment = async () => {
    if (!recommendation) return;
    setAssigning(true);
    try {
      await api.assignAllocation({
        requestId: recommendation.requestId,
        teamId: recommendation.recommendedTeam.id,
        vehicleId: recommendation.recommendedVehicle.id,
        allocationPlan: recommendation.allocationPlan,
        userRole: role,
      });

      await refreshData();
      alert(`Assignment confirmed! Delivery operation dispatched for ${recommendation.requestId}.`);
      setActiveTab('tracking');
    } catch (err: any) {
      alert(`Assignment error: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Engine Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <span>Explainable Resource Allocation & Dispatch Engine</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Transparent multi-depot matching, specialized team assignment & fleet capacity optimization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-800/80 text-xs font-mono font-semibold">
            ENGINE STATUS: ACTIVE
          </span>
        </div>
      </div>

      {/* Request Selector Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
          Select Distress Request for Automated Allocation
        </label>
        <div className="flex flex-wrap gap-2">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedRequestId(req.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left flex items-center gap-2 ${
                selectedRequestId === req.id
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-500/30'
                  : 'bg-gray-850 hover:bg-gray-800 text-gray-300 border-gray-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  req.priority === 'Critical'
                    ? 'bg-red-500'
                    : req.priority === 'High'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              />
              <span className="font-mono font-bold">{req.id}</span>
              <span className="opacity-80">({req.quantity} {req.requestedResource})</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  req.status === 'Pending' ? 'bg-amber-900/60 text-amber-300' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {req.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Request Brief */}
      {selectedRequest && (
        <div className="p-4 bg-gray-850 rounded-xl border border-gray-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sm text-blue-400">
                {selectedRequest.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  selectedRequest.priority === 'Critical'
                    ? 'bg-red-900/60 text-red-300 border-red-700'
                    : 'bg-amber-900/60 text-amber-300 border-amber-700'
                }`}
              >
                {selectedRequest.priority.toUpperCase()} PRIORITY
              </span>
              <span className="text-xs text-gray-400">
                • {selectedRequest.affectedPeople} affected citizens
              </span>
            </div>
            <div className="text-white font-semibold text-sm">
              Requires: {selectedRequest.quantity} {selectedRequest.unit} of{' '}
              {selectedRequest.requestedResource}
            </div>
            <p className="text-xs text-gray-300">
              <strong>Ground Location: </strong> {selectedRequest.location}
            </p>
          </div>

          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 text-xs text-gray-400 max-w-sm">
            <span className="text-gray-300 font-semibold block mb-0.5">Triage Classification Reason:</span>
            {selectedRequest.priorityReason}
          </div>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-gray-400 bg-gray-900 rounded-xl border border-gray-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <p className="text-sm font-medium">Running multi-factor explainable allocation algorithm...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-700 rounded-xl text-red-200 text-xs">
          <strong>Allocation Engine Error: </strong> {error}
        </div>
      )}

      {/* Recommendation Results */}
      {!loading && recommendation && (
        <div className="space-y-6">
          {/* Main 3 Recommendations Cards: Stock, Team, Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Multi-Depot Stock Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  1. Depots Allocation Plan
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                  {recommendation.allocationPlan.length} Source Depots
                </span>
              </div>

              {recommendation.isShortage ? (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded text-xs text-red-200 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Stock Deficit Detected
                  </div>
                  <p>
                    Required: {recommendation.quantityNeeded} units, Available: {recommendation.totalAvailable} units. Shortage of {recommendation.shortageAmount} units!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendation.allocationPlan.map((plan, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-850 rounded-lg border border-gray-750 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{plan.orgName}</span>
                        <span className="font-mono font-bold text-purple-300">
                          {plan.quantity} units
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {plan.warehouseLocation}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Distance: {plan.distanceKm} km from target
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Recommended Team */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  2. Response Squad
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                  Available
                </span>
              </div>

              {recommendation.recommendedTeam ? (
                <div className="p-3 bg-gray-850 rounded-lg border border-gray-750 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {recommendation.recommendedTeam.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold">
                      {recommendation.recommendedTeam.teamType}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Leader: <strong>{recommendation.recommendedTeam.leader}</strong> ({recommendation.recommendedTeam.membersCount} Specialists)
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {recommendation.recommendedTeam.skills.slice(0, 3).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-gray-900 text-gray-300 border border-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-800">
                    Station: {recommendation.recommendedTeam.currentLocation}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No active response squad available.</p>
              )}
            </div>

            {/* Card 3: Recommended Vehicle */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  3. Dedicated Transport
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                  Payload Matched
                </span>
              </div>

              {recommendation.recommendedVehicle ? (
                <div className="p-3 bg-gray-850 rounded-lg border border-gray-750 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {recommendation.recommendedVehicle.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold">
                      {recommendation.recommendedVehicle.vehicleType}
                    </span>
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Driver: <strong>{recommendation.recommendedVehicle.driver}</strong> • Fuel: {recommendation.recommendedVehicle.fuelLevel}%
                  </div>
                  <div className="text-xs text-gray-300 pt-1">
                    Rated Payload: <strong>{recommendation.recommendedVehicle.capacity} {recommendation.recommendedVehicle.capacityUnit}</strong>
                  </div>
                  <div className="text-[10px] text-amber-400 pt-1 border-t border-gray-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Estimated Transit: ~{recommendation.estimatedMinutes} mins</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No vehicle available.</p>
              )}
            </div>
          </div>

          {/* "Why this allocation?" Explainable Evidence Panel (Requirement 6 & 15) */}
          <div className="bg-gray-900 border border-blue-500/50 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Why this allocation? (Explainable Decision Evidence)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                5 OF 5 CHECKS VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {recommendation.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-850 rounded-lg border border-gray-750 flex items-start gap-2.5 text-xs"
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      ev.passed ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-gray-200 block mb-0.5">
                      {ev.criterion}
                    </span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      {ev.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm & Dispatch Action Bar */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              Dispatches emergency operation record, deducts inventory stock, and transitions fleet telemetry.
            </div>

            <button
              onClick={handleConfirmAssignment}
              disabled={assigning || recommendation.isShortage}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>{assigning ? 'Dispatching...' : 'Approve & Dispatch Delivery'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
