import React, { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { DeliveryOperation, Incident, Shelter, ResourceInventory, Vehicle } from '../types';
import { api } from '../services/api';
import {
  Navigation,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Truck,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';

export const TrackingView: React.FC = () => {
  const { role, setBlockageModalData, refreshData } = useEmergency();
  const [deliveries, setDeliveries] = useState<DeliveryOperation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<ResourceInventory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const [isSimulatingBlockage, setIsSimulatingBlockage] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const loadData = async () => {
    try {
      const [dList, iList, sList, rList, vList] = await Promise.all([
        api.getDeliveries(),
        api.getIncidents(),
        api.getShelters(),
        api.getResources(),
        api.getVehicles(),
      ]);
      setDeliveries(dList);
      setIncidents(iList);
      setShelters(sList);
      setResources(rList);
      setVehicles(vList);
      if (!selectedOpId && dList.length > 0) {
        setSelectedOpId(dList[0].id);
      }
    } catch (err) {
      console.error('Error loading tracking data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Vijayawada
      const map = L.map(mapContainerRef.current, {
        center: [16.518, 80.62],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Dark Matter tile layer
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CartoDB & OpenStreetMap',
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers/markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // 1. Plot Incidents (Red pulsating beacons)
    incidents.forEach((inc) => {
      const icon = L.divIcon({
        className: 'custom-incident-marker',
        html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(239,68,68,0.9);"><span style="font-size: 11px;">⚠️</span></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([inc.coordinates.lat, inc.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 12px; font-family: sans-serif;">
            <strong style="color: #ef4444;">${inc.name}</strong><br/>
            <span>Severity: ${inc.severity} (${inc.zone})</span><br/>
            <span>Affected: ${inc.affectedPopulation} citizens</span><br/>
            <span>Water level: ${inc.waterLevel}</span>
          </div>
        `);
    });

    // 2. Plot Shelters (Green markers)
    shelters.forEach((shl) => {
      const icon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(16,185,129,0.8);"><span style="font-size: 10px;">🏠</span></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([shl.coordinates.lat, shl.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 12px; font-family: sans-serif;">
            <strong style="color: #10b981;">${shl.name}</strong><br/>
            <span>Occupancy: ${shl.occupied} / ${shl.capacity}</span><br/>
            <span>Status: ${shl.status}</span>
          </div>
        `);
    });

    // 3. Plot Warehouses / Depots (Blue markers)
    const plottedWarehouses = new Set();
    resources.forEach((res) => {
      if (plottedWarehouses.has(res.warehouseLocation)) return;
      plottedWarehouses.add(res.warehouseLocation);

      const icon = L.divIcon({
        className: 'custom-warehouse-marker',
        html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(59,130,246,0.8);"><span style="font-size: 10px;">📦</span></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([res.coordinates.lat, res.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 12px; font-family: sans-serif;">
            <strong style="color: #3b82f6;">${res.warehouseLocation}</strong><br/>
            <span>${res.orgName}</span>
          </div>
        `);
    });

    // 4. Plot Delivery Operations, Routes and Vehicles
    const activeOp = deliveries.find((d) => d.id === selectedOpId) || deliveries[0];
    if (activeOp) {
      const latlngs: [number, number][] = activeOp.waypoints.map((w) => [w.lat, w.lng]);

      if (activeOp.isBlocked) {
        // Red dashed line for blocked sector
        L.polyline(latlngs.slice(0, 2), {
          color: '#ef4444',
          dashArray: '8, 8',
          weight: 4,
          opacity: 0.9,
        }).addTo(map);

        // Alternative bypass route (green line)
        const detourLatLngs: [number, number][] = [
          [activeOp.waypoints[0].lat, activeOp.waypoints[0].lng],
          [16.511, 80.62], // Kanaka Durga viaduct junction
          [16.516, 80.605], // Elevated bypass
          [activeOp.waypoints[activeOp.waypoints.length - 1].lat, activeOp.waypoints[activeOp.waypoints.length - 1].lng],
        ];
        L.polyline(detourLatLngs, {
          color: '#10b981',
          weight: 5,
          opacity: 0.9,
        }).addTo(map);
      } else {
        // Normal blue route polyline
        L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.85,
        }).addTo(map);
      }

      // Waypoint checkpoints
      activeOp.waypoints.forEach((wp, idx) => {
        let color = '#3b82f6';
        let symbol = '📍';
        if (wp.status === 'passed') {
          color = '#10b981';
          symbol = '✓';
        } else if (wp.status === 'blocked') {
          color = '#ef4444';
          symbol = '✕';
        }

        const icon = L.divIcon({
          className: 'custom-waypoint',
          html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid #111827;">${symbol}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        L.marker([wp.lat, wp.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>Checkpoint ${idx + 1}:</b> ${wp.name}<br/>Status: ${wp.status}`);
      });

      // Active Vehicle marker
      const currentWpIndex = Math.min(
        activeOp.currentWayPointIndex || 1,
        activeOp.waypoints.length - 1
      );
      const vehiclePos = activeOp.waypoints[currentWpIndex];

      if (vehiclePos) {
        const vehIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `<div style="background-color: #f59e0b; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(245,158,11,1);"><span style="font-size: 14px;">🚚</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([vehiclePos.lat, vehiclePos.lng], { icon: vehIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-size: 12px; font-family: sans-serif;">
              <strong style="color: #f59e0b;">${activeOp.vehicleName}</strong><br/>
              <span>Crew: ${activeOp.teamName}</span><br/>
              <span>Carrying: ${activeOp.quantity} ${activeOp.resourceType}</span><br/>
              <span>ETA: ${activeOp.etaMinutes} mins</span>
            </div>
          `);
      }
    }
  }, [deliveries, incidents, shelters, resources, selectedOpId]);

  const activeOp = deliveries.find((d) => d.id === selectedOpId) || deliveries[0];

  const handleSimulateMovement = async () => {
    if (!activeOp) return;
    setIsMoving(true);
    try {
      await api.stepDelivery(activeOp.id);
      await loadData();
      await refreshData();
    } catch (err: any) {
      alert(`Movement error: ${err.message}`);
    } finally {
      setIsMoving(false);
    }
  };

  const handleSimulateBlockage = async () => {
    if (!activeOp) return;
    setIsSimulatingBlockage(true);
    try {
      const res = await api.simulateRoadBlockage(activeOp.id, role);
      setBlockageModalData(res);
      await loadData();
      await refreshData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulatingBlockage(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Live Operations Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <span>Live Geospatial Tracking & Fleet Telemetry</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Simulated GPS waypoints, dynamic rerouting & flood hazard mitigation
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateMovement}
            disabled={isMoving || activeOp?.status === 'Delivered'}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Vehicle Movement</span>
          </button>

          <button
            onClick={handleSimulateBlockage}
            disabled={isSimulatingBlockage || activeOp?.isBlocked}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-lg text-xs font-bold shadow transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Road Blockage</span>
          </button>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg relative h-[380px] sm:h-[480px] lg:h-[580px]">
          {/* Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Badge & Legend */}
          <div className="hidden sm:block absolute top-3 left-3 z-20 bg-gray-900/90 backdrop-blur-md p-3 rounded-lg border border-gray-750 text-xs shadow-xl space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
              MAP LEGEND & SECTORS
            </span>
            <div className="flex items-center gap-2 text-gray-200">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Flood Incident (Zones A, B, C)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Supply Depots (Warehouses)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Evacuation Shelters</span>
            </div>
            <div className="flex items-center gap-2 text-gray-200">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Active Relief Vehicle</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Active Operation Mission Status */}
        <div className="space-y-4">
          {activeOp ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {activeOp.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">
                    {activeOp.vehicleName}
                  </h3>
                  <span className="text-xs text-blue-400 font-medium">
                    Squad: {activeOp.teamName}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeOp.status === 'Route Blocked'
                      ? 'bg-red-900/60 text-red-300 border-red-800'
                      : activeOp.status === 'Rerouted'
                      ? 'bg-amber-900/60 text-amber-300 border-amber-800'
                      : activeOp.status === 'Delivered'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-blue-950/60 text-blue-300 border-blue-800'
                  }`}
                >
                  {activeOp.status.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 p-3 bg-gray-850 rounded-lg border border-gray-750">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Mission Progress:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {activeOp.progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${activeOp.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                  <span>Estimated Arrival:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {activeOp.etaMinutes} minutes
                  </span>
                </div>
              </div>

              {/* Active Route Details */}
              <div className="text-xs space-y-1.5 bg-gray-950 p-3 rounded-lg border border-gray-800">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                  Active Corridor
                </span>
                <p className="text-white font-medium">{activeOp.activeRoute}</p>
                {activeOp.rerouteReason && (
                  <p className="text-amber-300 text-[11px] italic pt-1 border-t border-gray-800">
                    {activeOp.rerouteReason}
                  </p>
                )}
              </div>

              {/* Waypoints Sequence */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                  Route Checkpoints
                </span>
                <div className="space-y-2">
                  {activeOp.waypoints.map((wp, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        wp.status === 'passed'
                          ? 'bg-emerald-950/20 border-emerald-800 text-gray-300'
                          : wp.status === 'blocked'
                          ? 'bg-red-950/30 border-red-800 text-red-200'
                          : 'bg-gray-850 border-gray-750 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold font-mono ${
                            wp.status === 'passed'
                              ? 'bg-emerald-600 text-white'
                              : wp.status === 'blocked'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {wp.status === 'passed' ? '✓' : wp.status === 'blocked' ? '✕' : i + 1}
                        </span>
                        <span className="font-medium text-white">{wp.name}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold">
                        {wp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cargo Manifest */}
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex justify-between">
                <span>Relief Consignment:</span>
                <span className="font-mono font-bold text-white">
                  {activeOp.quantity} {activeOp.resourceType}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-gray-900 rounded-xl border border-gray-800">
              No active deliveries in transit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
