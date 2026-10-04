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
import { clientStore } from './clientStore';

const API_BASE = '/api';
let isOfflineMode = false;

// Quick probe on initialization to detect if serverless or Express backend is reachable
if (typeof window !== 'undefined') {
  fetch(`${API_BASE}/incidents`, { method: 'GET' })
    .then((res) => {
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('text/html')) {
        isOfflineMode = true;
        console.info('🌐 Static / CDN Hosting detected: Activated in-browser Disaster Management Engine.');
      }
    })
    .catch(() => {
      isOfflineMode = true;
      console.info('🌐 Standalone Client Mode: Activated in-browser Disaster Management Engine.');
    });
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  if (isOfflineMode) {
    throw new Error('OFFLINE_FALLBACK');
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const contentType = res.headers.get('content-type') || '';

    // If static server redirected to index.html (SPA redirect) or returned 404
    if (!res.ok || contentType.includes('text/html')) {
      isOfflineMode = true;
      const errorBody = await res.json().catch(() => ({ error: res.statusText || `HTTP ${res.status}` }));
      throw new Error(errorBody.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    isOfflineMode = true;
    throw err;
  }
}

export const api = {
  // Mode info
  isOffline: () => isOfflineMode,

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      return await fetchJson<DashboardStats>('/dashboard/stats');
    } catch {
      return clientStore.getDashboardStats();
    }
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    try {
      return await fetchJson<Incident[]>('/incidents');
    } catch {
      return clientStore.getIncidents();
    }
  },
  createIncident: async (data: Partial<Incident>, userRole: UserRole): Promise<Incident> => {
    try {
      return await fetchJson<Incident>('/incidents', {
        method: 'POST',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.createIncident(data, userRole);
    }
  },
  updateIncident: async (id: string, data: Partial<Incident>, userRole: UserRole): Promise<Incident> => {
    try {
      return await fetchJson<Incident>(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.updateIncident(id, data, userRole);
    }
  },

  // Requests
  getRequests: async (): Promise<EmergencyRequest[]> => {
    try {
      return await fetchJson<EmergencyRequest[]>('/requests');
    } catch {
      return clientStore.getRequests();
    }
  },
  createRequest: async (data: Partial<EmergencyRequest>, userRole: UserRole): Promise<EmergencyRequest> => {
    try {
      return await fetchJson<EmergencyRequest>('/requests', {
        method: 'POST',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.createRequest(data, userRole);
    }
  },
  updateRequest: async (id: string, data: Partial<EmergencyRequest>, userRole: UserRole): Promise<EmergencyRequest> => {
    try {
      return await fetchJson<EmergencyRequest>(`/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.updateRequest(id, data, userRole);
    }
  },
  classifyPriority: async (affectedPeople: number, category: string, requestedResource: string): Promise<{ priority: string; reason: string; score: number }> => {
    try {
      return await fetchJson<{ priority: string; reason: string; score: number }>('/requests/classify-priority', {
        method: 'POST',
        body: JSON.stringify({ affectedPeople, category, requestedResource }),
      });
    } catch {
      return clientStore.classifyPriority(affectedPeople, category, requestedResource);
    }
  },

  // Resources
  getResources: async (): Promise<ResourceInventory[]> => {
    try {
      return await fetchJson<ResourceInventory[]>('/resources');
    } catch {
      return clientStore.getResources();
    }
  },
  updateResourceStock: async (id: string, delta: number, type: 'add' | 'set', userRole: UserRole): Promise<ResourceInventory> => {
    try {
      return await fetchJson<ResourceInventory>(`/resources/${id}/stock`, {
        method: 'POST',
        body: JSON.stringify({ delta, type, userRole }),
      });
    } catch {
      return clientStore.updateResourceStock(id, delta, type, userRole);
    }
  },

  // Teams, Vehicles, Shelters, Orgs
  getOrganizations: async (): Promise<Organization[]> => {
    try {
      return await fetchJson<Organization[]>('/organizations');
    } catch {
      return clientStore.getOrganizations();
    }
  },
  getTeams: async (): Promise<ResponseTeam[]> => {
    try {
      return await fetchJson<ResponseTeam[]>('/teams');
    } catch {
      return clientStore.getTeams();
    }
  },
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      return await fetchJson<Vehicle[]>('/vehicles');
    } catch {
      return clientStore.getVehicles();
    }
  },
  getShelters: async (): Promise<Shelter[]> => {
    try {
      return await fetchJson<Shelter[]>('/shelters');
    } catch {
      return clientStore.getShelters();
    }
  },
  createShelter: async (data: Partial<Shelter>, userRole: UserRole): Promise<Shelter> => {
    try {
      return await fetchJson<Shelter>('/shelters', {
        method: 'POST',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.createShelter(data, userRole);
    }
  },
  updateShelter: async (id: string, data: Partial<Shelter> & { updateReason?: string }, userRole: UserRole): Promise<Shelter> => {
    try {
      return await fetchJson<Shelter>(`/shelters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.updateShelter(id, data, userRole);
    }
  },

  // Deliveries
  getDeliveries: async (): Promise<DeliveryOperation[]> => {
    try {
      return await fetchJson<DeliveryOperation[]>('/deliveries');
    } catch {
      return clientStore.getDeliveries();
    }
  },
  stepDelivery: async (id: string): Promise<DeliveryOperation> => {
    try {
      return await fetchJson<DeliveryOperation>(`/deliveries/${id}/step`, {
        method: 'POST',
      });
    } catch {
      return clientStore.stepDeliveryMovement(id);
    }
  },

  // Allocation Engine
  recommendAllocation: async (requestId: string): Promise<AllocationRecommendation> => {
    try {
      return await fetchJson<AllocationRecommendation>('/allocations/recommend', {
        method: 'POST',
        body: JSON.stringify({ requestId }),
      });
    } catch {
      return clientStore.recommendAllocation(requestId);
    }
  },
  assignAllocation: async (params: {
    requestId: string;
    teamId: string;
    vehicleId: string;
    allocationPlan: any[];
    userRole: UserRole;
  }): Promise<{ delivery: DeliveryOperation; request: EmergencyRequest }> => {
    try {
      return await fetchJson<{ delivery: DeliveryOperation; request: EmergencyRequest }>('/allocations/assign', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      return clientStore.assignAllocation(params);
    }
  },

  // Simulations
  simulateRoadBlockage: async (deliveryId?: string, userRole: UserRole = 'Field Officer'): Promise<{ delivery: DeliveryOperation; explanation: any }> => {
    try {
      return await fetchJson<{ delivery: DeliveryOperation; explanation: any }>('/simulations/road-blockage', {
        method: 'POST',
        body: JSON.stringify({ deliveryId, userRole }),
      });
    } catch {
      return clientStore.simulateRoadBlockage(deliveryId, userRole);
    }
  },
  simulateResourceShortage: async (data: { resourceType?: string; quantity?: number }, userRole: UserRole = 'Command Center Admin'): Promise<any> => {
    try {
      return await fetchJson<any>('/simulations/resource-shortage', {
        method: 'POST',
        body: JSON.stringify({ ...data, userRole }),
      });
    } catch {
      return clientStore.simulateResourceShortage(data, userRole);
    }
  },
  simulateShelterOvercrowd: async (shelterId: string = 'SHL-02', userRole: UserRole = 'Field Officer'): Promise<any> => {
    try {
      return await fetchJson<any>('/simulations/shelter-overcrowd', {
        method: 'POST',
        body: JSON.stringify({ shelterId, userRole }),
      });
    } catch {
      return clientStore.simulateShelterOvercrowd(shelterId, userRole);
    }
  },

  // Audit Logs & Alerts
  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
      return await fetchJson<AuditLog[]>('/audit-logs');
    } catch {
      return clientStore.getAuditLogs();
    }
  },
  getAlerts: async (): Promise<SystemAlert[]> => {
    try {
      return await fetchJson<SystemAlert[]>('/alerts');
    } catch {
      return clientStore.getAlerts();
    }
  },
  markAlertRead: async (id: string): Promise<SystemAlert> => {
    try {
      return await fetchJson<SystemAlert>(`/alerts/${id}/read`, {
        method: 'POST',
      });
    } catch {
      return clientStore.markAlertRead(id);
    }
  },

  // AI SitRep
  getAiSitrep: async (): Promise<{ sitrep: string; source: string }> => {
    try {
      return await fetchJson<{ sitrep: string; source: string }>('/ai/situation-report', {
        method: 'POST',
      });
    } catch {
      return clientStore.getAiSitrep();
    }
  },

  // Demo Reset
  resetData: async (): Promise<{ message: string; data: any }> => {
    try {
      return await fetchJson<{ message: string; data: any }>('/reset-data', { method: 'POST' });
    } catch {
      return clientStore.resetData();
    }
  },
};
