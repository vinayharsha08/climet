import React from 'react';
import { useEmergency } from '../context/EmergencyContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';

export const GuidedTour: React.FC = () => {
  const {
    tourStep,
    nextTourStep,
    prevTourStep,
    endTour,
    setActiveTab,
    setSelectedRequestId,
    setBlockageModalData,
    setShortageModalData,
    setExplanationModalData,
    refreshData,
    role,
  } = useEmergency();

  if (tourStep === null) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'STEP 1: Open Command Dashboard',
      description:
        'Review the centralized emergency command dashboard: National KPI metrics, active alerts, shelter occupancy gauges, and live activity ticker for the Vijayawada flood disaster.',
      actionLabel: 'View Command Dashboard',
      action: () => {
        setActiveTab('dashboard');
      },
    },
    {
      step: 2,
      title: 'STEP 2: Show Active Flood Incident',
      description:
        'Inspect the primary disaster incident: Bhavanipuram Low-Lying Inundation (Zone A) where Krishna river flood discharge reached +2.8m above danger mark affecting 1,200 citizens.',
      actionLabel: 'Inspect Flood Incidents',
      action: () => {
        setActiveTab('incidents');
      },
    },
    {
      step: 3,
      title: 'STEP 3: Open Emergency Requests',
      description:
        'Navigate to the Request Management module. Notice automated priority classification (Critical, High, Medium, Low) powered by explainable triage rules based on population and urgency.',
      actionLabel: 'Open Requests Queue',
      action: () => {
        setActiveTab('requests');
      },
    },
    {
      step: 4,
      title: 'STEP 4: Select Critical Medical Request',
      description:
        'Select request REQ-101: 50 Emergency Medical Kits needed for 620 affected people at Bhavanipuram Health Post. Notice explainable priority reason: (>500 people + medical = Critical).',
      actionLabel: 'Select REQ-101 for Allocation',
      action: () => {
        setSelectedRequestId('REQ-101');
        setActiveTab('allocation');
      },
    },
    {
      step: 5,
      title: 'STEP 5: Show Available Medical Teams, Ambulance & Stock',
      description:
        'Review matching candidate medical response teams (NDRF Medical Alpha), certified Life Support Ambulances (AMB-01), and depot stock in Gunadala & Governorpet.',
      actionLabel: 'Inspect Allocation Workbench',
      action: () => {
        setSelectedRequestId('REQ-101');
        setActiveTab('allocation');
      },
    },
    {
      step: 6,
      title: 'STEP 6: Run Recommendation Engine',
      description:
        'Trigger the automated Explainable Allocation Engine. The system analyzes resource type, required quantity, warehouse proximity, vehicle payload capacity, and team specialty.',
      actionLabel: 'Run Recommendation',
      action: () => {
        setSelectedRequestId('REQ-101');
        setActiveTab('allocation');
      },
    },
    {
      step: 7,
      title: 'STEP 7: Inspect Explainable Evidence Panel',
      description:
        'Review the transparent "Why this allocation?" panel. Verify the 5 evidence criteria: resource match, multi-depot stock, proximity optimization, team certification, and vehicle fit.',
      actionLabel: 'View Evidence Details',
      action: () => {
        setSelectedRequestId('REQ-101');
        setActiveTab('allocation');
      },
    },
    {
      step: 8,
      title: 'STEP 8: Create Assignment & Dispatch Delivery',
      description:
        'Confirm the allocation. The system deducts stock from available inventory, reserves quantities, creates Operation OP-102, transitions vehicle & team to En Route, and logs an audit trail.',
      actionLabel: 'Confirm Dispatch',
      action: async () => {
        try {
          const rec = await api.recommendAllocation('REQ-101');
          await api.assignAllocation({
            requestId: 'REQ-101',
            teamId: rec.recommendedTeam.id,
            vehicleId: rec.recommendedVehicle.id,
            allocationPlan: rec.allocationPlan,
            userRole: role,
          });
          await refreshData();
          setActiveTab('tracking');
        } catch (e: any) {
          // If already assigned, just view tracking
          setActiveTab('tracking');
        }
      },
    },
    {
      step: 9,
      title: 'STEP 9: Show Live Tracking & Simulated Route',
      description:
        'View the dispatched operation OP-102 on the interactive map. The vehicle is plotted with waypoints from Central Logistics Hub along Prakasam Barrage approach toward Zone A.',
      actionLabel: 'View Live Tracking Map',
      action: () => {
        setActiveTab('tracking');
      },
    },
    {
      step: 10,
      title: 'STEP 10: Simulate Road Blockage Hazard',
      description:
        'Trigger the critical live scenario: A flash flood surge breaches the Prakasam Barrage approach road, rendering the active transit corridor impassable!',
      actionLabel: 'Trigger Road Blockage Simulation',
      action: async () => {
        const res = await api.simulateRoadBlockage(undefined, role);
        setBlockageModalData(res);
        await refreshData();
        setActiveTab('tracking');
      },
    },
    {
      step: 11,
      title: 'STEP 11: System Dynamically Adapts & Reroutes',
      description:
        'Observe how the system detects the obstruction, marks the original route unavailable, calculates an alternative bypass corridor via Kanaka Durga Flyover, and updates ETA to 24 min.',
      actionLabel: 'Inspect Rerouted Map Path',
      action: () => {
        setActiveTab('tracking');
      },
    },
    {
      step: 12,
      title: 'STEP 12: Open Road Blockage Evidence Panel',
      description:
        'Inspect the decision panel explaining why the route was modified: "Assignment changed because the original route became unavailable." Clear telemetry and detour evidence.',
      actionLabel: 'View Divert Evidence',
      action: async () => {
        const res = await api.simulateRoadBlockage(undefined, role);
        setBlockageModalData(res);
      },
    },
    {
      step: 13,
      title: 'STEP 13: Open Complete Audit Trail',
      description:
        'Inspect the immutable chronological audit log. Verify the complete lifecycle: Incident created -> Request created -> Priority classified -> Allocation made -> Delivery rerouted with reasons.',
      actionLabel: 'Review Audit History',
      action: () => {
        setActiveTab('audit');
      },
    },
    {
      step: 14,
      title: 'STEP 14: Demonstrate Resource Shortage Simulation',
      description:
        'Execute the second critical stress-test: A massive requirement (800 food packets) exceeding in-city stock. System computes 300 unit deficit and recommends multi-org & Guntur buffer transfer.',
      actionLabel: 'Run Shortage Simulation',
      action: async () => {
        const res = await api.simulateResourceShortage(
          { resourceType: 'Food Packets', quantity: 800 },
          role
        );
        setShortageModalData(res);
        await refreshData();
        setActiveTab('resources');
      },
    },
  ];

  const current = tourSteps[tourStep - 1];

  return (
    <div className="bg-gradient-to-r from-blue-950 via-gray-900 to-blue-950 border-b-2 border-blue-500 shadow-2xl px-4 py-3 sticky top-[41px] z-30 text-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Step Indicator & Title */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shrink-0 border border-blue-400/50 shadow flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP {tourStep} OF 14</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              {current.title}
            </h4>
            <p className="text-xs text-blue-200/90 leading-tight mt-0.5 max-w-3xl">
              {current.description}
            </p>
          </div>
        </div>

        {/* Step Action Button & Navigation Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={current.action}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-md shadow transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{current.actionLabel}</span>
          </button>

          <div className="flex items-center gap-1 ml-2 border-l border-gray-700 pl-2">
            <button
              onClick={prevTourStep}
              disabled={tourStep === 1}
              className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40 transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextTourStep}
              className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{tourStep === 14 ? 'Finish' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={endTour}
              className="p-1.5 rounded bg-gray-800 hover:bg-red-900/60 text-gray-400 hover:text-red-200 transition-colors ml-1"
              title="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
