import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { EmergencyRequest } from '../types';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Cpu,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const RequestsView: React.FC = () => {
  const { role, setSelectedRequestId, setActiveTab, refreshData } = useEmergency();
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Request Form & Live Classifier Preview
  const [newRequestData, setNewRequestData] = useState({
    incidentId: 'INC-01',
    location: '',
    requestedResource: 'Emergency Medical Kits',
    category: 'Medical',
    quantity: 50,
    unit: 'Kits',
    affectedPeople: 620,
    notes: '',
  });

  const [liveClassification, setLiveClassification] = useState({
    priority: 'Critical',
    reason: 'Affected people (620) > 500 AND urgent medical supply required.',
    score: 95,
  });

  const loadRequests = async () => {
    try {
      const data = await api.getRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Update live priority classification dynamically as user edits form
  useEffect(() => {
    const runLiveClassification = async () => {
      try {
        const result = await api.classifyPriority(
          newRequestData.affectedPeople,
          newRequestData.category,
          newRequestData.requestedResource
        );
        setLiveClassification(result);
      } catch (err) {
        // Fallback local logic
        const count = newRequestData.affectedPeople;
        const isMed = newRequestData.category === 'Medical';
        if (count > 500 && isMed) {
          setLiveClassification({
            priority: 'Critical',
            reason: `Affected people (${count}) > 500 and medical supply required.`,
            score: 95,
          });
        } else if (count > 200) {
          setLiveClassification({
            priority: 'High',
            reason: `Affected people (${count}) > 200.`,
            score: 75,
          });
        } else {
          setLiveClassification({
            priority: 'Medium',
            reason: `Affected people (${count}) <= 200.`,
            score: 50,
          });
        }
      }
    };
    runLiveClassification();
  }, [newRequestData.affectedPeople, newRequestData.category, newRequestData.requestedResource]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRequest(
        {
          ...newRequestData,
          priority: liveClassification.priority as any,
          priorityReason: liveClassification.reason,
        },
        role
      );
      setShowCreateModal(false);
      await loadRequests();
      await refreshData();
    } catch (err: any) {
      alert(`Error creating request: ${err.message}`);
    }
  };

  const handleAllocate = (reqId: string) => {
    setSelectedRequestId(reqId);
    setActiveTab('allocation');
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedResource.toLowerCase().includes(search.toLowerCase()) ||
      (r.priorityReason && r.priorityReason.toLowerCase().includes(search.toLowerCase()));

    const matchesPriority = priorityFilter === 'All' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <span>Emergency Relief Requests</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Automated triage, rule-based priority reasoning & supply matching
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Distress Request</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-gray-900 p-3.5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search request ID, location, supply..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">🔴 Critical Only</option>
            <option value="High">🟠 High Only</option>
            <option value="Medium">🔵 Medium Only</option>
            <option value="Low">⚪ Low Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Allocated">Allocated</option>
            <option value="Delivered">Delivered</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Medical">Medical</option>
            <option value="Food">Food</option>
            <option value="Water">Water</option>
            <option value="Rescue">Rescue</option>
            <option value="Shelter">Shelter</option>
          </select>
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-800">
          {filteredRequests.map((req) => (
            <div key={req.id} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-400 text-xs">{req.id}</span>
                  <span className="text-[10px] text-gray-500 font-normal">({req.incidentId})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      req.priority === 'Critical'
                        ? 'bg-red-900/60 text-red-300 border-red-700'
                        : req.priority === 'High'
                        ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                        : req.priority === 'Medium'
                        ? 'bg-blue-900/60 text-blue-300 border-blue-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    {req.priority.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                      req.status === 'Pending'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                        : req.status === 'Allocated'
                        ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                        : req.status === 'Delivered'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-medium text-white text-xs">{req.location}</div>
                <div className="text-gray-300 text-xs font-semibold mt-0.5">
                  {req.quantity} {req.unit} — <span className="text-gray-400 font-normal">{req.requestedResource}</span>
                </div>
              </div>

              <div className="p-2 rounded bg-gray-950/60 border border-gray-800/80 text-[11px] text-gray-300 leading-tight">
                <span className="text-gray-400 font-semibold">Triage Reason: </span>
                {req.priorityReason}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span>{req.affectedPeople} citizens affected</span>
                </span>
                {req.status === 'Pending' ? (
                  <button
                    onClick={() => handleAllocate(req.id)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                  >
                    <Cpu className="w-3 h-3" />
                    <span>Allocate</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-500 italic">Dispatched</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Wide Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Request & Location</th>
                <th className="py-3 px-3">Resource Needed</th>
                <th className="py-3 px-3">Affected Population</th>
                <th className="py-3 px-3">Priority Classification & Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-850/60 transition-colors group"
                >
                  {/* Request ID & Location */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-blue-400 flex items-center gap-1.5">
                      <span>{req.id}</span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        ({req.incidentId})
                      </span>
                    </div>
                    <div className="text-white font-medium mt-0.5 max-w-xs truncate">
                      {req.location}
                    </div>
                    {req.notes && (
                      <div className="text-[11px] text-gray-400 italic max-w-xs truncate">
                        &quot;{req.notes}&quot;
                      </div>
                    )}
                  </td>

                  {/* Resource Needed */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">
                      {req.quantity} {req.unit}
                    </div>
                    <div className="text-gray-400 text-[11px]">{req.requestedResource}</div>
                  </td>

                  {/* Affected Population */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-gray-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>{req.affectedPeople}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">citizens</span>
                  </td>

                  {/* Priority & Explainable Reason */}
                  <td className="py-3 px-3 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          req.priority === 'Critical'
                            ? 'bg-red-900/60 text-red-300 border-red-700'
                            : req.priority === 'High'
                            ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                            : req.priority === 'Medium'
                            ? 'bg-blue-900/60 text-blue-300 border-blue-700'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {req.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      {req.priorityReason}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${
                        req.status === 'Pending'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : req.status === 'Allocated'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                          : req.status === 'Delivered'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {req.status}
                    </span>
                    {req.eta && (
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ETA: {req.eta}
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {req.status === 'Pending' ? (
                      <button
                        onClick={() => handleAllocate(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Allocate</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Distress Request Modal with Real-time Priority Reasoner */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full p-6 text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <span>Submit Emergency Relief Request</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Disaster Zone</label>
                  <select
                    value={newRequestData.incidentId}
                    onChange={(e) => setNewRequestData({ ...newRequestData, incidentId: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="INC-01">Zone A (Bhavanipuram Flood)</option>
                    <option value="INC-02">Zone B (One Town Overflow)</option>
                    <option value="INC-03">Zone C (Auto Nagar Stagnation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Resource Category</label>
                  <select
                    value={newRequestData.category}
                    onChange={(e) => setNewRequestData({ ...newRequestData, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Medical">Medical Supplies</option>
                    <option value="Food">Cooked Food / Meals</option>
                    <option value="Water">Clean Drinking Water</option>
                    <option value="Rescue">Boats / Life Jackets</option>
                    <option value="Shelter">Blankets / Tarpaulins</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Specific Supply Needed</label>
                <select
                  value={newRequestData.requestedResource}
                  onChange={(e) => setNewRequestData({ ...newRequestData, requestedResource: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Emergency Medical Kits">Emergency Medical Kits</option>
                  <option value="Food Packets">Food Packets</option>
                  <option value="Drinking Water Bottles (20L)">Drinking Water Bottles (20L)</option>
                  <option value="Thermal Blankets">Thermal Blankets</option>
                  <option value="Oxygen Cylinders (Portable)">Oxygen Cylinders (Portable)</option>
                  <option value="Inflatable Rescue Boats">Inflatable Rescue Boats</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newRequestData.quantity}
                    onChange={(e) => setNewRequestData({ ...newRequestData, quantity: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Affected People Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRequestData.affectedPeople}
                    onChange={(e) => setNewRequestData({ ...newRequestData, affectedPeople: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Ground Delivery Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Ratham Center, Bhavanipuram"
                  value={newRequestData.location}
                  onChange={(e) => setNewRequestData({ ...newRequestData, location: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic Automated Priority Preview Card */}
              <div className="p-3 bg-gray-950 rounded-lg border border-blue-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AUTOMATED EXPLAINABLE TRIAGE
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      liveClassification.priority === 'Critical'
                        ? 'bg-red-900/60 text-red-300 border-red-700'
                        : liveClassification.priority === 'High'
                        ? 'bg-amber-900/60 text-amber-300 border-amber-700'
                        : 'bg-blue-900/60 text-blue-300 border-blue-700'
                    }`}
                  >
                    {liveClassification.priority} Priority
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 leading-snug">
                  <strong>Reason: </strong> {liveClassification.reason}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Field Notes / Urgency</label>
                <textarea
                  rows={2}
                  value={newRequestData.notes}
                  onChange={(e) => setNewRequestData({ ...newRequestData, notes: e.target.value })}
                  placeholder="Provide access constraints, boat requirements, or water levels..."
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
                  Submit & Classify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
