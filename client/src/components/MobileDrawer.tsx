import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { UserRole } from '../types';
import {
  X,
  LayoutDashboard,
  Flame,
  FileSpreadsheet,
  Boxes,
  Cpu,
  Truck,
  Home,
  Navigation,
  History,
  AlertTriangle,
  Sparkles,
  Bot,
  RotateCcw,
  UserCheck,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiSitrep?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAiSitrep,
}) => {
  const {
    activeTab,
    setActiveTab,
    role,
    setRole,
    stats,
    resetDemo,
    loading,
    setBlockageModalData,
    setShortageModalData,
    refreshData,
  } = useEmergency();

  const [isSimulatingBlockage, setIsSimulatingBlockage] = React.useState(false);
  const [isSimulatingShortage, setIsSimulatingShortage] = React.useState(false);

  if (!isOpen) return null;

  const roles: { role: UserRole; label: string; icon: string }[] = [
    { role: 'Command Center Admin', label: 'Admin (Full)', icon: '🛡️' },
    { role: 'Organization Manager', label: 'Org Manager', icon: '🏢' },
    { role: 'Field Officer', label: 'Field Officer', icon: '📍' },
    { role: 'Response Team', label: 'Response Team', icon: '🚑' },
  ];

  const allModules = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'tracking', label: 'Live Tracking Map', icon: Navigation, badge: `${stats?.kpis?.activeDeliveries || 1} En Route` },
    { id: 'requests', label: 'Emergency Requests', icon: FileSpreadsheet, badge: `${stats?.kpis?.criticalRequests || 2} Critical` },
    { id: 'shelters', label: 'Shelters & Relief Camps', icon: Home, badge: `${stats?.kpis?.shelterOccupancyRate || 61}%` },
    { id: 'incidents', label: 'Incidents & Flood Zones', icon: Flame, badge: `${stats?.kpis?.activeIncidents || 3} Zones` },
    { id: 'resources', label: 'Depot Inventories', icon: Boxes, badge: `${stats?.kpis?.totalResourcesAvailable || 1843} units` },
    { id: 'allocation', label: 'Allocation Engine', icon: Cpu, badge: 'Explainable' },
    { id: 'teams', label: 'Teams & Rescue Fleet', icon: Truck, badge: `${stats?.kpis?.availableVehicles || 5} Fleet` },
    { id: 'audit', label: 'Immutable Audit Trail', icon: History, badge: null },
  ];

  const handleSimulateBlockage = async () => {
    setIsSimulatingBlockage(true);
    try {
      const res = await api.simulateRoadBlockage(undefined, role);
      setBlockageModalData(res);
      await refreshData();
      setActiveTab('tracking');
      onClose();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingBlockage(false);
    }
  };

  const handleSimulateShortage = async () => {
    setIsSimulatingShortage(true);
    try {
      const res = await api.simulateResourceShortage(
        { resourceType: 'Food Packets', quantity: 800 },
        role
      );
      setShortageModalData(res);
      await refreshData();
      setActiveTab('resources');
      onClose();
    } catch (err: any) {
      alert(`Shortage error: ${err.message}`);
    } finally {
      setIsSimulatingShortage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xs sm:max-w-sm bg-gray-950 border-l border-gray-800 h-full flex flex-col shadow-2xl animate-slide-left overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">NERCP Mobile Hub</h2>
              <p className="text-[10px] text-gray-400">Vijayawada Flood Emergency 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Role Selector */}
        <div className="p-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-blue-400" />
              Active Role (RBAC)
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] font-medium transition-all text-left ${
                  role === r.role
                    ? 'bg-blue-600 text-white font-semibold shadow-sm ring-1 ring-blue-400'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-850 border border-gray-800'
                }`}
              >
                <span>{r.icon}</span>
                <span className="truncate">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Simulation Quick Actions */}
        <div className="p-3 border-b border-gray-800 bg-gray-900/30">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            ⚡ Quick Simulations
          </span>
          <div className="space-y-1.5">
            <button
              onClick={handleSimulateBlockage}
              disabled={isSimulatingBlockage}
              className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/40 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Simulate Road Blockage</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400/60" />
            </button>

            <button
              onClick={handleSimulateShortage}
              disabled={isSimulatingShortage}
              className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/60 hover:bg-purple-900/40 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Simulate Supply Shortage</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400/60" />
            </button>

            {onOpenAiSitrep && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiSitrep();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold bg-blue-950/50 text-blue-300 border border-blue-800/60 hover:bg-blue-900/50 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>AI Disaster Situation Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400/60" />
              </button>
            )}
          </div>
        </div>

        {/* All Modules List */}
        <div className="p-3 flex-1 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            All Coordination Modules
          </span>
          {allModules.map((m) => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveTab(m.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{m.label}</span>
                </div>
                {m.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 font-mono">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Demo Reset */}
        <div className="p-3 border-t border-gray-800 bg-gray-900 sticky bottom-0">
          <button
            onClick={() => {
              resetDemo();
              onClose();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-750 text-gray-300 border border-gray-700 transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Demo to Initial State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
