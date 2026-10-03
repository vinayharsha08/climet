const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// --- DASHBOARD SUMMARY STATS ---
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const incidents = db.getIncidents();
    const requests = db.getRequests();
    const resources = db.getResources();
    const vehicles = db.getVehicles();
    const teams = db.getTeams();
    const shelters = db.getShelters();
    const deliveries = db.data.deliveries;
    const alerts = db.getAlerts();
    const auditLogs = db.getAuditLogs();

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

    res.json({
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
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INCIDENTS ---
app.get('/api/incidents', (req, res) => {
  res.json(db.getIncidents());
});

app.post('/api/incidents', (req, res) => {
  try {
    const { userRole, ...incidentData } = req.body;
    const newInc = db.createIncident(incidentData, userRole);
    res.status(201).json(newInc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/incidents/:id', (req, res) => {
  try {
    const { userRole, ...updates } = req.body;
    const updated = db.updateIncident(req.params.id, updates, userRole);
    if (!updated) return res.status(404).json({ error: 'Incident not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- REQUESTS ---
app.get('/api/requests', (req, res) => {
  res.json(db.getRequests());
});

app.post('/api/requests/classify-priority', (req, res) => {
  const { affectedPeople, category, requestedResource } = req.body;
  const classification = db.classifyPriority(affectedPeople, category, requestedResource);
  res.json(classification);
});

app.post('/api/requests', (req, res) => {
  try {
    const { userRole, ...reqData } = req.body;
    const newReq = db.createRequest(reqData, userRole);
    res.status(201).json(newReq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/requests/:id', (req, res) => {
  try {
    const { userRole, ...updates } = req.body;
    const updated = db.updateRequest(req.params.id, updates, userRole);
    if (!updated) return res.status(404).json({ error: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- RESOURCES ---
app.get('/api/resources', (req, res) => {
  res.json(db.getResources());
});

app.post('/api/resources/:id/stock', (req, res) => {
  try {
    const { delta, type, userRole } = req.body;
    const updated = db.updateResourceStock(req.params.id, delta, type, userRole);
    if (!updated) return res.status(404).json({ error: 'Resource not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- ORGANIZATIONS, TEAMS, VEHICLES, SHELTERS ---
app.get('/api/organizations', (req, res) => {
  res.json(db.getOrganizations());
});

app.get('/api/teams', (req, res) => {
  res.json(db.getTeams());
});

app.get('/api/vehicles', (req, res) => {
  res.json(db.getVehicles());
});

app.get('/api/shelters', (req, res) => {
  res.json(db.getShelters());
});

// --- DELIVERIES ---
app.get('/api/deliveries', (req, res) => {
  res.json(db.data.deliveries);
});

// --- EXPLAINABLE ALLOCATION ENGINE ---
app.post('/api/allocations/recommend', (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ error: 'requestId is required' });
    const recommendation = db.recommendAllocation(requestId);
    res.json(recommendation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/allocations/assign', (req, res) => {
  try {
    const { userRole, ...params } = req.body;
    const result = db.assignAllocation(params, userRole);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- CRITICAL SIMULATIONS ---
app.post('/api/simulations/road-blockage', (req, res) => {
  try {
    const { deliveryId, userRole } = req.body;
    const result = db.simulateRoadBlockage(deliveryId, userRole);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/simulations/resource-shortage', (req, res) => {
  try {
    const { userRole, ...data } = req.body;
    const result = db.simulateResourceShortage(data, userRole);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/simulations/shelter-overcrowd', (req, res) => {
  try {
    const { shelterId, userRole } = req.body;
    const result = db.simulateShelterOvercrowd(shelterId, userRole);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/deliveries/:id/step', (req, res) => {
  try {
    const updated = db.stepDeliveryMovement(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- AUDIT LOGS & ALERTS ---
app.get('/api/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

app.get('/api/alerts', (req, res) => {
  res.json(db.getAlerts());
});

app.post('/api/alerts/:id/read', (req, res) => {
  const alert = db.markAlertRead(req.params.id);
  res.json(alert);
});

// --- RESET DEMO DATA ---
app.post('/api/reset-data', (req, res) => {
  try {
    const data = db.reset();
    res.json({ message: 'System state successfully reset to initial demo data', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build if available or fallback
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>NERCP API Server</title></head>
        <body style="font-family:sans-serif; background:#0b0f19; color:#f3f4f6; padding:40px;">
          <h1>NERCP API Server is Running on port ${PORT}</h1>
          <p>Client build not found at <code>${clientDist}</code>.</p>
          <p>Please run <code>npm run dev:client</code> to start the Vite UI dev server.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` NERCP Emergency Coordination API Server`);
  console.log(` Scenario: Vijayawada Flood Emergency 2026`);
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` API Endpoint:      http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`=======================================================`);
});
