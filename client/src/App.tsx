import React from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GuidedTour } from './components/GuidedTour';
import { RoadBlockageModal } from './components/RoadBlockageModal';
import { ShortageModal } from './components/ShortageModal';
import { ShelterModal } from './components/ShelterModal';
import { ExplanationModal } from './components/ExplanationModal';

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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans">
      <Header />
      <GuidedTour />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <RoadBlockageModal />
      <ShortageModal />
      <ShelterModal />
      <ExplanationModal />
    </div>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <MainContent />
    </EmergencyProvider>
  );
}
