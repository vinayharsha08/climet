import React, { useState, useEffect } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GuidedTour } from './components/GuidedTour';
import { RoadBlockageModal } from './components/RoadBlockageModal';
import { ShortageModal } from './components/ShortageModal';
import { ShelterModal } from './components/ShelterModal';
import { ExplanationModal } from './components/ExplanationModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';

// Views
import { DashboardView } from './views/DashboardView';
import { IncidentsView } from './views/IncidentsView';
import { RequestsView } from './views/RequestsView';
import { InventoryView } from './views/InventoryView';
import { AllocationEngineView } from './views/AllocationEngineView';
import { TeamsVehiclesView } from './views/TeamsVehiclesView';
import { SheltersView } from './views/SheltersView';
import { TrackingView } from './views/TrackingView';
import { AuditTrailView } from './views/AuditTrailView';

const MainContent: React.FC = () => {
  const { activeTab } = useEmergency();

  // Mobile mode: false by default so PC opens in full desktop mode, phones adapt naturally
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [isNativeMobile, setIsNativeMobile] = useState<boolean>(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState<boolean>(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsNativeMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'incidents':
        return <IncidentsView />;
      case 'requests':
        return <RequestsView />;
      case 'resources':
        return <InventoryView />;
      case 'allocation':
        return <AllocationEngineView />;
      case 'teams':
        return <TeamsVehiclesView />;
      case 'shelters':
        return <SheltersView />;
      case 'tracking':
        return <TrackingView />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <DashboardView />;
    }
  };

  const appBody = (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans relative">
      <Header
        isMobileMode={isMobileMode}
        onToggleMobileMode={() => setIsMobileMode(!isMobileMode)}
        onOpenMobileDrawer={() => setShowMobileDrawer(true)}
      />
      <GuidedTour />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar automatically renders on desktop when not in simulated phone view */}
        {!isMobileMode && <Sidebar />}

        <main
          className={`flex-1 overflow-y-auto bg-gray-950 p-3 sm:p-5 md:p-6 lg:p-8 ${
            isMobileMode || isNativeMobile ? 'pb-24' : 'pb-8'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {(isMobileMode || isNativeMobile) && (
        <MobileBottomNav
          onOpenMenu={() => setShowMobileDrawer(true)}
          isSimulated={isMobileMode && !isNativeMobile}
        />
      )}

      {/* Mobile Drawer (Accessible from bottom nav "More" or header hamburger) */}
      <MobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
      />

      {/* Global Modals */}
      <RoadBlockageModal />
      <ShortageModal />
      <ShelterModal />
      <ExplanationModal />
    </div>
  );

  return (
    <MobileDeviceFrame
      isSimulated={isMobileMode && !isNativeMobile}
      onToggleSimulation={() => setIsMobileMode(false)}
    >
      {appBody}
    </MobileDeviceFrame>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <MainContent />
    </EmergencyProvider>
  );
}
