import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  LayoutDashboard,
  AlertOctagon,
  FileSpreadsheet,
  Boxes,
  Cpu,
  Truck,
  Home,
  Navigation,
  History,
  CheckCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, role, stats } = useEmergency();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Command Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'National situational KPIs & telemetry',
    },
    {
      id: 'incidents',
      label: 'Incidents & Zones',
      icon: Flame,
      badge: stats?.kpis?.activeIncidents || 3,
      desc: 'Vijayawada Flood Zones A, B, C',
    },
    {
      id: 'requests',
      label: 'Emergency Requests',
      icon: FileSpreadsheet,
      badge: stats?.kpis?.criticalRequests ? `${stats.kpis.criticalRequests} Crit` : '10',
      badgeColor: 'bg-red-900/60 text-red-300 border-red-700/60',
      desc: 'Triage & priority classification',
    },
    {
      id: 'resources',
      label: 'Resource Inventory',
      icon: Boxes,
      badge: stats?.kpis?.totalResourcesAvailable ? `${stats.kpis.totalResourcesAvailable}` : null,
      badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700/60',
      desc: 'Depots across 3 relief orgs',
    },
    {
      id: 'allocation',
      label: 'Allocation Engine',
      icon: Cpu,
      badge: 'Explainable',
      badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700/60',
      desc: 'Evidence-based matching engine',
    },
    {
      id: 'teams',
      label: 'Teams & Vehicles',
      icon: Truck,
      badge: `${stats?.kpis?.availableVehicles || 5} Fleet`,
      desc: 'NDRF, Red Cross & Seva Dal squads',
    },
    {
      id: 'shelters',
      label: 'Shelters Management',
      icon: Home,
      badge: stats?.kpis?.shelterOccupancyRate ? `${stats.kpis.shelterOccupancyRate}%` : '85%',
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/60',
      desc: 'Capacities & redirect load-balancing',
    },
    {
      id: 'tracking',
      label: 'Live Tracking Map',
      icon: Navigation,
      badge: stats?.kpis?.activeDeliveries ? `${stats.kpis.activeDeliveries} Active` : '1 Active',
      badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60',
      desc: 'Simulated routes & hazard divert',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      badge: null,
      desc: 'Chronological immutable system log',
    },
  ];

  // Role permissions breakdown
  const roleCapabilities: Record<string, string[]> = {
    'Command Center Admin': [
      'Full administrative override',
      'Allocate resources & dispatch teams',
      'Change request priority & reroute',
      'View immutable audit log',
    ],
    'Organization Manager': [
      'Add & update depot stock',
      'Manage assigned teams & vehicles',
      'Review organization request queue',
    ],
    'Field Officer': [
      'Create emergency distress requests',
      'Report road blockages & hazards',
      'Update flood water telemetry',
    ],
    'Response Team': [
      'View active dispatch missions',
      'Update transit status (En Route)',
      'Confirm relief delivery completion',
    ],
  };

  return (
    <aside className="hidden md:flex w-64 bg-gray-950 border-r border-gray-800 flex-col justify-between h-[calc(100vh-85px)] sticky top-[85px] select-none shrink-0">
      {/* Navigation Links */}
      <div className="py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Coordination Modules
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                <span className="text-left font-medium">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                    item.badgeColor || 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Context & Capabilities */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-900/60 m-2 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Active Role
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
            RBAC
          </span>
        </div>
        <div className="font-semibold text-xs text-white mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {role}
        </div>
        <ul className="text-[11px] text-gray-400 space-y-1">
          {roleCapabilities[role]?.slice(0, 2).map((cap, i) => (
            <li key={i} className="flex items-start gap-1.5 leading-tight">
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
