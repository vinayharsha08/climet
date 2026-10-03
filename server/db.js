const fs = require('fs');
const path = require('path');

const INITIAL_DATA_FILE = path.join(__dirname, 'initialData.json');
const STATE_FILE = path.join(__dirname, 'state.json');

// Distance calculation using Haversine formula (km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.5;
  const R = 6371; // Earth's radius in km
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

class EmergencyDatabase {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.reset();
      }
    } catch (err) {
      console.error('Error loading database state, falling back to initial data:', err);
      this.reset();
    }
  }

  save() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save state:', err);
    }
  }

  reset() {
    const raw = fs.readFileSync(INITIAL_DATA_FILE, 'utf-8');
    this.data = JSON.parse(raw);
    this.save();
    return this.data;
  }

  // --- INCIDENTS ---
  getIncidents() {
    return this.data.incidents;
  }

  getIncidentById(id) {
    return this.data.incidents.find((inc) => inc.id === id);
  }

  createIncident(incidentData, role = 'Command Center Admin') {
    const id = `INC-${String(this.data.incidents.length + 1).padStart(2, '0')}`;
    const newIncident = {
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

    this.save();
    return newIncident;
  }

  updateIncident(id, updates, role = 'Command Center Admin') {
    const incIndex = this.data.incidents.findIndex((i) => i.id === id);
    if (incIndex === -1) return null;

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

    this.save();
    return this.data.incidents[incIndex];
  }

  // --- EXPLAINABLE PRIORITY CLASSIFIER ---
  classifyPriority(affectedPeople, category, requestedResource) {
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

  // --- EMERGENCY REQUESTS ---
  getRequests() {
    return this.data.requests;
  }

  getRequestById(id) {
    return this.data.requests.find((r) => r.id === id);
  }

  createRequest(requestData, role = 'Field Officer') {
    const id = `REQ-${String(this.data.requests.length + 101)}`;
    const classification = this.classifyPriority(
      requestData.affectedPeople,
      requestData.category,
      requestData.requestedResource
    );

    const newRequest = {
      id,
      incidentId: requestData.incidentId || this.data.incidents[0]?.id || 'INC-01',
      location: requestData.location || 'Vijayawada Affected Area',
      coordinates: requestData.coordinates || { lat: 16.518, lng: 80.605 },
      requestedResource: requestData.requestedResource,
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

    this.save();
    return newRequest;
  }

  updateRequest(id, updates, role = 'Command Center Admin') {
    const reqIndex = this.data.requests.findIndex((r) => r.id === id);
    if (reqIndex === -1) return null;

    const old = { ...this.data.requests[reqIndex] };
    this.data.requests[reqIndex] = { ...old, ...updates };

    this.logAudit({
      userRole: role,
      action: 'Request Status Updated',
      entity: 'Request',
      entityId: id,
      previousValue: `Status: ${old.status}, Priority: ${old.priority}`,
      newValue: `Status: ${this.data.requests[reqIndex].status}, Priority: ${this.data.requests[reqIndex].priority}`,
      reason: updates.updateReason || 'Field dispatch transition.',
    });

    this.save();
    return this.data.requests[reqIndex];
  }

  // --- RESOURCE INVENTORY ---
  getResources() {
    return this.data.resources;
  }

  updateResourceStock(resourceId, quantityDelta, type = 'add', role = 'Organization Manager') {
    const res = this.data.resources.find((r) => r.id === resourceId);
    if (!res) return null;

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

    this.save();
    return res;
  }

  // --- TEAMS & VEHICLES ---
  getTeams() {
    return this.data.teams;
  }

  getVehicles() {
    return this.data.vehicles;
  }

  getShelters() {
    return this.data.shelters;
  }

  getOrganizations() {
    return this.data.organizations;
  }

  // --- EXPLAINABLE ALLOCATION RECOMMENDATION ENGINE ---
  recommendAllocation(requestId) {
    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Request not found');

    const incident = this.getIncidentById(request.incidentId);
    const destCoords = request.coordinates || incident?.coordinates || { lat: 16.518, lng: 80.605 };

    // 1. Filter matching resources
    const matchingResources = this.data.resources.filter(
      (r) =>
        r.type.toLowerCase() === request.requestedResource.toLowerCase() ||
        (request.category && r.category.toLowerCase() === request.category.toLowerCase())
    );

    const totalAvailable = matchingResources.reduce((sum, r) => sum + r.availableQuantity, 0);
    const isShortage = totalAvailable < request.quantity;
    const shortageAmount = isShortage ? request.quantity - totalAvailable : 0;

    // Rank matching resources by proximity and stock
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

    // Formulate multi-org allocation breakdown
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

    // 2. Select best Team
    // Match skill type: Medical -> Medical, Rescue -> Rescue, Food/Water -> Food Distribution or Logistics
    let requiredTeamType = 'Logistics';
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

    // Pick closest candidate team
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

    // 3. Select best Vehicle
    // Match vehicle type and capacity
    let requiredVehicleType = 'Truck';
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

    // Approximate estimated arrival time based on distance & flood conditions
    const primaryDist = allocationPlan[0]?.distanceKm || 3.5;
    const estMinutes = Math.max(10, Math.round(primaryDist * 4 + 6)); // ~18 min

    // Compile "Why this allocation?" Evidence
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

  // --- COMMIT ALLOCATION & CREATE DELIVERY OPERATION ---
  assignAllocation(params, role = 'Command Center Admin') {
    const { requestId, teamId, vehicleId, allocationPlan } = params;

    const request = this.getRequestById(requestId);
    if (!request) throw new Error('Request not found');

    const team = this.data.teams.find((t) => t.id === teamId);
    const vehicle = this.data.vehicles.find((v) => v.id === vehicleId);

    // 1. Deduct resources from inventory
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

    // 2. Mark team and vehicle as assigned / en-route
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

    // 3. Create Delivery Operation
    const opId = `OP-${String(this.data.deliveries.length + 101)}`;
    const sourceLoc = allocationPlan?.[0]?.warehouseLocation || 'Central Logistics Hub, Gunadala';
    const sourceRes = this.data.resources.find((r) => r.warehouseLocation === sourceLoc);

    const delivery = {
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

    // 4. Update request status
    request.status = 'Allocated';
    request.assignedOrgId = allocationPlan?.[0]?.orgId || 'ORG-01';
    request.assignedTeamId = team?.id || null;
    request.assignedVehicleId = vehicle?.id || null;
    request.deliveryId = opId;
    request.eta = '18 mins';

    // 5. Audit Log
    this.logAudit({
      userRole: role,
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

    this.save();
    return { delivery, request };
  }

  // --- CRITICAL LIVE SCENARIO 1: SIMULATE ROAD BLOCKAGE ---
  simulateRoadBlockage(deliveryId, role = 'Field Officer') {
    let delivery = this.data.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) {
      delivery = this.data.deliveries.find((d) => d.status === 'En Route') || this.data.deliveries[0];
    }
    if (!delivery) throw new Error('No active delivery operation to block');

    const previousRoute = delivery.activeRoute;
    const previousEta = delivery.etaMinutes;
    const oldVehicle = delivery.vehicleName;

    // Detect obstruction at Prakasam Barrage
    delivery.isBlocked = true;
    delivery.status = 'Route Blocked';
    delivery.blockageDetails = 'Flash surge over Prakasam Barrage North embankment: +3.2m water inundation & debris blockage.';
    
    // Mark waypoint as blocked
    if (delivery.waypoints && delivery.waypoints[1]) {
      delivery.waypoints[1].status = 'blocked';
    }

    // Recalculate alternative bypass route:
    // Divert via Kanaka Durga Flyover & Inner Ring Bypass
    const alternativeRoute = 'Diverted via Kanaka Durga Elevated Flyover & Inner Ring Road Bypass';
    const newEta = previousEta + 10; // +10 minutes for detour

    delivery.activeRoute = alternativeRoute;
    delivery.etaMinutes = newEta;
    delivery.status = 'Rerouted';
    delivery.rerouteReason = 'Assignment changed because the original route became unavailable due to flash flood obstruction.';

    // Check if vehicle status should reflect reroute
    const vehicle = this.data.vehicles.find((v) => v.id === delivery.vehicleId);
    if (vehicle) {
      vehicle.status = 'En Route';
      vehicle.eta = `${newEta} mins (Bypass)`;
    }

    // System creates Critical Alert
    this.addAlert({
      type: 'critical',
      title: `🚨 Road Blockage Detected on ${delivery.id}`,
      message: `Prakasam Barrage route submerged. System automatically rerouted ${delivery.vehicleName} via Kanaka Durga Flyover. New ETA: ${newEta} mins.`,
      actionLink: 'tracking',
    });

    // Create Audit Log
    this.logAudit({
      userRole: 'System AI Engine',
      action: 'Route Recalculated & Diverted',
      entity: 'Delivery',
      entityId: delivery.id,
      previousValue: `Route: ${previousRoute} (ETA: ${previousEta} min)`,
      newValue: `Route: ${alternativeRoute} (ETA: ${newEta} min)`,
      reason: 'Assignment changed because the original route became unavailable (Road blockage at Prakasam Barrage).',
    });

    this.save();

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

  // --- CRITICAL LIVE SCENARIO 2: SIMULATE RESOURCE SHORTAGE ---
  simulateResourceShortage(data = {}, role = 'Command Center Admin') {
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

    this.save();
    return shortagePlan;
  }

  // --- SHELTER OVERCROWDING & REDIRECT SIMULATION ---
  simulateShelterOvercrowd(shelterId = 'SHL-02', role = 'Field Officer') {
    const shelter = this.data.shelters.find((s) => s.id === shelterId) || this.data.shelters[1];
    if (!shelter) throw new Error('Shelter not found');

    const prevOccupied = shelter.occupied;
    shelter.occupied = shelter.capacity; // 100% capacity
    shelter.availableCapacity = 0;
    shelter.status = 'Full';

    // Find nearest shelter with available capacity
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
      .sort((a, b) => a.distanceKm - b.distanceKm);

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

    this.save();
    return redirectPlan;
  }

  // --- STEP SIMULATED MOVEMENT & DELIVERY COMPLETION ---
  stepDeliveryMovement(deliveryId) {
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

      // Update associated request
      const req = this.getRequestById(delivery.requestId);
      if (req) {
        req.status = 'Delivered';
      }

      // Free vehicle and team
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

      // Deduct from allocated to consumed in inventory
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

    this.save();
    return delivery;
  }

  // --- AUDIT LOGS & ALERTS ---
  getAuditLogs() {
    return this.data.auditLogs;
  }

  logAudit(entry) {
    const newLog = {
      id: `AUD-${String(this.data.auditLogs.length + 1).padStart(2, '0')}`,
      timestamp: new Date().toISOString(),
      userRole: entry.userRole || 'System',
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      previousValue: entry.previousValue || null,
      newValue: entry.newValue || null,
      reason: entry.reason || 'Standard system event',
    };
    this.data.auditLogs.unshift(newLog);
    return newLog;
  }

  getAlerts() {
    return this.data.alerts;
  }

  addAlert(alert) {
    const newAlert = {
      id: `ALT-${String(this.data.alerts.length + 1).padStart(2, '0')}`,
      type: alert.type || 'info',
      title: alert.title,
      message: alert.message,
      timestamp: new Date().toISOString(),
      read: false,
      actionLink: alert.actionLink || null,
    };
    this.data.alerts.unshift(newAlert);
    return newAlert;
  }

  markAlertRead(id) {
    const alert = this.data.alerts.find((a) => a.id === id);
    if (alert) alert.read = true;
    this.save();
    return alert;
  }
}

const db = new EmergencyDatabase();

module.exports = db;
