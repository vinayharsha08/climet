import {
  Incident,
  EmergencyRequest,
  ResourceInventory,
  ResponseTeam,
  Vehicle,
  Shelter,
  DeliveryOperation,
  AuditLog,
  SystemAlert,
  DashboardStats,
  AllocationRecommendation,
  Organization,
  UserRole,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard/stats'),

  // Incidents
  getIncidents: () => fetchJson<Incident[]>('/incidents'),
  createIncident: (data: Partial<Incident>, userRole: UserRole) =>
    fetchJson<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify({ ...data, userRole }),
    }),
  updateIncident: (id: string, data: Partial<Incident>, userRole: UserRole) =>
    fetchJson<Incident>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, userRole }),
    }),

  // Requests
  getRequests: () => fetchJson<EmergencyRequest[]>('/requests'),
  createRequest: (data: Partial<EmergencyRequest>, userRole: UserRole) =>
    fetchJson<EmergencyRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify({ ...data, userRole }),
    }),
  updateRequest: (id: string, data: Partial<EmergencyRequest>, userRole: UserRole) =>
    fetchJson<EmergencyRequest>(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, userRole }),
    }),
  classifyPriority: (affectedPeople: number, category: string, requestedResource: string) =>
    fetchJson<{ priority: string; reason: string; score: number }>('/requests/classify-priority', {
      method: 'POST',
      body: JSON.stringify({ affectedPeople, category, requestedResource }),
    }),

  // Resources
  getResources: () => fetchJson<ResourceInventory[]>('/resources'),
  updateResourceStock: (id: string, delta: number, type: 'add' | 'set', userRole: UserRole) =>
    fetchJson<ResourceInventory>(`/resources/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({ delta, type, userRole }),
    }),

  // Teams, Vehicles, Shelters, Orgs
  getOrganizations: () => fetchJson<Organization[]>('/organizations'),
  getTeams: () => fetchJson<ResponseTeam[]>('/teams'),
  getVehicles: () => fetchJson<Vehicle[]>('/vehicles'),
  getShelters: () => fetchJson<Shelter[]>('/shelters'),

  // Deliveries
  getDeliveries: () => fetchJson<DeliveryOperation[]>('/deliveries'),
  stepDelivery: (id: string) =>
    fetchJson<DeliveryOperation>(`/deliveries/${id}/step`, {
      method: 'POST',
    }),

  // Allocation Engine
  recommendAllocation: (requestId: string) =>
    fetchJson<AllocationRecommendation>('/allocations/recommend', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    }),
  assignAllocation: (params: {
    requestId: string;
    teamId: string;
    vehicleId: string;
    allocationPlan: any[];
    userRole: UserRole;
  }) =>
    fetchJson<{ delivery: DeliveryOperation; request: EmergencyRequest }>('/allocations/assign', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Simulations
  simulateRoadBlockage: (deliveryId?: string, userRole: UserRole = 'Field Officer') =>
    fetchJson<{ delivery: DeliveryOperation; explanation: any }>('/simulations/road-blockage', {
      method: 'POST',
      body: JSON.stringify({ deliveryId, userRole }),
    }),
  simulateResourceShortage: (data: { resourceType?: string; quantity?: number }, userRole: UserRole = 'Command Center Admin') =>
    fetchJson<any>('/simulations/resource-shortage', {
      method: 'POST',
      body: JSON.stringify({ ...data, userRole }),
    }),
  simulateShelterOvercrowd: (shelterId: string = 'SHL-02', userRole: UserRole = 'Field Officer') =>
    fetchJson<any>('/simulations/shelter-overcrowd', {
      method: 'POST',
      body: JSON.stringify({ shelterId, userRole }),
    }),

  // Audit Logs & Alerts
  getAuditLogs: () => fetchJson<AuditLog[]>('/audit-logs'),
  getAlerts: () => fetchJson<SystemAlert[]>('/alerts'),
  markAlertRead: (id: string) =>
    fetchJson<SystemAlert>(`/alerts/${id}/read`, {
      method: 'POST',
    }),

  // Demo Reset
  resetData: () => fetchJson<{ message: string; data: any }>('/reset-data', { method: 'POST' }),
};
