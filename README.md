# National Emergency Resource & Relief Coordination Platform (NERCP)
> **Simulated Disaster Scenario:** Vijayawada Flood Emergency – 2026  
> **Crisis Status:** Level-3 State Emergency | Prakasam Barrage Discharge: +2.8m above Danger Mark (4.8 Lakh Cusecs)

---

## 📌 Executive Summary
The **National Emergency Resource & Relief Coordination Platform (NERCP)** is an end-to-end, explainable, real-time command-and-control system built for disaster relief operations. Designed for the 2026 Vijayawada Krishna River flood catastrophe, NERCP coordinates across three multi-tiered relief organizations, three inundated urban flood sectors, multi-depot inventory stockpiles, dedicated medical and rescue response squads, heavy and amphibious vehicle fleets, and emergency evacuation shelters.

Unlike static dashboards or disconnected forms, NERCP operates as a **closed-loop reactive coordination system**:
$$\text{Incident} \longrightarrow \text{Distress Request} \longrightarrow \text{Automated Triage} \longrightarrow \text{Multi-Depot Allocation} \longrightarrow \text{Squad \& Fleet Dispatch} \longrightarrow \text{Live Telemetry} \longrightarrow \text{Dynamic Rerouting} \longrightarrow \text{Audit Trail}$$

---

## 🌟 Key Capabilities & Architectural Highlights

### 1. Explainable Priority Classification Engine
- **Deterministic Triage Rules:**
  - $\text{Affected Population} > 500 \land \text{Medical / Life-Safety Urgency} \Longrightarrow \mathbf{Critical}$ (Immediate intervention)
  - $\text{Rescue Need (Boats/Trapped)} \lor \text{Affected Population} > 500 \Longrightarrow \mathbf{Critical}$
  - $\text{Affected Population} > 200 \Longrightarrow \mathbf{High}$ (Dispatch within 2 hours)
  - $50 \le \text{Affected Population} \le 200 \Longrightarrow \mathbf{Medium}$ (Standard relief dispatch)
  - $\text{Affected Population} < 50 \Longrightarrow \mathbf{Low}$ (Routine restocking)
- **Transparent Reasoning:** Every request displays human-readable justifications explaining *why* a priority level was assigned.

### 2. Multi-Depot Resource Allocation Engine & Evidence Panel
- When a distress request is selected, the engine evaluates:
  1. Exact resource type and category compatibility
  2. Multi-organization stock consolidation (e.g. 500 packets needed: Org A provides 300, Org B provides 200)
  3. Haversine geospatial proximity from depot to ground location
  4. Specialized squad availability and skill certification
  5. Fleet transport type and payload weight capacity constraints
- **Transparent Evidence Panel:** Provides verifiable evidence points:
  - $\checkmark$ Exact resource type match verified
  - $\checkmark$ Multi-warehouse stock availability verified
  - $\checkmark$ Proximity optimization confirmed
  - $\checkmark$ Specialized crew availability and skills matched
  - $\checkmark$ Vehicle payload and transit corridor verified

### 3. Critical Live Scenario 1: Road Blockage & Autonomous Rerouting
- **Dynamic Adaptation:** When the primary transit artery (Prakasam Barrage North Access) is flooded ($+3.2\text{m}$ surge), the system:
  1. Detects obstruction from field telemetry
  2. Marks the active route as **Blocked**
  3. Autonomously computes an elevated bypass corridor (**Kanaka Durga Flyover & Inner Ring Road**)
  4. Dynamically updates the delivery ETA (e.g., $+10$ minutes)
  5. Updates vehicle transit status to **Rerouted**
  6. Raises a Level-1 Critical Alert and records an immutable audit log:  
     *“Assignment changed because the original route became unavailable.”*

### 4. Critical Live Scenario 2: Resource Shortage Deficit Mitigation
- When requested supplies exceed in-city stockpiles (e.g., 800 Food Packets required vs. 500 available):
  1. Computes exact deficit ($300\text{ units}$)
  2. Recommends a 3-tier inter-agency mitigation plan:
     - Tier 1: Consolidate in-city stock from NDRF and Seva Dal
     - Tier 2: Inter-district transfer from Guntur Regional Logistics Reserve ($28\text{ km}$ away via NH16 bypass)
     - Tier 3: Escalate emergency requisition to the State Disaster Management Authority (SDMA)

