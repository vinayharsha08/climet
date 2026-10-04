import React from 'react';
import { Wifi, Battery } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [time, setTime] = React.useState('09:41');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-950 text-gray-200 px-6 pt-2 pb-1.5 flex items-center justify-between text-xs select-none sticky top-0 z-50 border-b border-gray-900/60">
      <span className="font-semibold tracking-tight text-[13px]">{time}</span>

      {/* Dynamic Island / Camera Notch */}
      <div className="w-24 h-4 bg-black rounded-full border border-gray-800/80 mx-auto hidden sm:block"></div>

      <div className="flex items-center gap-1.5 text-gray-300">
        <span className="text-[10px] font-bold font-mono">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  );
};
