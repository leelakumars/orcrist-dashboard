export const CORRIDORS = [
  {
    id: "corridor-alpha",
    name: "Corridor Alpha",
    color: "#4A9EFF",
    coordinates: [
      [13.2, 52.6], [13.8, 52.4], [14.3, 52.1], [14.9, 51.8],
    ],
  },
  {
    id: "corridor-bravo",
    name: "Corridor Bravo",
    color: "#F59E0B",
    coordinates: [
      [12.8, 52.2], [13.4, 52.0], [13.9, 51.7], [14.5, 51.4],
    ],
  },
  {
    id: "corridor-charlie",
    name: "Corridor Charlie",
    color: "#10B981",
    coordinates: [
      [13.5, 52.8], [14.0, 52.6], [14.6, 52.3], [15.2, 52.0],
    ],
  },
];

// Geofence zones drawn on the map
export const GEOFENCES = [
  {
    id: "gf-001",
    label: "Exclusion Zone A",
    type: "EXCLUSION",
    color: "#EF4444",
    coordinates: [
      [14.0, 52.55], [14.3, 52.55], [14.3, 52.35], [14.0, 52.35], [14.0, 52.55],
    ],
  },
  {
    id: "gf-002",
    label: "Safe Corridor Buffer",
    type: "SAFE",
    color: "#10B981",
    coordinates: [
      [13.1, 52.0], [13.5, 52.0], [13.5, 51.75], [13.1, 51.75], [13.1, 52.0],
    ],
  },
  {
    id: "gf-003",
    label: "Restricted Airspace",
    type: "RESTRICTED",
    color: "#F59E0B",
    coordinates: [
      [13.6, 52.7], [14.0, 52.7], [14.0, 52.5], [13.6, 52.5], [13.6, 52.7],
    ],
  },
];

// Paths for animated assets — arrays of [lng, lat] waypoints along corridors
export const ASSET_PATHS = {
  "asset-001": { // UAV-7 Falcon — flies Alpha corridor
    path: [[13.2,52.6],[13.5,52.48],[13.8,52.4],[14.1,52.25],[14.3,52.1],[14.6,51.95],[14.9,51.8]],
    speed: 0.0004,
  },
  "asset-004": { // UAV-3 Osprey — flies Charlie corridor
    path: [[13.5,52.8],[13.75,52.68],[14.0,52.6],[14.3,52.45],[14.6,52.3],[14.9,52.15],[15.2,52.0]],
    speed: 0.0003,
  },
};

