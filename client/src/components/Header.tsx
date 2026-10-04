import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  Bell,
  RefreshCw,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Radio,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  Smartphone,
  Monitor,
  Menu,
} from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  isMobileMode?: boolean;
  onToggleMobileMode?: () => void;
  onOpenMobileDrawer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileMode,
  onToggleMobileMode,
  onOpenMobileDrawer,
}) => {
  const {
    role,
    setRole,
    alerts,
    unreadAlertCount,
    markAlertRead,
    resetDemo,
    loading,
    refreshData,
    startTour,
    tourStep,
    setBlockageModalData,
    setShortageModalData,
    setActiveTab,
  } = useEmergency();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSimulatingBlockage, setIsSimulatingBlockage] = useState(false);
  const [isSimulatingShortage, setIsSimulatingShortage] = useState(false);

  const roles: { role: UserRole; label: string; icon: string; badge: string }[] = [
    { role: 'Command Center Admin', label: 'Command Center Admin', icon: '🛡️', badge: 'Full Control' },
    { role: 'Organization Manager', label: 'Organization Manager', icon: '🏢', badge: 'Inventory & Fleet' },
    { role: 'Field Officer', label: 'Field Officer', icon: '📍', badge: 'Requests & Ground' },
    { role: 'Response Team', label: 'Response Team', icon: '🚑', badge: 'Missions & Status' },
  ];

  const handleSimulateBlockage = async () => {
    setIsSimulatingBlockage(true);
    try {
      const result = await api.simulateRoadBlockage(undefined, role);
      setBlockageModalData(result);
      await refreshData();
      setActiveTab('tracking');
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingBlockage(false);
    }
  };

  const handleSimulateShortage = async () => {
    setIsSimulatingShortage(true);
    try {
      const result = await api.simulateResourceShortage(
        { resourceType: 'Food Packets', quantity: 800 },
        role
      );
      setShortageModalData(result);
      await refreshData();
      setActiveTab('resources');
    } catch (err: any) {
      alert(`Shortage simulation error: ${err.message}`);
    } finally {
      setIsSimulatingShortage(false);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 text-gray-100">
      {/* Top Banner: Scenario Status */}
      <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-b border-red-800/40 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="font-bold tracking-wide text-red-200">ACTIVE DISASTER PROTOCOL:</span>
          <span className="bg-red-900/80 text-red-200 px-2 py-0.5 rounded font-mono font-medium border border-red-700/50">
            Vijayawada Flood Emergency – 2026
          </span>
          <span className="hidden md:inline text-red-300/80">|</span>
          <span className="hidden md:inline text-red-300/90 font-medium">
            Prakasam Barrage Inflow: <strong className="text-white">4.8 Lakh Cusecs</strong> (+2.8m above Danger Mark)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-red-200/90">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>State Command Grid: <strong>LIVE SYNC</strong></span>
          </span>
          <span className="text-gray-400 font-mono text-[11px]">
            {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 border border-blue-500/40 p-2 rounded-lg text-blue-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">NERCP</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 font-semibold">
                National Platform
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              National Emergency Resource & Relief Coordination Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Simulation Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile / Desktop View Toggle */}
          {onToggleMobileMode && (
            <button
              onClick={onToggleMobileMode}
              title={isMobileMode ? "Switch to Full Desktop View" : "Preview Mobile Phone Interface"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                isMobileMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
              }`}
            >
              {isMobileMode ? <Monitor className="w-3.5 h-3.5 text-emerald-400" /> : <Smartphone className="w-3.5 h-3.5 text-blue-400" />}
              <span className="hidden sm:inline">{isMobileMode ? 'Desktop View' : 'Mobile View'}</span>
            </button>
          )}

          {/* Quick Simulation: Road Blockage (Desktop) */}
          <button
            onClick={handleSimulateBlockage}
            disabled={isSimulatingBlockage}
            title="Simulate flash flood road obstruction and automatic detour"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Simulate</span> Blockage
          </button>

          {/* Quick Simulation: Resource Shortage (Desktop) */}
          <button
            onClick={handleSimulateShortage}
            disabled={isSimulatingShortage}
            title="Simulate resource deficit and multi-org recommendation"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Simulate</span> Shortage
          </button>

          {/* Interactive Guided Tour Launcher */}
          <button
            onClick={startTour}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tourStep !== null
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                : 'bg-blue-950/60 text-blue-300 border border-blue-600/40 hover:bg-blue-900/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Tour</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[120px] truncate">{role}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                  Switch Active Role (RBAC)
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setRole(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-800 transition-colors ${
                      role === r.role ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500' : 'text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{r.icon}</span>
                      <span>{r.label}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {r.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 rounded-md bg-gray-800 hover:bg-gray-750 text-gray-300 border border-gray-700 transition-colors"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-200">Emergency Alerts & Dispatches</span>
                  <span className="text-[11px] text-gray-400">{alerts.length} total</span>
                </div>
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No active alerts</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 text-xs hover:bg-gray-800/60 transition-colors ${
                          !alert.read ? 'bg-gray-850/80 border-l-2 border-blue-500' : 'opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`font-semibold ${
                              alert.type === 'critical'
                                ? 'text-red-400'
                                : alert.type === 'warning'
                                ? 'text-amber-400'
                                : alert.type === 'success'
                                ? 'text-emerald-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {alert.title}
                          </span>
                          {!alert.read && (
                            <button
                              onClick={() => markAlertRead(alert.id)}
                              className="text-[10px] text-blue-400 hover:underline shrink-0"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 mt-1 text-[11px] leading-relaxed">{alert.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={resetDemo}
            disabled={loading}
            title="Reset system to fresh demo data"
            className="p-2 rounded-md bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-gray-200 border border-gray-700 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Mobile Menu Hamburger */}
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden p-2 rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/40 transition-colors"
              title="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
