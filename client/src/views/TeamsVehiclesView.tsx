import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { ResponseTeam, Vehicle } from '../types';
import { api } from '../services/api';
import {
  Users,
  Truck,
  Shield,
  Activity,
  MapPin,
  CheckCircle2,
  AlertCircle,
  BatteryCharging,
  Fuel,
  Compass,
} from 'lucide-react';

export const TeamsVehiclesView: React.FC = () => {
  const { role, setExplanationModalData } = useEmergency();
  const [teams, setTeams] = useState<ResponseTeam[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'teams' | 'vehicles'>('teams');

  const loadData = async () => {
    try {
      const [teamsData, vehiclesData] = await Promise.all([api.getTeams(), api.getVehicles()]);
      setTeams(teamsData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Error loading teams & vehicles:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const explainTeam = (team: ResponseTeam) => {
    setExplanationModalData({
      title: `Team Profile: ${team.name}`,
      subtitle: `${team.teamType} Specialist Unit with ${team.membersCount} crew members under ${team.leader}.`,
      tags: [team.availability, `${team.skills.length} Certified Skills`, team.workload],
      items: [
        `✓ Assigned Squad Leader: ${team.leader}`,
        `✓ Operational Status: ${team.availability}`,
        `✓ Current Workload: ${team.workload}`,
        `✓ Field Skills: ${team.skills.join(', ')}`,
        `✓ Base Station: ${team.currentLocation}`,
      ],
    });
  };

  const explainVehicle = (veh: Vehicle) => {
    setExplanationModalData({
      title: `Vehicle Specifications: ${veh.name}`,
      subtitle: `${veh.vehicleType} assigned to disaster relief operations in Vijayawada sector.`,
      tags: [veh.status, `Capacity: ${veh.capacity} ${veh.capacityUnit}`, `Fuel: ${veh.fuelLevel}%`],
      items: [
        `✓ Assigned Driver: ${veh.driver}`,
        `✓ Rated Payload Capacity: ${veh.capacity} ${veh.capacityUnit}`,
        `✓ Current Location: ${veh.currentLocation}`,
        `✓ Status: ${veh.status}`,
        veh.destination ? `✓ En route to: ${veh.destination} (ETA: ${veh.eta})` : '✓ Available for rapid dispatch',
      ],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>Response Teams & Fleet Management</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Tactical squads, certified medics, specialized boats & heavy transport assets
          </p>
        </div>

        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'teams' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Response Teams ({teams.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('vehicles')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'vehicles' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Vehicles & Fleet ({vehicles.length})</span>
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {team.id}
                    </span>
                    <span className="text-xs font-bold text-blue-400">{team.teamType} Unit</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{team.name}</h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    team.availability === 'Available'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}
                >
                  {team.availability.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-gray-300 space-y-1">
                <div>Leader: <strong className="text-white">{team.leader}</strong> ({team.membersCount} specialists)</div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>{team.currentLocation}</span>
                </div>
              </div>

              {/* Skills Badges */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                  Certified Rescue Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {team.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] bg-gray-850 text-gray-300 border border-gray-750"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Workload */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  Workload: <strong className="text-gray-200">{team.workload}</strong>
                </span>

                <button
                  onClick={() => explainTeam(team)}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  Explain Qualifications
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicles Grid */}
      {activeSubTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-5 shadow-sm space-y-3.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-gray-400">{veh.id}</div>
                  <h3 className="text-sm font-bold text-white mt-0.5">{veh.name}</h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    veh.status === 'Available'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : veh.status === 'Route Blocked'
                      ? 'bg-red-950/60 text-red-300 border-red-800'
                      : 'bg-blue-950/60 text-blue-300 border-blue-800'
                  }`}
                >
                  {veh.status}
                </span>
              </div>

              <div className="p-3 bg-gray-850 rounded-lg border border-gray-750 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="font-semibold text-white">{veh.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payload Capacity:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {veh.capacity} {veh.capacityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Driver:</span>
                  <span className="text-gray-200">{veh.driver}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-800">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-400" /> Fuel Reserve:
                  </span>
                  <span className="font-mono text-gray-200 font-semibold">{veh.fuelLevel}%</span>
                </div>
              </div>

              {veh.destination && (
                <div className="p-2.5 bg-blue-950/40 rounded border border-blue-900/60 text-xs text-blue-200 space-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">
                    Active Mission Transit
                  </div>
                  <div>Destination: <strong>{veh.destination}</strong></div>
                  <div className="text-amber-300 font-mono">ETA: {veh.eta || '18 mins'}</div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500 text-[11px] truncate max-w-[160px]">
                  {veh.currentLocation}
                </span>
                <button
                  onClick={() => explainVehicle(veh)}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  Vehicle Specs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
