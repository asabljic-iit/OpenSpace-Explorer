{
  "addons": {
    "recommended": [
      "addons/asteroids",
      "addons/dwarf_planets",
      "addons/interstellar_objects",
      "addons/minor_moons",
      "addons/desi"
    ]
  },
  "assets": [
    "${USER_ASSETS}/WWT/actions/default_actions_WWT",
    "${USER_ASSETS}/WWT/base_blank_light_WWT",
    "${USER_ASSETS}/WWT/base_light_WWT",
    "${USER_ASSETS}/WWT/default_keybindings_light_WWT"
  ],
  "camera": {
    "altitude": 17000000.0,
    "anchor": "Earth",
    "latitude": 58.5877,
    "longitude": 16.1924,
    "type": "goToGeo"
  },
  "delta_times": [
    1.0,
    5.0,
    30.0,
    60.0,
    300.0,
    1800.0,
    3600.0,
    43200.0,
    86400.0,
    604800.0,
    1209600.0,
    2592000.0,
    5184000.0,
    7776000.0,
    15552000.0,
    31536000.0,
    63072000.0,
    157680000.0,
    315360000.0,
    630720000.0
  ],
  "mark_nodes": [
    "Earth",
    "Mars",
    "Moon",
    "Sun",
    "Venus",
    "ISS"
  ],
  "meta": {
    "author": "OpenSpace Team",
    "description": "Default OpenSpace Profile. Adds Earth satellites not contained in other profiles.",
    "license": "MIT License",
    "name": "Default",
    "url": "https://www.openspaceproject.com",
    "version": "1.0"
  },
  "properties": [
    {
      "name": "{earth_satellites~space_stations}.Renderable.Enabled",
      "type": "setPropertyValue",
      "value": "false"
    },
    {
      "name": "Scene.Earth.Renderable.Layers.Overlays.noaa-sos-overlays-latlon_grid-white.Enabled",
      "type": "setPropertyValueSingle",
      "value": "false"
    },
    {
      "name": "NavigationHandler.OrbitalNavigator.IdleMotion.ShouldTriggerWhenIdle",
      "type": "setPropertyValueSingle",
      "value": "true"
    },
    {
      "name": "NavigationHandler.OrbitalNavigator.IdleMotion.IdleWaitTime",
      "type": "setPropertyValueSingle",
      "value": "15.000000"
    },
    {
      "name": "NavigationHandler.PathNavigator.SpeedScale",
      "type": "setPropertyValueSingle",
      "value": "1.000000"
    },
    {
      "name": "NavigationHandler.PathNavigator.DefaultPathType",
      "type": "setPropertyValueSingle",
      "value": "1.000000"
    },
    {
      "name": "RenderEngine.FramerateLimit",
      "type": "setPropertyValueSingle",
      "value": "30.000000"
    },
    {
      "name": "Scene.Vostok.BoundingSphere",
      "type": "setPropertyValueSingle",
      "value": "250.000000"
    }
  ],
  "time": {
    "is_paused": true,
    "type": "absolute",
    "value": "2026-08-02T21:19:42"
  },
  "version": {
    "major": 1,
    "minor": 5
  }
}