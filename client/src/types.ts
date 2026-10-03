export type UserRole =
  | 'Command Center Admin'
  | 'Organization Manager'
  | 'Field Officer'
  | 'Response Team';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  role: string;
  contact: string;
  baseLocation: string;
  active: boolean;
}

export interface Incident {
  id: string;
  name: string;
  disasterType: string;
  zone: string;
  location: string;
  coordinates: Coordinates;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedPopulation: number;
  waterLevel: string;
  status: 'Active' | 'Contained' | 'Resolved';
  description: string;
  createdAt: string;
  updatedAt?: string;
  updateReason?: string;
}

export interface EmergencyRequest {
  id: string;
  incidentId: string;
  location: string;
  coordinates?: Coordinates;
  requestedResource: string;
  category: string;
  quantity: number;
  unit: string;
  affectedPeople: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  priorityReason: string;
  status: 'Pending' | 'Allocated' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled';
  assignedOrgId: string | null;
  assignedTeamId: string | null;
  assignedVehicleId: string | null;
  deliveryId: string | null;
  eta: string | null;
  notes?: string;
  createdAt: string;
}

export interface ResourceInventory {
  id: string;
  orgId: string;
  orgName: string;
  type: string;
  category: 'Medical' | 'Food' | 'Water' | 'Rescue' | 'Shelter';
  availableQuantity: number;
  reservedQuantity: number;
  allocatedQuantity: number;
  consumedQuantity: number;
  warehouseLocation: string;
  coordinates: Coordinates;
  expiry: string | null;
  status: 'Available' | 'Low Stock' | 'Depleted';
}

export interface ResponseTeam {
  id: string;
  name: string;
  orgId: string;
  teamType: 'Medical' | 'Rescue' | 'Logistics' | 'Food Distribution';
  membersCount: number;
  leader: string;
  skills: string[];
  currentLocation: string;
  coordinates: Coordinates;
  availability: 'Available' | 'Assigned' | 'On Mission' | 'Resting';
  currentAssignment: string | null;
  workload: string;
  distanceKm?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  vehicleType: 'Ambulance' | 'Truck' | 'Water Tanker' | 'Rescue Vehicle';
  orgId: string;
  capacity: number;
  capacityUnit: string;
  currentLocation: string;
  coordinates: Coordinates;
  status: 'Available' | 'En Route' | 'Route Blocked' | 'Delivered' | 'Maintenance';
  driver: string;
  assignedTeamId: string | null;
  destination: string | null;
  eta: string | null;
  fuelLevel: number;
  distanceKm?: number;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  coordinates: Coordinates;
  capacity: number;
  occupied: number;
  availableCapacity: number;
  status: 'Available' | 'Near Capacity' | 'Full';
  facilities: string[];
  manager: string;
  contact: string;
  distanceKm?: number;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  status: 'pending' | 'passed' | 'blocked';
}

export interface DeliveryOperation {
  id: string;
  requestId: string;
  incidentId: string;
  resourceType: string;
  quantity: number;
  teamId: string;
  teamName: string;
  vehicleId: string;
  vehicleName: string;
  sourceLocation: string;
  sourceCoordinates: Coordinates;
  destinationLocation: string;
  destinationCoordinates: Coordinates;
  status: 'Assigned' | 'En Route' | 'Route Blocked' | 'Rerouted' | 'Delivered';
  progressPercent: number;
  currentWayPointIndex: number;
  waypoints: Waypoint[];
  originalRoute: string;
  activeRoute: string;
  etaMinutes: number;
  isBlocked: boolean;
  blockageDetails: string | null;
  rerouteReason: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole | 'System AI Engine';
  action: string;
  entity: string;
  entityId: string;
  previousValue: string | null;
  newValue: string | null;
  reason: string;
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink: string | null;
}

export interface AllocationPlanItem {
  resourceId: string;
  orgId: string;
  orgName: string;
  type: string;
  warehouseLocation: string;
  quantity: number;
  distanceKm: number;
}

export interface EvidenceItem {
  criterion: string;
  passed: boolean;
  details: string;
}

export interface AllocationRecommendation {
  requestId: string;
  requestPriority: string;
  requiredResource: string;
  quantityNeeded: number;
  totalAvailable: number;
  isShortage: boolean;
  shortageAmount: number;
  allocationPlan: AllocationPlanItem[];
  recommendedTeam: ResponseTeam;
  recommendedVehicle: Vehicle;
  estimatedMinutes: number;
  evidence: EvidenceItem[];
  route: {
    source: string;
    destination: string;
    distanceKm: number;
  };
}

export interface DashboardStats {
  kpis: {
    activeIncidents: number;
    criticalRequests: number;
    pendingRequests: number;
    totalResourcesAvailable: number;
    activeDeliveries: number;
    availableVehicles: number;
    availableTeams: number;
    shelterOccupancyRate: number;
  };
  charts: {
    priorityDist: Record<string, number>;
    statusDist: Record<string, number>;
    shelters: Array<{
      name: string;
      capacity: number;
      occupied: number;
      percent: number;
      status: string;
    }>;
    resourcesByCategory: Array<{
      category: string;
      count: number;
    }>;
  };
  activeAlerts: SystemAlert[];
  recentActivity: AuditLog[];
}
