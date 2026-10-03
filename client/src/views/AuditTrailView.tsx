import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { AuditLog } from '../types';
import { api } from '../services/api';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NERCP_Audit_Trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.reason.toLowerCase().includes(search.toLowerCase()) ||
      (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase()));

    const matchesEntity = entityFilter === 'All' || log.entity === entityFilter;
    const matchesRole = roleFilter === 'All' || log.userRole === roleFilter;

    return matchesSearch && matchesEntity && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Immutable Audit Trail & System Log</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Transparent chronological record of all automated triage decisions, re-routings & dispatches
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-xs font-semibold shadow transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-900 p-3.5 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, entity ID, or decision reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Entities</option>
            <option value="Incident">Incidents</option>
            <option value="Request">Requests</option>
            <option value="Resource">Resources</option>
            <option value="Delivery">Deliveries</option>
            <option value="Shelter">Shelters</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none"
          >
            <option value="All">All Actors</option>
            <option value="System AI Engine">System AI Engine</option>
            <option value="Command Center Admin">Command Center Admin</option>
            <option value="Organization Manager">Organization Manager</option>
            <option value="Field Officer">Field Officer</option>
            <option value="Response Team">Response Team</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Timestamp & ID</th>
                <th className="py-3 px-3">Actor / Role</th>
                <th className="py-3 px-3">Action & Entity</th>
                <th className="py-3 px-3">State Transition</th>
                <th className="py-3 px-4">Decision Reason & Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-850/60 transition-colors">
                  {/* Timestamp & ID */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-gray-400 text-[10px] block">
                      {log.id}
                    </span>
                    <span className="font-mono text-white text-xs font-semibold">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                        log.userRole === 'System AI Engine'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                          : log.userRole === 'Command Center Admin'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                          : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </td>

                  {/* Action & Entity */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-xs">{log.action}</div>
                    <div className="text-[11px] text-blue-400 font-mono mt-0.5">
                      {log.entity} {log.entityId ? `[${log.entityId}]` : ''}
                    </div>
                  </td>

                  {/* State Transition */}
                  <td className="py-3 px-3 max-w-xs">
                    {log.previousValue ? (
                      <div className="space-y-1 text-[11px]">
                        <div className="text-gray-400 line-through truncate">
                          Prev: {log.previousValue}
                        </div>
                        <div className="text-emerald-300 font-medium flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{log.newValue}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-emerald-300 font-medium text-[11px] truncate">
                        {log.newValue}
                      </div>
                    )}
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-4 max-w-sm">
                    <p className="text-xs text-gray-300 leading-snug">
                      {log.reason}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