export const INCIDENTS = [
  { id:"inc-001", type:"MOVEMENT", title:"Unidentified vehicle cluster",       location:[13.82,52.38], corridor:"corridor-alpha",  severity:"HIGH",     timestamp:"2026-05-15T06:14:00Z", source:"SIGINT",  description:"Three vehicles moving in formation, diverging from expected route at waypoint 7.", analyst:"J. Reyes",   linked:["rpt-004","asset-002"] },
  { id:"inc-002", type:"REPORT",   title:"Checkpoint activity spike",          location:[14.21,51.72], corridor:"corridor-bravo",  severity:"MEDIUM",   timestamp:"2026-05-15T04:47:00Z", source:"HUMINT",  description:"Checkpoint 3B reported a 40% increase in throughput between 03:00–05:00 local.", analyst:"M. Okafor",  linked:["inc-005"] },
  { id:"inc-003", type:"ANOMALY",  title:"Signal blackout — sector 9",         location:[14.58,52.29], corridor:"corridor-charlie",severity:"CRITICAL",  timestamp:"2026-05-15T03:02:00Z", source:"ELINT",   description:"Complete RF silence in sector 9 for 18 minutes. Possible jamming or equipment failure.", analyst:"A. Vasquez", linked:["inc-006","rpt-007"] },
  { id:"inc-004", type:"MOVEMENT", title:"Vessel loitering — waypoint 12",     location:[13.55,52.75], corridor:"corridor-charlie",severity:"LOW",      timestamp:"2026-05-15T02:31:00Z", source:"AIS",     description:"Cargo vessel MV Strela stationary at WP-12 for 94 minutes.", analyst:"J. Reyes",   linked:[] },
  { id:"inc-005", type:"REPORT",   title:"New access road detected",           location:[13.42,52.04], corridor:"corridor-bravo",  severity:"MEDIUM",   timestamp:"2026-05-14T22:15:00Z", source:"SAR",     description:"Satellite pass revealed unpaved road not present in prior imagery.", analyst:"M. Okafor",  linked:["inc-002"] },
  { id:"inc-006", type:"ANOMALY",  title:"Border fence cut — grid 44N",        location:[14.87,51.83], corridor:"corridor-alpha",  severity:"HIGH",     timestamp:"2026-05-14T20:58:00Z", source:"Sensor",  description:"Physical intrusion sensor triggered at grid 44N. Patrol dispatched.", analyst:"A. Vasquez", linked:["inc-003"] },
  { id:"inc-007", type:"MOVEMENT", title:"Convoy route deviation",             location:[13.65,52.52], corridor:"corridor-alpha",  severity:"MEDIUM",   timestamp:"2026-05-15T07:02:00Z", source:"SIGINT",  description:"Three-vehicle convoy deviated from pre-approved route at junction 7B.", analyst:"J. Reyes",   linked:[] },
  { id:"inc-008", type:"ANOMALY",  title:"RF jamming detected — zone 3",       location:[14.12,52.40], corridor:"corridor-charlie",severity:"CRITICAL",  timestamp:"2026-05-15T05:44:00Z", source:"ELINT",   description:"Broadband RF jamming signature detected across zone 3 for 6 minutes.", analyst:"A. Vasquez", linked:["inc-003"] },
  { id:"inc-009", type:"REPORT",   title:"Perimeter breach — post 7",          location:[14.44,51.60], corridor:"corridor-bravo",  severity:"HIGH",     timestamp:"2026-05-15T01:30:00Z", source:"HUMINT",  description:"Post 7 reported unidentified personnel crossing eastern perimeter at 01:12Z.", analyst:"M. Okafor",  linked:[] },
  { id:"inc-010", type:"MOVEMENT", title:"Fast mover — bearing 045",           location:[13.90,52.61], corridor:"corridor-charlie",severity:"MEDIUM",   timestamp:"2026-05-15T00:18:00Z", source:"RADAR",   description:"Single fast-moving track detected heading northeast, speed ~110 knots.", analyst:"J. Reyes",   linked:[] },
  { id:"inc-011", type:"REPORT",   title:"Sensor Array 14B degraded",          location:[14.32,51.95], corridor:"corridor-bravo",  severity:"MEDIUM",   timestamp:"2026-05-14T23:55:00Z", source:"Sensor",  description:"Array 14B reporting intermittent connectivity. Coverage gap in sector 6.", analyst:"A. Vasquez", linked:[] },
  { id:"inc-012", type:"ANOMALY",  title:"Drone incursion — restricted zone",  location:[13.71,52.20], corridor:"corridor-alpha",  severity:"CRITICAL",  timestamp:"2026-05-14T21:40:00Z", source:"RADAR",   description:"Small UAS tracked entering restricted airspace at altitude 150m.", analyst:"J. Reyes",   linked:["inc-008"] },
  { id:"inc-013", type:"MOVEMENT", title:"Ground team contact lost",           location:[14.70,52.10], corridor:"corridor-charlie",severity:"HIGH",     timestamp:"2026-05-14T19:22:00Z", source:"SIGINT",  description:"Ground Team Delta lost comms 19:18Z. Last known position grid 47F.", analyst:"M. Okafor",  linked:[] },
  { id:"inc-014", type:"REPORT",   title:"Unusual vehicle density — A10",      location:[13.30,52.45], corridor:"corridor-alpha",  severity:"LOW",      timestamp:"2026-05-14T18:05:00Z", source:"AIS",     description:"Civilian vehicle density on A10 elevated 60% above baseline for time of day.", analyst:"J. Reyes",   linked:[] },
  { id:"inc-015", type:"ANOMALY",  title:"Power grid fluctuation",             location:[15.05,51.90], corridor:"corridor-alpha",  severity:"MEDIUM",   timestamp:"2026-05-14T17:30:00Z", source:"Sensor",  description:"Voltage fluctuation detected at Forst substation. Duration 4 minutes.", analyst:"A. Vasquez", linked:[] },
  { id:"inc-016", type:"MOVEMENT", title:"Waterway traffic anomaly",           location:[13.20,51.85], corridor:"corridor-bravo",  severity:"LOW",      timestamp:"2026-05-14T16:10:00Z", source:"AIS",     description:"Barge convoy paused mid-channel at waypoint 4. No distress signal.", analyst:"M. Okafor",  linked:[] },
  { id:"inc-017", type:"REPORT",   title:"Imagery update — objective 3",       location:[14.80,52.45], corridor:"corridor-charlie",severity:"LOW",      timestamp:"2026-05-14T14:00:00Z", source:"SAR",     description:"Updated satellite pass confirms no new construction at objective 3.", analyst:"J. Reyes",   linked:[] },
  { id:"inc-018", type:"ANOMALY",  title:"Unexplained thermal signature",      location:[13.60,51.70], corridor:"corridor-bravo",  severity:"MEDIUM",   timestamp:"2026-05-14T02:44:00Z", source:"ELINT",   description:"Thermal anomaly detected at bearing 220 from post 4. Duration 22 minutes.", analyst:"A. Vasquez", linked:[] },
];

