import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { Shelter } from '../types';
import { api } from '../services/api';
import {
  Home,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Plus,
  Edit2,
  X,
  Save,
  UserCheck,
} from 'lucide-react';

export const SheltersView: React.FC = () => {
  const { role, setShelterModalData, refreshData } = useEmergency();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    location: '',
    capacity: 400,
    occupied: 50,
    facilities: 'Clean Drinking Water, Basic First Aid, Power Generator, Family Dorms',
    manager: '',
    contact: '+91-866-',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    capacity: 0,
    occupied: 0,
    facilities: '',
    manager: '',
    contact: '',
  });

  const loadShelters = async () => {
    try {
      const data = await api.getShelters();
      setShelters(data);
    } catch (err) {
      console.error('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleSimulateOvercrowd = async (shelterId: string = 'SHL-02') => {
    setIsSimulating(true);
    try {
      const result = await api.simulateShelterOvercrowd(shelterId, role);
      setShelterModalData(result);
      await loadShelters();
      await refreshData();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Create Shelter Handler
  const handleCreateShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createShelter(
        {
          name: createForm.name,
          location: createForm.location,
          capacity: Number(createForm.capacity),
          occupied: Number(createForm.occupied),
          facilities: createForm.facilities.split(',').map((f) => f.trim()).filter(Boolean),
          manager: createForm.manager,
          contact: createForm.contact,
          coordinates: { lat: 16.515, lng: 80.635 },
        },
        role
      );
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        location: '',
        capacity: 400,
        occupied: 50,
        facilities: 'Clean Drinking Water, Basic First Aid, Power Generator, Family Dorms',
        manager: '',
        contact: '+91-866-',
      });
      await loadShelters();
      await refreshData();
    } catch (err: any) {
      alert(`Error creating shelter: ${err.message}`);
    }
  };

  // Edit Shelter Open Handler
  const openEditModal = (shelter: Shelter) => {
    setEditingShelter(shelter);
    setEditForm({
      name: shelter.name,
      location: shelter.location,
      capacity: shelter.capacity,
      occupied: shelter.occupied,
      facilities: shelter.facilities.join(', '),
      manager: shelter.manager,
      contact: shelter.contact,
    });
  };

  // Edit Shelter Submit Handler
  const handleUpdateShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShelter) return;

    try {
      await api.updateShelter(
        editingShelter.id,
        {
          ...editForm,
          capacity: Number(editForm.capacity),
          occupied: Number(editForm.occupied),
          facilities: editForm.facilities.split(',').map((f) => f.trim()).filter(Boolean),
        },
        role
      );
      setEditingShelter(null);
      await loadShelters();
      await refreshData();
    } catch (err: any) {
      alert(`Error updating shelter: ${err.message}`);
    }
  };

  // Quick Occupancy Adjuster (+/- Delta)
  const adjustOccupancy = async (shelter: Shelter, delta: number) => {
    try {
      const newOccupied = Math.max(0, Math.min(shelter.capacity, shelter.occupied + delta));
      await api.updateShelter(
        shelter.id,
        {
          occupied: newOccupied,
          updateReason: `Quick occupancy update (${delta > 0 ? `+${delta}` : delta} evacuees).`,
        },
        role
      );
      await loadShelters();
      await refreshData();
    } catch (err: any) {
      alert(`Error adjusting occupancy: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            <span>Emergency Evacuation Shelters & Relief Camps</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Capacity management, camp registration & automated overflow load-balancing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Register New Shelter Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Register Shelter</span>
          </button>

          {/* Simulate Overcrowd Button */}
          <button
            onClick={() => handleSimulateOvercrowd('SHL-02')}
            disabled={isSimulating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all shadow"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Simulate S-02 Full (Overcrowd)</span>
          </button>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {shelters.map((shelter) => {
          const occupancyPercent = Math.round((shelter.occupied / shelter.capacity) * 100);
          const isFull = shelter.status === 'Full' || occupancyPercent >= 100;
          const isNear = shelter.status === 'Near Capacity' || occupancyPercent >= 90;

          return (
            <div
              key={shelter.id}
              className={`bg-gray-900 rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                isFull
                  ? 'border-red-600/70 bg-gradient-to-b from-red-950/20 to-gray-900'
                  : isNear
                  ? 'border-amber-600/60 bg-gradient-to-b from-amber-950/20 to-gray-900'
                  : 'border-gray-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {shelter.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 leading-snug">
                    {shelter.name}
                  </h3>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isFull
                        ? 'bg-red-900/60 text-red-300 border-red-700'
                        : isNear
                        ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {isFull ? 'FULL (100%)' : isNear ? 'NEAR CAPACITY' : 'AVAILABLE'}
                  </span>

                  {/* Edit Shelter Button */}
                  <button
                    onClick={() => openEditModal(shelter)}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors pt-0.5"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span>{shelter.location}</span>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1.5 p-3 bg-gray-850 rounded-lg border border-gray-750">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Occupancy:</span>
                  <span className="font-mono font-bold text-white">
                    {shelter.occupied} / {shelter.capacity} Beds
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFull ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                  <span>Available Space:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {shelter.availableCapacity} remaining
                  </span>
                </div>

                {/* Quick Increment / Decrement Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[10px]">
                  <span className="text-gray-500 font-mono">QUICK TRIAGE:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustOccupancy(shelter, -25)}
                      disabled={shelter.occupied <= 0}
                      className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-40"
                    >
                      -25
                    </button>
                    <button
                      onClick={() => adjustOccupancy(shelter, 25)}
                      disabled={shelter.occupied >= shelter.capacity}
                      className="px-2 py-0.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 disabled:opacity-40 font-bold"
                    >
                      +25
                    </button>
                  </div>
                </div>
              </div>

              {/* On-site Facilities */}
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                  Verified On-Site Facilities
                </span>
                <div className="flex flex-wrap gap-1">
                  {shelter.facilities.map((fac, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Manager & Contact */}
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block text-[10px]">CAMP IN-CHARGE:</span>
                  <span className="text-gray-300 font-medium">{shelter.manager}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 block text-[10px]">HOTLINE:</span>
                  <span className="text-blue-400 font-mono">{shelter.contact}</span>
                </div>
              </div>

              {/* Action Button for Overcrowding */}
              {isFull && (
                <div className="pt-2">
                  <button
                    onClick={() => handleSimulateOvercrowd(shelter.id)}
                    className="w-full py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Evacuee Redirection Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE SHELTER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 text-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Register Emergency Evacuation Shelter</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShelter} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Joseph High School Relief Camp"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Location & Sector</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gunadala Road, Zone A, Vijayawada"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Total Bed Capacity</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Initial Occupants</label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.occupied}
                    onChange={(e) => setCreateForm({ ...createForm, occupied: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  On-site Facilities (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Medical Post, Mega Kitchen, Power Generator, Sanitation"
                  value={createForm.facilities}
                  onChange={(e) => setCreateForm({ ...createForm, facilities: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Camp Coordinator</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Venkat"
                    value={createForm.manager}
                    onChange={(e) => setCreateForm({ ...createForm, manager: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Hotline Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="+91-866-2489999"
                    value={createForm.contact}
                    onChange={(e) => setCreateForm({ ...createForm, contact: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
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
                  Register Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHELTER MODAL */}
      {editingShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 text-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Edit Shelter Details: {editingShelter.id}</span>
              </h3>
              <button
                onClick={() => setEditingShelter(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShelter} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Location & Address</label>
                <input
                  type="text"
                  required
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Occupied Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.occupied}
                    onChange={(e) => setEditForm({ ...editForm, occupied: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  On-site Facilities (Comma Separated)
                </label>
                <input
                  type="text"
                  value={editForm.facilities}
                  onChange={(e) => setEditForm({ ...editForm, facilities: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Camp Coordinator</label>
                  <input
                    type="text"
                    required
                    value={editForm.manager}
                    onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Hotline Contact</label>
                  <input
                    type="text"
                    required
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingShelter(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
