import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  LayoutDashboard,
  Navigation,
  FileSpreadsheet,
  Home,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { activeTab, setActiveTab, stats } = useEmergency();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tracking',
      label: 'Live Map',
      icon: Navigation,
      badge: stats?.kpis?.activeDeliveries ? `${stats.kpis.activeDeliveries}` : null,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: FileSpreadsheet,
      badge: stats?.kpis?.criticalRequests ? `${stats.kpis.criticalRequests}` : null,
      badgeColor: 'bg-red-500',
    },
    {
      id: 'shelters',
      label: 'Shelters',
      icon: Home,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-2 py-1.5 flex items-center justify-around safe-area-bottom shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-blue-400 font-semibold scale-105'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              {item.badge && (
                <span
                  className={`absolute -top-1.5 -right-2 text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse ${
                    item.badgeColor || 'bg-blue-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / More Button */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-gray-400 hover:text-gray-200 transition-all active:scale-95"
      >
        <Menu className="w-5 h-5 stroke-2" />
        <span className="text-[10px] mt-1 tracking-tight">More</span>
      </button>
    </nav>
  );
};
