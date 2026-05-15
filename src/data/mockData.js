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

export const INCIDENTS = [
  {
    id: "inc-001",
    type: "MOVEMENT",
    title: "Unidentified vehicle cluster",
    location: [13.82, 52.38],
    corridor: "corridor-alpha",
    severity: "HIGH",
    timestamp: "2026-05-15T06:14:00Z",
    source: "SIGINT",
    description: "Three vehicles moving in formation, diverging from expected route at waypoint 7.",
    analyst: "J. Reyes",
    linked: ["rpt-004", "asset-002"],
  },
  {
    id: "inc-002",
    type: "REPORT",
    title: "Checkpoint activity spike",
    location: [14.21, 51.72],
    corridor: "corridor-bravo",
    severity: "MEDIUM",
    timestamp: "2026-05-15T04:47:00Z",
    source: "HUMINT",
    description: "Checkpoint 3B reported a 40% increase in throughput between 03:00–05:00 local.",
    analyst: "M. Okafor",
    linked: ["inc-005"],
  },
  {
    id: "inc-003",
    type: "ANOMALY",
    title: "Signal blackout — sector 9",
    location: [14.58, 52.29],
    corridor: "corridor-charlie",
    severity: "CRITICAL",
    timestamp: "2026-05-15T03:02:00Z",
    source: "ELINT",
    description: "Complete RF silence in sector 9 for 18 minutes. Possible jamming or equipment failure.",
    analyst: "A. Vasquez",
    linked: ["inc-006", "rpt-007"],
  },
  {
    id: "inc-004",
    type: "MOVEMENT",
    title: "Vessel loitering — waypoint 12",
    location: [13.55, 52.75],
    corridor: "corridor-charlie",
    severity: "LOW",
    timestamp: "2026-05-15T02:31:00Z",
    source: "AIS",
    description: "Cargo vessel MV Strela has been stationary at WP-12 for 94 minutes, outside normal patterns.",
    analyst: "J. Reyes",
    linked: [],
  },
  {
    id: "inc-005",
    type: "REPORT",
    title: "New access road detected",
    location: [13.42, 52.04],
    corridor: "corridor-bravo",
    severity: "MEDIUM",
    timestamp: "2026-05-14T22:15:00Z",
    source: "SAR",
    description: "Satellite pass at 21:42Z revealed unpaved road construct not present in prior imagery.",
    analyst: "M. Okafor",
    linked: ["inc-002"],
  },
  {
    id: "inc-006",
    type: "ANOMALY",
    title: "Border fence cut — grid 44N",
    location: [14.87, 51.83],
    corridor: "corridor-alpha",
    severity: "HIGH",
    timestamp: "2026-05-14T20:58:00Z",
    source: "Sensor",
    description: "Physical intrusion sensor triggered at grid 44N. Patrol dispatched, no visual confirmation yet.",
    analyst: "A. Vasquez",
    linked: ["inc-003"],
  },
];

export const ASSETS = [
  { id: "asset-001", name: "UAV-7 Falcon", type: "AIR", location: [13.95, 52.45], status: "ACTIVE" },
  { id: "asset-002", name: "Ground Team Echo", type: "GROUND", location: [13.78, 52.36], status: "ACTIVE" },
  { id: "asset-003", name: "Sensor Array 14B", type: "STATIC", location: [14.32, 51.95], status: "DEGRADED" },
  { id: "asset-004", name: "UAV-3 Osprey", type: "AIR", location: [14.62, 52.22], status: "ACTIVE" },
];

export const SEVERITY_META = {
  CRITICAL: { color: "#EF4444", label: "CRITICAL" },
  HIGH:     { color: "#F97316", label: "HIGH" },
  MEDIUM:   { color: "#F59E0B", label: "MEDIUM" },
  LOW:      { color: "#6B7280", label: "LOW" },
};

export const TYPE_META = {
  MOVEMENT: { icon: "↗", color: "#4A9EFF" },
  REPORT:   { icon: "◎", color: "#A78BFA" },
  ANOMALY:  { icon: "⚠", color: "#F97316" },
};
