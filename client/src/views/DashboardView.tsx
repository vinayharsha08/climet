import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  Flame,
  AlertTriangle,
  FileText,
  Boxes,
  Truck,
  Users,
  Home,
  Navigation,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Clock,
  Compass,
  Bot,
  X,
} from 'lucide-react';
import { api } from '../services/api';

export const DashboardView: React.FC = () => {
  const {
    stats,
    setActiveTab,
    setSelectedRequestId,
    startTour,
    setBlockageModalData,
    setShortageModalData,
    setShelterModalData,
    refreshData,
    role,
  } = useEmergency();

  const kpis = stats?.kpis || {
    activeIncidents: 3,
    criticalRequests: 2,
    pendingRequests: 7,
    totalResourcesAvailable: 1843,
    activeDeliveries: 1,
    availableVehicles: 5,
    availableTeams: 4,
    shelterOccupancyRate: 61,
  };

  const charts = stats?.charts || {
    priorityDist: { Critical: 2, High: 3, Medium: 1, Low: 1 },
    statusDist: { Pending: 7, Allocated: 1, InTransit: 1, Delivered: 1 },
    shelters: [
      { name: 'Indira Gandhi Stadium', capacity: 800, occupied: 520, percent: 65, status: 'Available' },
      { name: 'Govt High School Bhavanipuram', capacity: 350, occupied: 338, percent: 97, status: 'Near Capacity' },
      { name: 'Siddhartha College Arena', capacity: 600, occupied: 210, percent: 35, status: 'Available' },
    ],
    resourcesByCategory: [
      { category: 'Medical', count: 285 },
      { category: 'Food', count: 500 },
      { category: 'Water', count: 600 },
      { category: 'Shelter', count: 450 },
      { category: 'Rescue', count: 8 },
    ],
  };

  const handleBlockageSimulation = async () => {
    try {
      const res = await api.simulateRoadBlockage(undefined, role);
      setBlockageModalData(res);
      await refreshData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    }
  };

  const handleShortageSimulation = async () => {
    try {
      const res = await api.simulateResourceShortage(
        { resourceType: 'Food Packets', quantity: 800 },
        role
      );
      setShortageModalData(res);
      await refreshData();
    } catch (err: any) {
      alert(`Shortage error: ${err.message}`);
    }
  };

  const [showAiModal, setShowAiModal] = React.useState(false);
  const [aiSitrep, setAiSitrep] = React.useState<{ sitrep: string; source: string } | null>(null);
  const [generatingAi, setGeneratingAi] = React.useState(false);

  const handleGenerateAiSitrep = async () => {
    setGeneratingAi(true);
    setShowAiModal(true);
    try {
      const res = await api.getAiSitrep();
      setAiSitrep(res);
    } catch (err: any) {
      setAiSitrep({
        sitrep: `Failed to generate AI SitRep: ${err.message}`,
        source: 'Error',
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleShelterSimulation = async () => {
    try {
      const res = await api.simulateShelterOvercrowd('SHL-02', role);
      setShelterModalData(res);
      await refreshData();
    } catch (err: any) {
      alert(`Shelter error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Operational Control Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Command Center Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950 text-red-300 border border-red-800/80">
              NATIONAL CRISIS LEVEL 3
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time automated resource allocation, fleet telemetry & inter-agency dispatch
          </p>
        </div>

        {/* Quick Simulation Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI SitRep Generator Button */}
          <button
            onClick={handleGenerateAiSitrep}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Situation Report</span>
          </button>

          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided Demo Flow (Steps 1-14)</span>
          </button>

          <button
            onClick={handleBlockageSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Road Blockage</span>
          </button>

          <button
            onClick={handleShortageSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all"
          >
            <Boxes className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Shortage</span>
          </button>

          <button
            onClick={handleShelterSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Full Shelter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Active Incidents */}
        <div
          onClick={() => setActiveTab('incidents')}
          className="bg-gray-900 hover:bg-gray-850 border border-gray-800 p-4 rounded-xl shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Active Incidents</span>
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">
              {kpis.activeIncidents}
            </span>
            <span className="text-[11px] text-red-400 font-medium">Zone A, B, C</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
            <span>Primary: Bhavanipuram (+2.8m)</span>
            <ArrowUpRight className="w-3 h-3 text-gray-500" />
          </div>
        </div>

        {/* Card 2: Critical Requests */}
        <div
          onClick={() => setActiveTab('requests')}
          className="bg-gray-900 hover:bg-gray-850 border border-gray-800 p-4 rounded-xl shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Critical Distress Requests</span>
            <div className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-red-400 font-mono">
              {kpis.criticalRequests}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {kpis.pendingRequests} total pending
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-300/80 flex items-center gap-1">
            <span>Urgent: REQ-101 Medical Kits</span>
            <ArrowUpRight className="w-3 h-3 text-red-400" />
          </div>
        </div>

        {/* Card 3: Total Resources Available */}
        <div
          onClick={() => setActiveTab('resources')}
          className="bg-gray-900 hover:bg-gray-850 border border-gray-800 p-4 rounded-xl shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Available Resources</span>
            <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400 group-hover:scale-110 transition-transform">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-400 font-mono">
              {kpis.totalResourcesAvailable.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-400">across 3 orgs</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
            <span>Food, Water, Meds, Boats</span>
            <ArrowUpRight className="w-3 h-3 text-gray-500" />
          </div>
        </div>

        {/* Card 4: Active Deliveries */}
        <div
          onClick={() => setActiveTab('tracking')}
          className="bg-gray-900 hover:bg-gray-850 border border-gray-800 p-4 rounded-xl shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Active Operations / Fleet</span>
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 group-hover:scale-110 transition-transform">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {kpis.activeDeliveries}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {kpis.availableVehicles} vehicles ready
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-300/80 flex items-center gap-1">
            <span>Live GPS telemetry active</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Priority & Status Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Emergency Request Priority & Status
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-[11px] text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          {/* Priority Bars */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Critical Priority (&gt;500 people / medical)
                </span>
                <span className="font-mono font-bold text-white">
                  {charts.priorityDist.Critical || 0}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((charts.priorityDist.Critical || 0) / 7) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  High Priority (&gt;200 people)
                </span>
                <span className="font-mono font-bold text-white">
                  {charts.priorityDist.High || 0}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((charts.priorityDist.High || 0) / 7) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Medium Priority (50–200 people)
                </span>
                <span className="font-mono font-bold text-white">
                  {charts.priorityDist.Medium || 0}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((charts.priorityDist.Medium || 0) / 7) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  Low Priority (&lt;50 people)
                </span>
                <span className="font-mono font-bold text-white">
                  {charts.priorityDist.Low || 0}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((charts.priorityDist.Low || 0) / 7) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lifecycle Status Distribution */}
          <div className="pt-3 border-t border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Dispatch Pipeline
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-gray-800/60 rounded border border-gray-750">
                <span className="text-xs text-gray-400 block">Pending</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {charts.statusDist.Pending || 0}
                </span>
              </div>
              <div className="p-2 bg-gray-800/60 rounded border border-gray-750">
                <span className="text-xs text-gray-400 block">Allocated</span>
                <span className="text-base font-bold font-mono text-purple-400">
                  {charts.statusDist.Allocated || 0}
                </span>
              </div>
              <div className="p-2 bg-gray-800/60 rounded border border-gray-750">
                <span className="text-xs text-gray-400 block">In Transit</span>
                <span className="text-base font-bold font-mono text-blue-400">
                  {charts.statusDist.InTransit || 0}
                </span>
              </div>
              <div className="p-2 bg-gray-800/60 rounded border border-gray-750">
                <span className="text-xs text-gray-400 block">Delivered</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {charts.statusDist.Delivered || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shelter Occupancy & Load Balancing */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Shelter Occupancy & Capacity
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('shelters')}
              className="text-[11px] text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-4">
            {charts.shelters.map((shl, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-200 truncate max-w-[180px]">
                    {shl.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-300">
                      {shl.occupied}/{shl.capacity}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        shl.percent >= 95
                          ? 'bg-red-900/60 text-red-300 border border-red-700/60'
                          : shl.percent >= 60
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                          : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                      }`}
                    >
                      {shl.percent}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      shl.percent >= 95
                        ? 'bg-red-500'
                        : shl.percent >= 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, shl.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Shelter Load Balancing Notice */}
          <div className="p-3 bg-gray-850 rounded-lg border border-gray-750 text-xs text-gray-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Dynamic Overflow Policy Active: </span>
              If Shelter S-02 reaches 100% capacity, incoming evacuees are auto-diverted to S-03 (Siddhartha College, 390 beds available).
            </div>
          </div>
        </div>

        {/* Resources Available by Category */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Relief Supplies Inventory
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('resources')}
              className="text-[11px] text-blue-400 hover:underline"
            >
              Depots
            </button>
          </div>

          <div className="space-y-3">
            {charts.resourcesByCategory.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-gray-850 rounded-lg border border-gray-750 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="font-semibold text-white">{res.category} Relief</span>
                </div>
                <div className="font-mono text-purple-300 font-bold text-sm">
                  {res.count.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">available</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-900/60 text-xs text-blue-200 flex items-center justify-between">
            <span>Participating Agencies:</span>
            <span className="font-mono font-bold text-white">NDRF • Red Cross • Seva Dal</span>
          </div>
        </div>
      </div>

      {/* Live Operations & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Emergency Operations */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Active Operations & Deliveries
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tracking')}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Live GPS Map</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-gray-850 rounded-lg border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Operation OP-101 / OP-102
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  EN ROUTE (18 min)
                </span>
              </div>
              <p className="text-xs text-gray-300">
                <strong>Payload: </strong> 50 Emergency Medical Kits + 100 Drinking Water Units
              </p>
              <div className="text-[11px] text-gray-400 grid grid-cols-2 gap-2 pt-1 border-t border-gray-800">
                <div>Vehicle: <strong>Ambulance AMB-01</strong></div>
                <div>Team: <strong>NDRF Medical Alpha</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Audit Log Stream */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Recent Audit Trail Stream
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {(stats?.recentActivity || []).slice(0, 5).map((log, i) => (
              <div key={i} className="p-2.5 bg-gray-850 rounded border border-gray-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-200">{log.action}</span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  <span className="text-blue-300 font-medium">{log.userRole}</span>: {log.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Situation Report Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-indigo-500/60 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-gray-100 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 px-6 py-4 border-b border-indigo-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/30 rounded-lg border border-indigo-500/50 text-indigo-300">
                  <Bot className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold block">
                    AI TACTICAL COMMAND INTELLIGENCE
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Autonomous Situation Report (SitRep)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {generatingAi ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-xs text-gray-300 font-medium">
                    Synthesizing real-time disaster telemetry with GenAI reasoning...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] pb-2 border-b border-gray-800 text-gray-400">
                    <span>
                      Generated Engine: <strong className="text-indigo-300">{aiSitrep?.source || 'Gemini AI'}</strong>
                    </span>
                    <span className="font-mono text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {aiSitrep?.sitrep}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-950 px-6 py-3.5 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Ground telemetry verified with National Relief Authority
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAiSitrep}
                  disabled={generatingAi}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 text-xs font-medium border border-gray-700 transition-colors"
                >
                  Regenerate SitRep
                </button>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