export const ASSETS = [
  { id:"asset-001", name:"UAV-7 Falcon",      type:"AIR",    location:[13.95,52.45], status:"ACTIVE" },
  { id:"asset-002", name:"Ground Team Echo",  type:"GROUND", location:[13.78,52.36], status:"ACTIVE" },
  { id:"asset-003", name:"Sensor Array 14B",  type:"STATIC", location:[14.32,51.95], status:"DEGRADED" },
  { id:"asset-004", name:"UAV-3 Osprey",      type:"AIR",    location:[14.62,52.22], status:"ACTIVE" },
  { id:"asset-005", name:"Ground Team Delta", type:"GROUND", location:[14.70,52.10], status:"DEGRADED" },
  { id:"asset-006", name:"Sensor Array 7C",   type:"STATIC", location:[13.40,52.55], status:"ACTIVE" },
];

export const SEVERITY_META = {
  CRITICAL: { color:"#EF4444", label:"CRITICAL" },
  HIGH:     { color:"#F97316", label:"HIGH" },
  MEDIUM:   { color:"#F59E0B", label:"MEDIUM" },
  LOW:      { color:"#6B7280", label:"LOW" },
};

export const TYPE_META = {
  MOVEMENT: { icon:"↗", color:"#4A9EFF" },
  REPORT:   { icon:"◎", color:"#A78BFA" },
  ANOMALY:  { icon:"⚠", color:"#F97316" },
};

export const SEVERITY_WEIGHT = { CRITICAL: 1.0, HIGH: 0.75, MEDIUM: 0.45, LOW: 0.2 };

// Fake 7-day trend data for sparkline (day 0 = oldest, day 6 = today)
export const SEVERITY_TREND = {
  CRITICAL: [1, 2, 1, 3, 2, 3, 3],
  HIGH:     [3, 2, 4, 3, 5, 4, 4],
};

// Alert ticker messages — shown as scrolling strip
export const ALERT_TICKER = [
  { id:"t-001", severity:"CRITICAL", text:"Sector 9 went dark at 03:02Z. Still no comms. Vasquez is on it." },
  { id:"t-002", severity:"CRITICAL", text:"Something is jamming zone 3. Osprey rerouted around it." },
  { id:"t-003", severity:"HIGH",     text:"Fence cut at grid 44N. Patrol is 8 minutes out." },
  { id:"t-004", severity:"HIGH",     text:"Lost contact with Delta at 19:18Z. Last known grid 47F." },
  { id:"t-005", severity:"MEDIUM",   text:"Checkpoint 3B is moving 40% more traffic than usual. Worth watching." },
  { id:"t-006", severity:"MEDIUM",   text:"Array 14B dropping in and out. Sector 6 has a gap right now." },
  { id:"t-007", severity:"HIGH",     text:"Small drone in restricted airspace. Falcon tasked to intercept." },
];
