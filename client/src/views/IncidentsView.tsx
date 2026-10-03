import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Incident } from '../types';
import { api } from '../services/api';
import {
  Flame,
  Plus,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Activity,
  Layers,
  Droplets,
  Edit2,
  X,
} from 'lucide-react';

export const IncidentsView: React.FC = () => {
  const { role, refreshData } = useEmergency();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // New incident form state
  const [formData, setFormData] = useState({
    name: '',
    disasterType: 'Flood Emergency',
    zone: 'Zone A',
    location: '',
    severity: 'High' as 'Critical' | 'High' | 'Medium' | 'Low',
    affectedPopulation: 300,
    waterLevel: '+1.5m above normal',
    description: '',
  });

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIncident(
        {
          ...formData,
          coordinates: { lat: 16.515, lng: 80.61 },
        },
        role
      );
      setShowCreateModal(false);
      setFormData({
        name: '',
        disasterType: 'Flood Emergency',
        zone: 'Zone A',
        location: '',
        severity: 'High',
        affectedPopulation: 300,
        waterLevel: '+1.5m above normal',
        description: '',
      });
      await loadIncidents();
      await refreshData();
    } catch (err: any) {
      alert(`Error creating incident: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Active' | 'Contained' | 'Resolved') => {
    try {
      await api.updateIncident(id, { status: newStatus, updateReason: `Status marked as ${newStatus}` }, role);
      await loadIncidents();
      await refreshData();
    } catch (err: any) {
      alert(`Error updating incident: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <span>Disaster Incidents & Affected Flood Zones</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Active flood discharge tracking across Krishna river basins in Vijayawada
          </p>
        </div>

        {(role === 'Command Center Admin' || role === 'Field Officer') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Incident</span>
          </button>
        )}
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className={`bg-gray-900 rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
              incident.severity === 'Critical'
                ? 'border-red-600/60 bg-gradient-to-b from-red-950/20 to-gray-900'
                : incident.severity === 'High'
                ? 'border-amber-600/50'
                : 'border-gray-800'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-gray-400 px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                {incident.id}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    incident.severity === 'Critical'
                      ? 'bg-red-900/60 text-red-300 border-red-700'
                      : incident.severity === 'High'
                      ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                      : 'bg-blue-900/60 text-blue-300 border-blue-700'
                  }`}
                >
                  {incident.severity}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    incident.status === 'Active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {incident.status}
                </span>
              </div>
            </div>

            {/* Name & Zone */}
            <div>
              <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
                {incident.zone} • {incident.disasterType}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                {incident.name}
              </h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{incident.location}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 leading-relaxed bg-gray-950 p-2.5 rounded border border-gray-800">
              {incident.description}
            </p>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-800">
              <div className="p-2 bg-gray-850 rounded">
                <span className="text-[10px] text-gray-400 block flex items-center gap-1">
                  <Users className="w-3 h-3" /> Affected Population
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {incident.affectedPopulation.toLocaleString()}
                </span>
              </div>
              <div className="p-2 bg-gray-850 rounded">
                <span className="text-[10px] text-gray-400 block flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> Water Gauge
                </span>
                <span className="font-mono font-bold text-blue-300 text-sm">
                  {incident.waterLevel}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
              <span className="text-[11px] text-gray-500">
                Created {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {role === 'Command Center Admin' && (
                <div className="flex gap-1.5">
                  {incident.status === 'Active' ? (
                    <button
                      onClick={() => handleUpdateStatus(incident.id, 'Contained')}
                      className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px]"
                    >
                      Mark Contained
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(incident.id, 'Active')}
                      className="px-2 py-1 rounded bg-blue-900/50 hover:bg-blue-800 text-blue-300 text-[11px]"
                    >
                      Re-activate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span>Declare Emergency Incident</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Incident Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gollapudi Canal Surge Breach"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Affected Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Zone A">Zone A (Bhavanipuram)</option>
                    <option value="Zone B">Zone B (One Town)</option>
                    <option value="Zone C">Zone C (Auto Nagar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Critical">Critical (Immediate Danger)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="Low">Low / Monitoring</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Specific Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Gollapudi Bypass Junction"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Affected Population</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.affectedPopulation}
                    onChange={(e) => setFormData({ ...formData, affectedPopulation: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Water Inundation Gauge</label>
                  <input
                    type="text"
                    value={formData.waterLevel}
                    onChange={(e) => setFormData({ ...formData, waterLevel: e.target.value })}
                    placeholder="+2.0m above normal"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Description & Field Conditions</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe flooding extent, access bottlenecks, or immediate threats..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
