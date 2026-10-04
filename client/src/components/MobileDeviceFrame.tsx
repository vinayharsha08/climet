import React from 'react';
import { MobileStatusBar } from './MobileStatusBar';
import { Monitor, Smartphone, Sparkles, X } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  isSimulated: boolean;
  onToggleSimulation: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  isSimulated,
  onToggleSimulation,
}) => {
  if (!isSimulated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950/90 py-4 px-2 sm:px-4 flex flex-col items-center justify-center relative backdrop-blur-sm">
      {/* Top Banner on Desktop preview */}
      <div className="mb-3 flex items-center justify-between gap-4 w-full max-w-[420px] bg-gray-900/90 border border-gray-800 px-3 py-1.5 rounded-full text-xs text-gray-300 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">Mobile Interface Preview</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
            Localhost
          </span>
        </div>
        <button
          onClick={onToggleSimulation}
          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium hover:underline"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Exit to Desktop</span>
        </button>
      </div>

      {/* Realistic Smartphone Chassis */}
      <div className="w-full max-w-[412px] h-[860px] max-h-[92vh] bg-gray-950 rounded-[44px] border-[8px] border-gray-800 shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative ring-1 ring-gray-700/50">
        {/* Native Mobile Status Bar */}
        <MobileStatusBar />

        {/* Inner Scrollable Phone Screen */}
        <div className="flex-1 overflow-y-auto flex flex-col relative bg-gray-950 custom-scrollbar">
          {children}
        </div>

        {/* Bottom Home Indicator Pill */}
        <div className="w-full py-1.5 bg-gray-950 flex justify-center items-center select-none z-50">
          <div className="w-32 h-1 bg-gray-600/80 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
