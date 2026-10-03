import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, DashboardStats, SystemAlert } from '../types';
import { api } from '../services/api';

interface EmergencyContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  stats: DashboardStats | null;
  alerts: SystemAlert[];
  unreadAlertCount: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  resetDemo: () => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
  
  // Guided Tour
  tourStep: number | null;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;

  // Active Modals for Explainability & Simulations
  blockageModalData: any | null;
  setBlockageModalData: (data: any | null) => void;
  shortageModalData: any | null;
  setShortageModalData: (data: any | null) => void;
  shelterModalData: any | null;
  setShelterModalData: (data: any | null) => void;
  explanationModalData: any | null;
  setExplanationModalData: (data: any | null) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('Command Center Admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('REQ-101');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Guided Tour Step (1 to 14)
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Modal states
  const [blockageModalData, setBlockageModalData] = useState<any | null>(null);
  const [shortageModalData, setShortageModalData] = useState<any | null>(null);
  const [shelterModalData, setShelterModalData] = useState<any | null>(null);
  const [explanationModalData, setExplanationModalData] = useState<any | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [dashStats, alertList] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getAlerts().catch(() => []),
      ]);
      if (dashStats) setStats(dashStats);
      if (alertList) setAlerts(alertList);
    } catch (err) {
      console.error('Error refreshing emergency platform data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Periodic refresh every 10 seconds for real-time telemetry
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const resetDemo = async () => {
    setLoading(true);
    try {
      await api.resetData();
      await refreshData();
      setSelectedRequestId('REQ-101');
      setActiveTab('dashboard');
      setTourStep(null);
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  const startTour = () => setTourStep(1);
  const nextTourStep = () => setTourStep((prev) => (prev !== null && prev < 14 ? prev + 1 : null));
  const prevTourStep = () => setTourStep((prev) => (prev !== null && prev > 1 ? prev - 1 : 1));
  const endTour = () => setTourStep(null);

  return (
    <EmergencyContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        selectedRequestId,
        setSelectedRequestId,
        stats,
        alerts,
        unreadAlertCount,
        loading,
        refreshData,
        resetDemo,
        markAlertRead,
        tourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        blockageModalData,
        setBlockageModalData,
        shortageModalData,
        setShortageModalData,
        shelterModalData,
        setShelterModalData,
        explanationModalData,
        setExplanationModalData,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
