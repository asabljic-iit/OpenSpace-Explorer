// config.js

// Exact Action Identifiers to hide from guest users
const BLOCKED_ACTIONS = [
  'openspace.toggleShutdown',         // Prevent guests from shutting down OpenSpace
  'openspace.takeScreenshot',          // Hide screenshot triggers
  'os.ResetTime',
  'HideEarthWhenTelescope',
  'os.FadeDownTrails',
  'os.planetsmoons.FadeDownTrails',
  'os.FadeUpTrails',
  'os.planetsmoons.FadeUpTrails',
  'os.ToggleTrailsInstant',
  'os.planetsmoons.ToggleTrails',
  'os.solarsystem.JupiterMajorMoonsOff',
  'os.solarsystem.JupiterMajorMoonsOn',
  'os.solarsystem.NeptuneMajorMoonsOff',
  'os.solarsystem.NeptuneMajorMoonsOn',
  'os.solarsystem.SaturnMajorMoonsOff',
  'os.solarsystem.SaturnMajorMoonsOn',
  'os.solarsystem.UranusMajorMoonsOff',
  'os.solarsystem.UranusMajorMoonsOn',
  'os.solarsystem.FocusEarth',
  'os.solarsystem.FocusIss',
  'os.solarsystem.ToggleSatelliteTrails',
  'os.solarsystem.ToggleSpaceStationTrails',
  'os.solarsystem.ToggleSpaceStations',
  'os.earth.FocusMoon',
  'ClearSatellites',
  'os.earth.ToggleMoonShading'
];

// Entire Categories or Folder paths to hide from guest users
const BLOCKED_CATEGORIES = [
  'Night Sky',
  'System',
  'Time',
  'Trails'
];

// Timeout rules per folder (in milliseconds). 
// Set to 0 or null to disable auto-off (stays highlighted until another button is pressed).
const FOLDER_TIMEOUTS = {
  'constellations': 60000, // 60 seconds
  'satellites': 15000,
  'focuson': 15000,
  'solarsystem': null,
  'asteroids': 30000,
  'deepspaceobjects': null,
  'missions': null
};

// Default timeout (in ms) for folders not explicitly listed above
const DEFAULT_TOGGLE_TIMEOUT_MS = 15000;