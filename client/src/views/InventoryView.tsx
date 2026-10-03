import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { ResourceInventory } from '../types';
import { api } from '../services/api';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  PackageCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  TrendingDown,
  X,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { role, refreshData } = useEmergency();
  const [resources, setResources] = useState<ResourceInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [adjustingResource, setAdjustingResource] = useState<ResourceInventory | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(50);

  const loadResources = async () => {
    try {
      const data = await api.getResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingResource) return;

    try {
      await api.updateResourceStock(adjustingResource.id, adjustDelta, 'add', role);
      setAdjustingResource(null);
      await loadResources();
      await refreshData();
    } catch (err: any) {
      alert(`Error adjusting stock: ${err.message}`);
    }
  };

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.orgName.toLowerCase().includes(search.toLowerCase()) ||
      r.warehouseLocation.toLowerCase().includes(search.toLowerCase());

    const matchesOrg = orgFilter === 'All' || r.orgId === orgFilter;
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;

    return matchesSearch && matchesOrg && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-purple-400" />
            <span>Multi-Agency Resource Inventory</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time stockpile telemetry across NDRF, Red Cross & Seva Dal depots
          </p>
        </div>

        {/* Aggregate Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-gray-850 px-3 py-1.5 rounded-lg border border-gray-750">
            <span className="text-gray-400 block text-[10px]">TOTAL AVAILABLE</span>
            <span className="text-sm font-bold text-white">
              {resources.reduce((s, r) => s + r.availableQuantity, 0).toLocaleString()} units
            </span>
          </div>
          <div className="bg-gray-850 px-3 py-1.5 rounded-lg border border-gray-750">
            <span className="text-gray-400 block text-[10px]">ALLOCATED / EN ROUTE</span>
            <span className="text-sm font-bold text-purple-300">
              {resources.reduce((s, r) => s + r.allocatedQuantity, 0).toLocaleString()} units
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-900 p-3.5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search resource, depot location, agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Org Filter */}
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Organizations</option>
            <option value="ORG-01">NDRF Central Logistics</option>
            <option value="ORG-02">Indian Red Cross Depot</option>
            <option value="ORG-03">Vijayawada Seva Dal</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Medical">Medical Kits & Oxygen</option>
            <option value="Food">Food Packets</option>
            <option value="Water">Drinking Water</option>
            <option value="Rescue">Rescue Boats</option>
            <option value="Shelter">Thermal Blankets</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Supply Item & Depot</th>
                <th className="py-3 px-3">Organization</th>
                <th className="py-3 px-3 text-right">Available</th>
                <th className="py-3 px-3 text-right">Allocated</th>
                <th className="py-3 px-3 text-right">Consumed</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-850/60 transition-colors">
                  {/* Supply & Location */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white text-xs flex items-center gap-2">
                      <span>{item.type}</span>
                      <span className="text-[10px] font-mono text-gray-500">({item.id})</span>
                    </div>
                    <div className="text-gray-400 text-[11px] mt-0.5">
                      {item.warehouseLocation}
                    </div>
                    {item.expiry && (
                      <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-600" />
                        <span>Expiry: {item.expiry}</span>
                      </div>
                    )}
                  </td>

                  {/* Organization */}
                  <td className="py-3 px-3">
                    <span className="text-xs text-blue-300 font-medium">{item.orgName}</span>
                    <span className="block text-[10px] text-gray-400">{item.category} Category</span>
                  </td>

                  {/* Quantities */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono font-bold text-white text-sm">
                      {item.availableQuantity.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-purple-300 font-medium">
                      {item.allocatedQuantity.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-emerald-400 font-medium">
                      {item.consumedQuantity.toLocaleString()}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                        item.availableQuantity > 100
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : item.availableQuantity > 0
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : 'bg-red-950/60 text-red-300 border-red-800'
                      }`}
                    >
                      {item.availableQuantity > 100
                        ? 'IN STOCK'
                        : item.availableQuantity > 0
                        ? 'LOW STOCK'
                        : 'DEPLETED'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {(role === 'Command Center Admin' || role === 'Organization Manager') && (
                      <button
                        onClick={() => {
                          setAdjustingResource(item);
                          setAdjustDelta(50);
                        }}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors"
                      >
                        + Restock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Adjustment Modal */}
      {adjustingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full p-5 text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-400" />
                <span>Restock Depot Inventory</span>
              </h3>
              <button
                onClick={() => setAdjustingResource(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
              <div>
                <span className="text-gray-400 block">Target Supply:</span>
                <span className="font-bold text-white text-sm block">{adjustingResource.type}</span>
                <span className="text-gray-400 text-[11px] block mt-0.5">
                  {adjustingResource.orgName} ({adjustingResource.warehouseLocation})
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Current Available:</span>
                <span className="font-mono text-emerald-400 font-bold text-base">
                  {adjustingResource.availableQuantity} units
                </span>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">
                  Additional Units to Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setAdjustingResource(null)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs shadow"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