### 5. Shelter Overcrowding & Evacuee Redirection
- When Shelter S-02 (Govt High School Bhavanipuram) reaches $100\%$ capacity ($350/350$ beds):
  - System automatically detects saturation
  - Formulates an evacuee redirection plan to the nearest facility with surplus capacity (Shelter S-03 Siddhartha College, $390$ available beds, $3.1\text{ km}$ away)
  - Displays evidence justifying the target shelter choice

### 6. Role-Based Access Control (RBAC) & Role Switcher
- **Command Center Admin:** Full command authority, allocation approvals, override priority, audit inspection
- **Organization Manager:** Manage depot inventory stockpiles, restock quantities, view assigned squads
- **Field Officer:** Submit distress requests, update water gauge telemetry, report road blockages
- **Response Team:** View active dispatches, advance simulated transit progress, confirm relief delivery

### 7. Immutable Audit Trail
- Chronological, searchable, and exportable (JSON) record of every system event:
  - Timestamp, User/Role, Action, Entity, Previous State, New State, and Reason.

---

## 🧭 Step-by-Step Demo Flow (Judge Walkthrough)

Click the **Guided Demo (Steps 1-14)** button in the top navigation bar to step through the workflow:

| Step | Action | What to Observe |
|---|---|---|
| **Step 1** | Open Command Dashboard | Review National KPI cards, crisis alert banner, priority breakdown, and live activity ticker. |
| **Step 2** | Inspect Flood Incidents | View Bhavanipuram Zone A ($+2.8\text{m}$ water level, $1,200$ affected citizens). |
| **Step 3** | Open Emergency Requests | View requests queue with rule-based priority classifications (Critical, High, Medium, Low). |
| **Step 4** | Select Critical Medical Request | Click **REQ-101** ($50$ Emergency Medical Kits for $620$ stranded citizens). |
| **Step 5** | Inspect Candidate Resources | View matching medical squads, ALS ambulances, and depot stock in Gunadala & Governorpet. |
| **Step 6** | Run Allocation Engine | System computes multi-depot split, selects **Red Cross Paramedics** and **Ambulance AMB-01**. |
| **Step 7** | Inspect Evidence Panel | Review 5 verified evidence criteria explaining why this specific squad and vehicle were chosen. |
| **Step 8** | Confirm & Dispatch Delivery | Approves allocation: inventory is deducted, vehicle is marked **En Route**, delivery **OP-102** is created. |
| **Step 9** | View Live Tracking Map | Plotted route with waypoints from Governorpet across Prakasam Barrage toward Zone A. |
| **Step 10** | Click "Simulate Road Blockage" | Flash surge breaches Prakasam Barrage road ($+3.2\text{m}$ inundation). |
| **Step 11** | System Dynamically Adapts | Original route marked blocked $\rightarrow$ detour selected via Kanaka Durga Flyover $\rightarrow$ ETA updated to $24\text{ min}$. |
| **Step 12** | Inspect Reroute Evidence | Modal displays: *"Assignment changed because the original route became unavailable."* |
| **Step 13** | Review Audit Trail | Chronological event logs verify all transitions with actors, previous/new values, and reasons. |
| **Step 14** | Run Shortage Simulation | Demonstrates deficit analysis ($300\text{ unit shortfall}$) and multi-tier Guntur buffer requisition. |

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling & UI:** Tailwind CSS (Dark Command Center Theme) + Lucide React Icons
- **Interactive Mapping:** Leaflet + OpenStreetMap & CartoDB Dark Matter Tiles (with fallback vectors)
- **Backend:** Node.js + Express REST API
- **Data Persistence:** File-backed transactional JSON engine (`server/state.json`) with instant reset capability (`server/initialData.json`)
- **Orchestration:** `concurrently` for seamless single-command development

---

## 🚀 Quickstart & Local Setup Instructions

### Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher

