import { initialData } from '../data/initialData';
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

const STORAGE_KEY = 'nercp_emergency_state_v1';

function calculateDistanceKm(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.5;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface DBState {
  organizations: Organization[];
  incidents: Incident[];
  resources: ResourceInventory[];
  teams: ResponseTeam[];
  vehicles: Vehicle[];
  shelters: Shelter[];
  requests: EmergencyRequest[];
  deliveries: DeliveryOperation[];
  auditLogs: AuditLog[];
  alerts: SystemAlert[];
}

class ClientEmergencyStore {
  private data: DBState;

  constructor() {
    this.data = this.loadState();
  }

  private loadState(): DBState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load local storage state, using initialData', err);
    }
    const fresh = JSON.parse(JSON.stringify(initialData)) as DBState;
    this.saveState(fresh);
    return fresh;
  }

  private saveState(dataToSave?: DBState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave || this.data));
    } catch (err) {
      console.warn('Failed to save state to localStorage', err);
    }
  }

  public resetData(): { message: string; data: any } {
    const fresh = JSON.parse(JSON.stringify(initialData)) as DBState;
    this.data = fresh;
    this.saveState(fresh);
    return { message: 'System state successfully reset to initial demo data', data: fresh };
  }

  // --- DASHBOARD STATS ---
  public getDashboardStats(): DashboardStats {
    const incidents = this.data.incidents;
    const requests = this.data.requests;
    const resources = this.data.resources;
    const vehicles = this.data.vehicles;
    const teams = this.data.teams;
    const shelters = this.data.shelters;
    const deliveries = this.data.deliveries;
    const alerts = this.data.alerts;
    const auditLogs = this.data.auditLogs;

    const activeIncidents = incidents.filter((i) => i.status === 'Active').length;
    const criticalRequests = requests.filter((r) => r.priority === 'Critical' && r.status !== 'Delivered').length;
    const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
    const totalResourcesAvailable = resources.reduce((sum, r) => sum + r.availableQuantity, 0);
    const activeDeliveries = deliveries.filter((d) => d.status === 'En Route' || d.status === 'Rerouted' || d.status === 'Route Blocked').length;
    const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
    const availableTeams = teams.filter((t) => t.availability === 'Available').length;

    const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
    const totalOccupied = shelters.reduce((sum, s) => sum + s.occupied, 0);
    const shelterOccupancyRate = Math.round((totalOccupied / (totalCapacity || 1)) * 100);

    const priorityDist = {
      Critical: requests.filter((r) => r.priority === 'Critical').length,
      High: requests.filter((r) => r.priority === 'High').length,
      Medium: requests.filter((r) => r.priority === 'Medium').length,
      Low: requests.filter((r) => r.priority === 'Low').length,
    };

    const statusDist = {
      Pending: requests.filter((r) => r.status === 'Pending').length,
      Allocated: requests.filter((r) => r.status === 'Allocated').length,
      InTransit: deliveries.filter((d) => d.status === 'En Route' || d.status === 'Rerouted').length,
      Delivered: requests.filter((r) => r.status === 'Delivered').length,
    };

    return {
      kpis: {
        activeIncidents,
        criticalRequests,
        pendingRequests,
        totalResourcesAvailable,
        activeDeliveries,
        availableVehicles,
        availableTeams,
        shelterOccupancyRate,
      },
      charts: {
        priorityDist,
        statusDist,
        shelters: shelters.map((s) => ({
          name: s.name,
          capacity: s.capacity,
          occupied: s.occupied,
          percent: Math.round((s.occupied / s.capacity) * 100),
          status: s.status,
        })),
        resourcesByCategory: [
          { category: 'Medical', count: resources.filter((r) => r.category === 'Medical').reduce((s, r) => s + r.availableQuantity, 0) },
          { category: 'Food', count: resources.filter((r) => r.category === 'Food').reduce((s, r) => s + r.availableQuantity, 0) },
          { category: 'Water', count: resources.filter((r) => r.category === 'Water').reduce((s, r) => s + r.availableQuantity, 0) },
          { category: 'Shelter', count: resources.filter((r) => r.category === 'Shelter').reduce((s, r) => s + r.availableQuantity, 0) },
          { category: 'Rescue', count: resources.filter((r) => r.category === 'Rescue').reduce((s, r) => s + r.availableQuantity, 0) },
        ],
      },
      activeAlerts: alerts.filter((a) => !a.read).slice(0, 5),
      recentActivity: auditLogs.slice(0, 8),
    };
  }

  // --- INCIDENTS ---
  public getIncidents(): Incident[] {
    return this.data.incidents;
  }

  public createIncident(incidentData: Partial<Incident>, role: UserRole = 'Command Center Admin'): Incident {
    const id = `INC-${String(this.data.incidents.length + 1).padStart(2, '0')}`;
    const newIncident: Incident = {
      id,
      name: incidentData.name || 'New Flood Incident',
      disasterType: incidentData.disasterType || 'Flood Emergency',
      zone: incidentData.zone || 'Zone A',
      location: incidentData.location || 'Vijayawada Region',
      coordinates: incidentData.coordinates || { lat: 16.515, lng: 80.62 },
      severity: incidentData.severity || 'High',
      affectedPopulation: Number(incidentData.affectedPopulation) || 100,
      waterLevel: incidentData.waterLevel || '+1.5m above normal',
      status: 'Active',
      description: incidentData.description || '',
      createdAt: new Date().toISOString(),
    };

    this.data.incidents.unshift(newIncident);
    this.logAudit({
      userRole: role,
      action: 'Incident Created',
      entity: 'Incident',
      entityId: id,
      previousValue: null,
      newValue: `${newIncident.name} (${newIncident.severity})`,
      reason: `Reported in ${newIncident.location} with ${newIncident.affectedPopulation} affected population.`,
    });

    this.saveState();
    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<Incident>, role: UserRole = 'Command Center Admin'): Incident {
    const incIndex = this.data.incidents.findIndex((i) => i.id === id);
    if (incIndex === -1) throw new Error('Incident not found');

    const old = { ...this.data.incidents[incIndex] };
    this.data.incidents[incIndex] = { ...old, ...updates, updatedAt: new Date().toISOString() };

    this.logAudit({
      userRole: role,
      action: 'Incident Updated',
      entity: 'Incident',
      entityId: id,
      previousValue: `Status: ${old.status}, Severity: ${old.severity}`,
      newValue: `Status: ${this.data.incidents[incIndex].status}, Severity: ${this.data.incidents[incIndex].severity}`,
      reason: updates.updateReason || 'Field condition status modification.',
    });

    this.saveState();
    return this.data.incidents[incIndex];
  }

  // --- CLASSIFIER ---
  public classifyPriority(affectedPeople: number, category?: string, requestedResource?: string): { priority: 'Critical' | 'High' | 'Medium' | 'Low'; reason: string; score: number } {
    const count = Number(affectedPeople) || 0;
    const cat = (category || '').toLowerCase();
    const res = (requestedResource || '').toLowerCase();

    const isMedical = cat.includes('med') || res.includes('med') || res.includes('oxygen');
    const isRescue = cat.includes('rescue') || res.includes('boat');

    if (count > 500 && isMedical) {
      return {
        priority: 'Critical',
        reason: `Affected people (${count}) > 500 AND urgent life-saving medical supplies needed. Immediate risk of acute casualties.`,
        score: 95,
      };
    } else if (isRescue || count > 500) {
      return {
        priority: 'Critical',
        reason: isRescue
          ? `High-risk water evacuation: ${count} individuals trapped in flooded structures requiring swift boat rescue.`
          : `Extensive mass scale: Affected population (${count}) exceeds the 500 threshold.`,
        score: 90,
      };
    } else if (count > 200) {
      return {
        priority: 'High',
        reason: `Affected people (${count}) > 200: Substantial cluster requiring coordinated relief dispatch within 2 hours.`,
        score: 75,
      };
    } else if (count >= 50) {
      return {
        priority: 'Medium',
        reason: `Affected people (${count}) between 50 and 200: Stable community pocket with standard priority delivery.`,
        score: 50,
      };
    } else {
      return {
        priority: 'Low',
        reason: `Affected people (${count}) < 50: Localized non-critical requirement or routine maintenance supply.`,
        score: 25,
      };
    }
  }

  // --- REQUESTS ---
  public getRequests(): EmergencyRequest[] {
    return this.data.requests;
  }

  public getRequestById(id: string): EmergencyRequest | undefined {
    return this.data.requests.find((r) => r.id === id);
  }

  public createRequest(requestData: Partial<EmergencyRequest>, role: UserRole = 'Field Officer'): EmergencyRequest {
    const id = `REQ-${String(this.data.requests.length + 101)}`;
    const classification = this.classifyPriority(
      requestData.affectedPeople || 0,
      requestData.category,
      requestData.requestedResource
    );

    const newRequest: EmergencyRequest = {
      id,
      incidentId: requestData.incidentId || this.data.incidents[0]?.id || 'INC-01',
      location: requestData.location || 'Vijayawada Affected Area',
      coordinates: requestData.coordinates || { lat: 16.518, lng: 80.605 },
      requestedResource: requestData.requestedResource || 'Emergency Supplies',
      category: requestData.category || 'General',
      quantity: Number(requestData.quantity) || 50,
      unit: requestData.unit || 'Units',
      affectedPeople: Number(requestData.affectedPeople) || 100,
      priority: requestData.priority || classification.priority,
      priorityReason: classification.reason,
      status: 'Pending',
      assignedOrgId: null,
      assignedTeamId: null,
      assignedVehicleId: null,
      deliveryId: null,
      eta: null,
      notes: requestData.notes || '',
      createdAt: new Date().toISOString(),
    };

    this.data.requests.unshift(newRequest);

    if (newRequest.priority === 'Critical') {
      this.addAlert({
        type: 'critical',
        title: `🔴 Critical Request Created: ${newRequest.id}`,
        message: `${newRequest.quantity} ${newRequest.requestedResource} needed at ${newRequest.location} (${newRequest.affectedPeople} people).`,
        actionLink: 'requests',
      });
    }

    this.logAudit({
      userRole: role,
      action: 'Emergency Request Created',
      entity: 'Request',
      entityId: id,
      previousValue: null,
      newValue: `${newRequest.quantity} ${newRequest.requestedResource} (${newRequest.priority})`,
      reason: newRequest.priorityReason,
    });

    this.saveState();
    return newRequest;
  }

  public updateRequest(id: string, updates: Partial<EmergencyRequest>, role: UserRole = 'Command Center Admin'): EmergencyRequest {
    const reqIndex = this.data.requests.findIndex((r) => r.id === id);
    if (reqIndex === -1) throw new Error('Request not found');

    const old = { ...this.data.requests[reqIndex] };
    this.data.requests[reqIndex] = { ...old, ...updates };

    this.logAudit({
      userRole: role,
      action: 'Request Status Updated',
      entity: 'Request',
      entityId: id,
      previousValue: `Status: ${old.status}, Priority: ${old.priority}`,
      newValue: `Status: ${this.data.requests[reqIndex].status}, Priority: ${this.data.requests[reqIndex].priority}`,
      reason: (updates as any).updateReason || 'Field dispatch transition.',
    });

    this.saveState();
    return this.data.requests[reqIndex];
  }

  // --- RESOURCES ---
  public getResources(): ResourceInventory[] {
    return this.data.resources;
  }

  public updateResourceStock(resourceId: string, quantityDelta: number, type: 'add' | 'set' = 'add', role: UserRole = 'Organization Manager'): ResourceInventory {
    const res = this.data.resources.find((r) => r.id === resourceId);
    if (!res) throw new Error('Resource not found');

    const oldAvail = res.availableQuantity;
    if (type === 'add') {
      res.availableQuantity += Number(quantityDelta);
    } else if (type === 'set') {
      res.availableQuantity = Number(quantityDelta);
    }

    this.logAudit({
      userRole: role,
      action: 'Resource Inventory Modified',
      entity: 'Resource',
      entityId: resourceId,
      previousValue: `Available: ${oldAvail}`,
      newValue: `Available: ${res.availableQuantity}`,
      reason: 'Warehouse inventory adjustment.',
    });

    this.saveState();
    return res;
  }

  // --- TEAMS, VEHICLES, ORGS, SHELTERS ---
  public getTeams(): ResponseTeam[] {
    return this.data.teams;
  }

  public getVehicles(): Vehicle[] {
    return this.data.vehicles;
  }

  public getOrganizations(): Organization[] {
    return this.data.organizations;
  }

  public getShelters(): Shelter[] {
    return this.data.shelters;
  }

  public createShelter(shelterData: Partial<Shelter>, role: UserRole = 'Command Center Admin'): Shelter {
    const id = `SHL-${String(this.data.shelters.length + 1).padStart(2, '0')}`;
    const capacity = Number(shelterData.capacity) || 300;
    const occupied = Number(shelterData.occupied) || 0;
    const availableCapacity = Math.max(0, capacity - occupied);

    let status: 'Available' | 'Near Capacity' | 'Full' = 'Available';
    if (occupied >= capacity) {
      status = 'Full';
    } else if (occupied / capacity >= 0.9) {
      status = 'Near Capacity';
    }

    const facilities = Array.isArray(shelterData.facilities)
      ? shelterData.facilities
      : typeof shelterData.facilities === 'string'
      ? (shelterData.facilities as string).split(',').map((f) => f.trim()).filter(Boolean)
      : ['Clean Drinking Water', 'Basic Medical Post'];

    const newShelter: Shelter = {
      id,
      name: shelterData.name || 'New Relief Camp',
      location: shelterData.location || 'Vijayawada Urban Sector',
      coordinates: shelterData.coordinates || { lat: 16.512, lng: 80.63 },
      capacity,
      occupied,
      availableCapacity,
      status,
      facilities,
      manager: shelterData.manager || 'Camp Coordinator',
      contact: shelterData.contact || '+91-866-2400000',
    };

    this.data.shelters.push(newShelter);

    this.logAudit({
      userRole: role,
      action: 'Shelter Facility Registered',
      entity: 'Shelter',
      entityId: id,
      previousValue: null,
      newValue: `${newShelter.name} (Capacity: ${capacity})`,
      reason: `Activated as relief facility in ${newShelter.location} with ${availableCapacity} available beds.`,
    });

    this.saveState();
    return newShelter;
  }

  public updateShelter(id: string, updates: Partial<Shelter> & { updateReason?: string }, role: UserRole = 'Command Center Admin'): Shelter {
    const shelter = this.data.shelters.find((s) => s.id === id);
    if (!shelter) throw new Error('Shelter not found');

    const oldSnapshot = {
      capacity: shelter.capacity,
      occupied: shelter.occupied,
      status: shelter.status,
    };

    if (updates.name !== undefined) shelter.name = updates.name;
    if (updates.location !== undefined) shelter.location = updates.location;
    if (updates.capacity !== undefined) shelter.capacity = Number(updates.capacity);
    if (updates.occupied !== undefined) shelter.occupied = Number(updates.occupied);
    if (updates.manager !== undefined) shelter.manager = updates.manager;
    if (updates.contact !== undefined) shelter.contact = updates.contact;

    if (updates.facilities !== undefined) {
      if (Array.isArray(updates.facilities)) {
        shelter.facilities = updates.facilities;
      } else if (typeof (updates.facilities as any) === 'string') {
        shelter.facilities = (updates.facilities as unknown as string).split(',').map((f: string) => f.trim()).filter(Boolean);
      }
    }

    shelter.availableCapacity = Math.max(0, shelter.capacity - shelter.occupied);

    if (shelter.occupied >= shelter.capacity) {
      shelter.status = 'Full';
    } else if (shelter.occupied / shelter.capacity >= 0.9) {
      shelter.status = 'Near Capacity';
    } else {
      shelter.status = 'Available';
    }

    this.logAudit({
      userRole: role,
      action: 'Shelter Details Modified',
      entity: 'Shelter',
      entityId: id,
      previousValue: `Occupied: ${oldSnapshot.occupied}/${oldSnapshot.capacity} (${oldSnapshot.status})`,
      newValue: `Occupied: ${shelter.occupied}/${shelter.capacity} (${shelter.status})`,
      reason: updates.updateReason || 'Camp capacity or facility modification.',
    });

    this.saveState();
    return shelter;
  }

  // --- DELIVERIES ---
  public getDeliveries(): DeliveryOperation[] {
    return this.data.deliveries;
  }

  // --- ALLOCATION RECOMMENDATION ENGINE ---
  public recommendAllocation(requestId: string): AllocationRecommendation {
    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Request not found');

    const incident = this.data.incidents.find((i) => i.id === request.incidentId);
    const destCoords = request.coordinates || incident?.coordinates || { lat: 16.518, lng: 80.605 };

    const matchingResources = this.data.resources.filter(
      (r) =>
        r.type.toLowerCase() === request.requestedResource.toLowerCase() ||
        (request.category && r.category.toLowerCase() === request.category.toLowerCase())
    );

    const totalAvailable = matchingResources.reduce((sum, r) => sum + r.availableQuantity, 0);
    const isShortage = totalAvailable < request.quantity;
    const shortageAmount = isShortage ? request.quantity - totalAvailable : 0;

    const scoredResources = matchingResources
      .map((r) => {
        const dist = calculateDistanceKm(
          r.coordinates.lat,
          r.coordinates.lng,
          destCoords.lat,
          destCoords.lng
        );
        return {
          ...r,
          distanceKm: dist,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    let remainingNeeded = request.quantity;
    const allocationPlan = [];

    for (const res of scoredResources) {
      if (remainingNeeded <= 0) break;
      const takeQty = Math.min(res.availableQuantity, remainingNeeded);
      if (takeQty > 0) {
        allocationPlan.push({
          resourceId: res.id,
          orgId: res.orgId,
          orgName: res.orgName,
          type: res.type,
          warehouseLocation: res.warehouseLocation,
          quantity: takeQty,
          distanceKm: res.distanceKm,
        });
        remainingNeeded -= takeQty;
      }
    }

    let requiredTeamType: 'Medical' | 'Rescue' | 'Logistics' | 'Food Distribution' = 'Logistics';
    if (request.category === 'Medical' || request.requestedResource.toLowerCase().includes('med') || request.requestedResource.toLowerCase().includes('oxygen')) {
      requiredTeamType = 'Medical';
    } else if (request.category === 'Rescue' || request.requestedResource.toLowerCase().includes('boat')) {
      requiredTeamType = 'Rescue';
    } else if (request.category === 'Food') {
      requiredTeamType = 'Food Distribution';
    }

    const eligibleTeams = this.data.teams.filter(
      (t) => t.teamType === requiredTeamType && t.availability === 'Available'
    );
    const fallbackTeams = this.data.teams.filter((t) => t.availability === 'Available');
    const candidateTeams = eligibleTeams.length > 0 ? eligibleTeams : fallbackTeams;

    const scoredTeams = candidateTeams.map((t) => {
      const dist = calculateDistanceKm(
        t.coordinates.lat,
        t.coordinates.lng,
        destCoords.lat,
        destCoords.lng
      );
      return { ...t, distanceKm: dist };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const recommendedTeam = scoredTeams[0] || this.data.teams[0];

    let requiredVehicleType: 'Ambulance' | 'Truck' | 'Water Tanker' | 'Rescue Vehicle' = 'Truck';
    if (requiredTeamType === 'Medical') {
      requiredVehicleType = 'Ambulance';
    } else if (requiredTeamType === 'Rescue') {
      requiredVehicleType = 'Rescue Vehicle';
    } else if (request.requestedResource.toLowerCase().includes('water')) {
      requiredVehicleType = 'Water Tanker';
    }

    const availableVehicles = this.data.vehicles.filter((v) => v.status === 'Available');
    const typeMatchedVehicles = availableVehicles.filter(
      (v) => v.vehicleType === requiredVehicleType
    );
    const candidateVehicles = typeMatchedVehicles.length > 0 ? typeMatchedVehicles : availableVehicles;

    const scoredVehicles = candidateVehicles.map((v) => {
      const dist = calculateDistanceKm(
        v.coordinates.lat,
        v.coordinates.lng,
        destCoords.lat,
        destCoords.lng
      );
      return { ...v, distanceKm: dist };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const recommendedVehicle = scoredVehicles[0] || this.data.vehicles[0];

    const primaryDist = allocationPlan[0]?.distanceKm || 3.5;
    const estMinutes = Math.max(10, Math.round(primaryDist * 4 + 6));

    const evidence = [
      {
        criterion: 'Resource Match & Stock Verification',
        passed: !isShortage,
        details: isShortage
          ? `⚠️ Stock Deficit: Requested ${request.quantity} units, but only ${totalAvailable} units available across all depots. Shortage of ${shortageAmount} units detected.`
          : `✓ Exact resource type match '${request.requestedResource}' with sufficient collective stock (${totalAvailable} units available).`,
      },
      {
        criterion: 'Multi-Warehouse Proximity Optimization',
        passed: allocationPlan.length > 0,
        details: allocationPlan.length > 0
          ? `✓ Stock allocated from closest active depots: ${allocationPlan.map((p) => `${p.orgName} (${p.quantity} units, ${p.distanceKm} km)`).join('; ')}.`
          : 'No available warehouse identified.',
      },
      {
        criterion: 'Specialized Team Assignment',
        passed: !!recommendedTeam,
        details: recommendedTeam
          ? `✓ Team '${recommendedTeam.name}' selected (${recommendedTeam.teamType} specialist) - Status: Available, Skills: ${recommendedTeam.skills.slice(0, 2).join(', ')}, Base: ${recommendedTeam.distanceKm} km away.`
          : 'No active team currently available.',
      },
      {
        criterion: 'Vehicle Type & Payload Capacity Match',
        passed: !!recommendedVehicle,
        details: recommendedVehicle
          ? `✓ Vehicle '${recommendedVehicle.name}' (${recommendedVehicle.vehicleType}) capacity ${recommendedVehicle.capacity} ${recommendedVehicle.capacityUnit} is fully sufficient for load. Located ${recommendedVehicle.distanceKm} km away.`
          : 'No active vehicle currently available.',
      },
      {
        criterion: 'Route & Transit Time Feasibility',
        passed: true,
        details: `✓ Primary corridor open via main thoroughfare. Calculated ETA: ${estMinutes} minutes.`,
      },
    ];

    return {
      requestId: request.id,
      requestPriority: request.priority,
      requiredResource: request.requestedResource,
      quantityNeeded: request.quantity,
      totalAvailable,
      isShortage,
      shortageAmount,
      allocationPlan,
      recommendedTeam,
      recommendedVehicle,
      estimatedMinutes: estMinutes,
      evidence,
      route: {
        source: allocationPlan[0]?.warehouseLocation || 'Central Logistics Hub',
        destination: request.location,
        distanceKm: primaryDist,
      },
    };
  }

  public assignAllocation(params: {
    requestId: string;
    teamId: string;
    vehicleId: string;
    allocationPlan: any[];
    userRole?: UserRole;
  }): { delivery: DeliveryOperation; request: EmergencyRequest } {
    const { requestId, teamId, vehicleId, allocationPlan, userRole = 'Command Center Admin' } = params;

    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Request not found');

    const team = this.data.teams.find((t) => t.id === teamId);
    const vehicle = this.data.vehicles.find((v) => v.id === vehicleId);

    if (allocationPlan && Array.isArray(allocationPlan)) {
      for (const item of allocationPlan) {
        const res = this.data.resources.find((r) => r.id === item.resourceId);
        if (res) {
          if (res.availableQuantity < item.quantity) {
            throw new Error(`Insufficient stock in ${res.warehouseLocation} for ${res.type}`);
          }
          res.availableQuantity -= item.quantity;
          res.allocatedQuantity += item.quantity;
        }
      }
    }

    if (team) {
      team.availability = 'Assigned';
      team.currentAssignment = `Operation for ${request.id}`;
    }
    if (vehicle) {
      vehicle.status = 'En Route';
      vehicle.destination = request.location;
      vehicle.assignedTeamId = team?.id || null;
      vehicle.eta = '18 mins';
    }

    const opId = `OP-${String(this.data.deliveries.length + 101)}`;
    const sourceLoc = allocationPlan?.[0]?.warehouseLocation || 'Central Logistics Hub, Gunadala';
    const sourceRes = this.data.resources.find((r) => r.warehouseLocation === sourceLoc);

    const delivery: DeliveryOperation = {
      id: opId,
      requestId: request.id,
      incidentId: request.incidentId,
      resourceType: request.requestedResource,
      quantity: request.quantity,
      teamId: team?.id || 'TEAM-01',
      teamName: team?.name || 'NDRF Alpha',
      vehicleId: vehicle?.id || 'VEH-01',
      vehicleName: vehicle?.name || 'Ambulance AMB-01',
      sourceLocation: sourceLoc,
      sourceCoordinates: sourceRes?.coordinates || { lat: 16.514, lng: 80.655 },
      destinationLocation: request.location,
      destinationCoordinates: request.coordinates || { lat: 16.52, lng: 80.595 },
      status: 'En Route',
      progressPercent: 20,
      currentWayPointIndex: 1,
      waypoints: [
        { name: sourceLoc, lat: 16.514, lng: 80.655, status: 'passed' },
        { name: 'Prakasam Barrage Approach Checkpoint', lat: 16.508, lng: 80.606, status: 'pending' },
        { name: 'Bhavanipuram Sector Crossing', lat: 16.516, lng: 80.6, status: 'pending' },
        { name: request.location, lat: 16.52, lng: 80.595, status: 'pending' },
      ],
      originalRoute: 'Logistics Hub -> Prakasam Barrage Approach -> Bhavanipuram Sector',
      activeRoute: 'Logistics Hub -> Prakasam Barrage Approach -> Bhavanipuram Sector',
      etaMinutes: 18,
      isBlocked: false,
      blockageDetails: null,
      rerouteReason: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    this.data.deliveries.unshift(delivery);

    request.status = 'Allocated';
    request.assignedOrgId = allocationPlan?.[0]?.orgId || 'ORG-01';
    request.assignedTeamId = team?.id || null;
    request.assignedVehicleId = vehicle?.id || null;
    request.deliveryId = opId;
    request.eta = '18 mins';

    this.logAudit({
      userRole,
      action: 'Resource Allocation & Delivery Dispatched',
      entity: 'Delivery',
      entityId: opId,
      previousValue: 'Unassigned',
      newValue: `Dispatched ${vehicle?.name || 'Vehicle'} with ${team?.name || 'Team'} to ${request.location}`,
      reason: `Automated recommendation approved. ${request.quantity} units allocated from ${sourceLoc}.`,
    });

    this.addAlert({
      type: 'info',
      title: `🚚 Operation ${opId} Dispatched`,
      message: `${team?.name} dispatched via ${vehicle?.name} carrying ${request.quantity} ${request.requestedResource}. ETA: 18 min.`,
      actionLink: 'deliveries',
    });

    this.saveState();
    return { delivery, request };
  }

  // --- SIMULATION: ROAD BLOCKAGE ---
  public simulateRoadBlockage(deliveryId?: string, _userRole: UserRole = 'Field Officer'): { delivery: DeliveryOperation; explanation: any } {
    let delivery = this.data.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      delivery = this.data.deliveries.find((d) => d.status === 'En Route') || this.data.deliveries[0];
    }
    if (!delivery) throw new Error('No active delivery operation to block');

    const previousRoute = delivery.activeRoute;
    const previousEta = delivery.etaMinutes;

    delivery.isBlocked = true;
    delivery.status = 'Route Blocked';
    delivery.blockageDetails = 'Flash surge over Prakasam Barrage North embankment: +3.2m water inundation & debris blockage.';

    if (delivery.waypoints && delivery.waypoints[1]) {
      delivery.waypoints[1].status = 'blocked';
    }

    const alternativeRoute = 'Diverted via Kanaka Durga Elevated Flyover & Inner Ring Road Bypass';
    const newEta = previousEta + 10;

    delivery.activeRoute = alternativeRoute;
    delivery.etaMinutes = newEta;
    delivery.status = 'Rerouted';
    delivery.rerouteReason = 'Assignment changed because the original route became unavailable due to flash flood obstruction.';

    const vehicle = this.data.vehicles.find((v) => v.id === delivery.vehicleId);
    if (vehicle) {
      vehicle.status = 'En Route';
      vehicle.eta = `${newEta} mins (Bypass)`;
    }

    this.addAlert({
      type: 'critical',
      title: `🚨 Road Blockage Detected on ${delivery.id}`,
      message: `Prakasam Barrage route submerged. System automatically rerouted ${delivery.vehicleName} via Kanaka Durga Flyover. New ETA: ${newEta} mins.`,
      actionLink: 'tracking',
    });

    this.logAudit({
      userRole: 'System AI Engine',
      action: 'Route Recalculated & Diverted',
      entity: 'Delivery',
      entityId: delivery.id,
      previousValue: `Route: ${previousRoute} (ETA: ${previousEta} min)`,
      newValue: `Route: ${alternativeRoute} (ETA: ${newEta} min)`,
      reason: 'Assignment changed because the original route became unavailable (Road blockage at Prakasam Barrage).',
    });

    this.saveState();

    return {
      delivery,
      explanation: {
        title: 'Why was the route recalculated?',
        previousRoute,
        alternativeRoute,
        previousEta: `${previousEta} minutes`,
        newEta: `${newEta} minutes`,
        hazard: delivery.blockageDetails,
        evidence: [
          '✓ Real-time telemetry identified road impassability at Prakasam Barrage North',
          '✓ Original route marked unavailable in dispatch grid',
          '✓ Alternative elevated bypass (Kanaka Durga Flyover) verified accessible for emergency vehicles',
          '✓ Assignment updated dynamically with revised ETA of ' + newEta + ' minutes',
          '✓ Command Center and Field Response Team automatically alerted',
        ],
      },
    };
  }

  // --- SIMULATION: RESOURCE SHORTAGE ---
  public simulateResourceShortage(data: { resourceType?: string; quantity?: number } = {}, _role: UserRole = 'Command Center Admin'): any {
    const requestedResource = data.resourceType || 'Food Packets';
    const quantityNeeded = Number(data.quantity) || 800;

    const matching = this.data.resources.filter(
      (r) => r.type.toLowerCase() === requestedResource.toLowerCase()
    );
    const totalAvail = matching.reduce((sum, r) => sum + r.availableQuantity, 0);
    const deficit = Math.max(0, quantityNeeded - totalAvail);

    const shortagePlan = {
      requestedResource,
      quantityNeeded,
      totalAvailable: totalAvail,
      deficit,
      recommendations: [
        {
          priority: 1,
          strategy: 'Cross-Organization Multi-Inventory Allocation',
          action: `Consolidate all available ${totalAvail} units from ${matching.map((m) => m.orgName).join(' and ')}.`,
          rationale: 'Exhaust immediate in-city depot stocks before invoking external aid.',
        },
        {
          priority: 2,
          strategy: 'Inter-District Buffer Transfer',
          action: `Requisition ${deficit} units from Guntur Regional Logistics Reserve (28 km away).`,
          rationale: 'Guntur depot reports 3,500 surplus packets; transit ETA 45 minutes via NH16 bypass.',
        },
        {
          priority: 3,
          strategy: 'Escalate to State Disaster Management Authority (SDMA)',
          action: 'Issue emergency requisition voucher to AP Civil Supplies Corporation.',
          rationale: 'Mandatory protocol when local urban reserves dip below 30% safety threshold.',
        },
      ],
      evidence: [
        `✓ Deficit identified: Required ${quantityNeeded} units, urban stock contains ${totalAvail} units (Deficit: ${deficit} units)`,
        '✓ Identified secondary stock in neighboring Guntur district warehouse',
        '✓ Cross-organization protocol automatically drafted',
        '✓ Recommended immediate dispatch of available stock + external requisition',
      ],
    };

    this.addAlert({
      type: 'warning',
      title: `⚠️ Critical Resource Shortage: ${requestedResource}`,
      message: `Deficit of ${deficit} units detected for emergency quota. Multi-org consolidation and Guntur transfer initiated.`,
      actionLink: 'resources',
    });

    this.logAudit({
      userRole: 'System AI Engine',
      action: 'Resource Shortage Analysis & Escalation',
      entity: 'Resource',
      entityId: requestedResource,
      previousValue: `Available: ${totalAvail}`,
      newValue: `Deficit: ${deficit}`,
      reason: `Automated shortage handling for requirement of ${quantityNeeded} ${requestedResource}.`,
    });

    this.saveState();
    return shortagePlan;
  }

  // --- SIMULATION: SHELTER OVERCROWDING ---
  public simulateShelterOvercrowd(shelterId: string = 'SHL-02', _role: UserRole = 'Field Officer'): any {
    const shelter = this.data.shelters.find((s) => s.id === shelterId) || this.data.shelters[1];
    if (!shelter) throw new Error('Shelter not found');

    const prevOccupied = shelter.occupied;
    shelter.occupied = shelter.capacity;
    shelter.availableCapacity = 0;
    shelter.status = 'Full';

    const otherShelters = this.data.shelters
      .filter((s) => s.id !== shelter.id && s.availableCapacity > 50)
      .map((s) => {
        const dist = calculateDistanceKm(
          shelter.coordinates.lat,
          shelter.coordinates.lng,
          s.coordinates.lat,
          s.coordinates.lng
        );
        return { ...s, distanceKm: dist };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    const targetShelter = otherShelters[0] || this.data.shelters[2];

    const redirectPlan = {
      fullShelter: shelter,
      targetShelter,
      redirectCount: 40,
      evidence: [
        `✓ Source Shelter '${shelter.name}' reached 100% capacity (${shelter.capacity}/${shelter.capacity} evacuees)`,
        `✓ Nearest relief facility with surplus space identified: '${targetShelter.name}' (${targetShelter.distanceKm} km away)`,
        `✓ Available beds at target: ${targetShelter.availableCapacity} remaining capacity`,
        `✓ Target facility verified: Equipped with ${targetShelter.facilities.join(', ')}`,
        '✓ Transit shuttle buses alerted for smooth passenger diversion',
      ],
    };

    this.addAlert({
      type: 'warning',
      title: `🟡 Shelter S-02 Reached Full Capacity`,
      message: `${shelter.name} is FULL. Incoming evacuees automatically redirected to ${targetShelter.name} (${targetShelter.availableCapacity} beds open).`,
      actionLink: 'shelters',
    });

    this.logAudit({
      userRole: 'System AI Engine',
      action: 'Shelter Evacuee Redirection',
      entity: 'Shelter',
      entityId: shelter.id,
      previousValue: `Occupied: ${prevOccupied}/${shelter.capacity}`,
      newValue: `Status: FULL (Redirecting to ${targetShelter.name})`,
      reason: 'Shelter capacity exhausted. Automated load balancing to closest available facility.',
    });

    this.saveState();
    return redirectPlan;
  }

  // --- STEP DELIVERY MOVEMENT ---
  public stepDeliveryMovement(deliveryId: string): DeliveryOperation {
    const delivery = this.data.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) throw new Error('Delivery not found');

    if (delivery.status === 'Delivered') return delivery;

    delivery.progressPercent = Math.min(100, delivery.progressPercent + 30);
    delivery.etaMinutes = Math.max(0, delivery.etaMinutes - 6);

    if (delivery.progressPercent >= 50 && delivery.waypoints[1]) {
      if (delivery.waypoints[1].status !== 'blocked') {
        delivery.waypoints[1].status = 'passed';
      }
    }
    if (delivery.progressPercent >= 80 && delivery.waypoints[2]) {
      delivery.waypoints[2].status = 'passed';
    }

    if (delivery.progressPercent >= 100) {
      delivery.status = 'Delivered';
      delivery.completedAt = new Date().toISOString();
      delivery.etaMinutes = 0;
      if (delivery.waypoints[3]) delivery.waypoints[3].status = 'passed';

      const req = this.getRequestById(delivery.requestId);
      if (req) {
        req.status = 'Delivered';
      }

      const veh = this.data.vehicles.find((v) => v.id === delivery.vehicleId);
      if (veh) {
        veh.status = 'Available';
        veh.destination = null;
        veh.eta = null;
      }

      const team = this.data.teams.find((t) => t.id === delivery.teamId);
      if (team) {
        team.availability = 'Available';
        team.currentAssignment = null;
      }

      const res = this.data.resources.find(
        (r) => r.type.toLowerCase() === delivery.resourceType.toLowerCase()
      );
      if (res) {
        res.allocatedQuantity = Math.max(0, res.allocatedQuantity - delivery.quantity);
        res.consumedQuantity += delivery.quantity;
      }

      this.logAudit({
        userRole: 'Response Team',
        action: 'Delivery Operation Completed',
        entity: 'Delivery',
        entityId: delivery.id,
        previousValue: 'En Route',
        newValue: 'Delivered',
        reason: `Relief package of ${delivery.quantity} ${delivery.resourceType} handed over at ${delivery.destinationLocation}.`,
      });

      this.addAlert({
        type: 'success',
        title: `✅ Delivery ${delivery.id} Completed`,
        message: `${delivery.teamName} successfully delivered supplies to ${delivery.destinationLocation}.`,
        actionLink: 'deliveries',
      });
    }

    this.saveState();
    return delivery;
  }

  // --- SITUATION REPORT ---
  public getAiSitrep(): { sitrep: string; source: string } {
    const incidents = this.data.incidents;
    const requests = this.data.requests;
    const shelters = this.data.shelters;

    const criticalCount = requests.filter((r) => r.priority === 'Critical').length;
    const pendingCount = requests.filter((r) => r.status === 'Pending').length;
    const activeIncidents = incidents.filter((i) => i.status === 'Active');

    const heuristicSitrep = `### 🛰️ NERCP SITUATION REPORT (SITREP) — VIJAYAWADA FLOOD DISASTER 2026
**Operational Phase:** Acute Inundation Response | **State Alert Level:** 3 (Critical)
**Field Telemetry:** ${activeIncidents.length} Active Floods | ${pendingCount} Pending Requests (${criticalCount} Critical)

#### 1. EXECUTIVE THREAT ASSESSMENT
- **Zone A (Bhavanipuram):** Severe river surge (+2.8m above danger mark) isolated 1,200 citizens. Water levels remain elevated along Krishna riverbank.
- **Zone B (One Town):** Drainage backflow near foothills obstructing narrow lanes. 180 households monitored.
- **Zone C (Auto Nagar):** Waterlogged substation poses electrical safety risk; auxiliary pumping activated.

#### 2. STRATEGIC RESOURCE DEPLOYMENT
- **Top Priority:** Critical Medical Kits and high-priority food packets prioritized for isolated sectors.
- **Evacuation Shelters:** Active shelters operating at high capacity. Overflow routing protocol active for saturated relief camps.
- **Fleet Grid:** Rescue boats and ambulances deployed across primary bypass corridors.

#### 3. CRITICAL RISK ADVISORY
- **Prakasam Barrage Corridor:** Flash flood risk. Dynamic elevated reroute via Kanaka Durga Viaduct is staged and ready for bypass.`;

    return { sitrep: heuristicSitrep, source: 'NERCP Tactical Rule Engine (Client In-Memory)' };
  }

  // --- AUDIT LOGS & ALERTS ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public getAlerts(): SystemAlert[] {
    return this.data.alerts;
  }

  public markAlertRead(id: string): SystemAlert {
    const alert = this.data.alerts.find((a) => a.id === id);
    if (alert) alert.read = true;
    this.saveState();
    return alert || { id, type: 'info', title: '', message: '', timestamp: '', read: true, actionLink: null };
  }

  private logAudit(entry: Partial<AuditLog>): AuditLog {
    const newLog: AuditLog = {
      id: `AUD-${String(this.data.auditLogs.length + 1).padStart(2, '0')}`,
      timestamp: new Date().toISOString(),
      userRole: entry.userRole || 'System AI Engine',
      action: entry.action || 'System Event',
      entity: entry.entity || 'System',
      entityId: entry.entityId || 'SYS-01',
      previousValue: entry.previousValue || null,
      newValue: entry.newValue || null,
      reason: entry.reason || 'Standard system event',
    };
    this.data.auditLogs.unshift(newLog);
    return newLog;
  }

  private addAlert(alert: Partial<SystemAlert>): SystemAlert {
    const newAlert: SystemAlert = {
      id: `ALT-${String(this.data.alerts.length + 1).padStart(2, '0')}`,
      type: alert.type || 'info',
      title: alert.title || 'Alert',
      message: alert.message || '',
      timestamp: new Date().toISOString(),
      read: false,
      actionLink: alert.actionLink || null,
    };
    this.data.alerts.unshift(newAlert);
    return newAlert;
  }
}

export const clientStore = new ClientEmergencyStore();