### Option A: Run Full Application (Production Mode)
```powershell
# 1. Install root and client dependencies
npm install
npm run install:client

# 2. Build frontend bundle
npm run build

# 3. Start unified API server + static frontend (Port 5000)
npm start
```
Now open **`http://localhost:5000`** in your browser.

---

### Option B: Run in Development Mode (Hot Reloading)
```powershell
# Starts Express backend on port 5000 and Vite dev server on port 5173
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔄 Resetting Demo State
At any point during judging or testing, click the **Reset Demo** icon (circular counter-clockwise arrow) in the top-right header, or trigger:
```bash
curl -X POST http://localhost:5000/api/reset-data
```
This restores all initial incidents, requests, inventories, and fleet statuses to their baseline state.

---

## 📂 Project Structure
```
climet/
├── package.json               # Root scripts (start, dev, build)
├── README.md                  # Comprehensive platform documentation
├── server/
│   ├── index.js               # Express API server & static client handler
│   ├── db.js                  # Business logic, allocation engine & simulations
│   ├── initialData.json       # Seed data for Vijayawada Flood Emergency 2026
│   └── state.json             # Persistent runtime database
└── client/
    ├── index.html             # HTML entry with Leaflet & Inter fonts
    ├── vite.config.ts         # Vite configuration with /api proxy
    ├── tailwind.config.js     # Tailwind dark command-center theme
    ├── src/
    │   ├── main.tsx           # React root
    │   ├── App.tsx            # Main layout, view router & modal mount
    │   ├── types.ts           # Complete TypeScript domain definitions
    │   ├── context/
    │   │   └── EmergencyContext.tsx # Global state, alerts, RBAC & tour
    │   ├── services/
    │   │   └── api.ts         # REST API client
    │   ├── components/
    │   │   ├── Header.tsx     # Top bar, active disaster telemetry, role selector
    │   │   ├── Sidebar.tsx    # Module navigation & RBAC capabilities
    │   │   ├── GuidedTour.tsx # 14-Step interactive judge walkthrough companion
    │   │   ├── RoadBlockageModal.tsx # Dynamic rerouting explanation
    │   │   ├── ShortageModal.tsx    # Supply deficit analysis modal
    │   │   ├── ShelterModal.tsx     # Shelter overflow redirect modal
    │   │   └── ExplanationModal.tsx # Generic explainable AI evidence viewer
    │   └── views/
    │       ├── DashboardView.tsx       # KPI cards, charts, active dispatches
    │       ├── IncidentsView.tsx       # Flood zones, water levels, incident reports
    │       ├── RequestsView.tsx        # Distress requests & explainable triage
    │       ├── InventoryView.tsx       # Multi-org stockpile meters & restock
    │       ├── AllocationEngineView.tsx # Core recommendation & dispatch engine
    │       ├── TeamsVehiclesView.tsx   # Tactical squads & fleet payload specs
    │       ├── SheltersView.tsx        # Camp capacities & overflow load balancing
    │       ├── TrackingView.tsx        # Leaflet GPS map, checkpoints & rerouting
    │       └── AuditTrailView.tsx      # Immutable system log & JSON export
```

---

## 🏆 Hackathon Quality Checklist Verified
- [x] Role-Based Access Control (Command Center Admin, Org Manager, Field Officer, Response Team)
- [x] Incident creation & water level gauge telemetry
- [x] Distress request creation with automated explainable priority classification
- [x] Multi-agency resource inventory with dynamic deduction
- [x] Explainable Resource Allocation Engine with 5-point evidence validation
- [x] Specialized team and fleet vehicle payload capacity matching
- [x] Delivery operation lifecycle management
- [x] Live GPS tracking with interactive map and simulated movement
- [x] Critical Road Blockage scenario with autonomous bypass recalculation
- [x] Clear explanation: *"Assignment changed because the original route became unavailable."*
- [x] Resource Shortage simulation with 3-tier inter-agency mitigation
- [x] Shelter saturation detection with automatic evacuee redirection
- [x] Complete immutable audit trail with previous/new state diffs and reasons
- [x] Zero paid external API dependencies; 100% runnable locally with simple commands
