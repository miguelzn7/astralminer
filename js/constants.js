// js/constants.js
import * as THREE from 'three';

// --- Physical Constants ---
export const BASE_PLANET_VISUAL_SCALE = 4.0;
export const REL_SUN_DIAMETER = 12.4;
export const JUPITER_RADIUS = BASE_PLANET_VISUAL_SCALE;
export const SUN_RADIUS = JUPITER_RADIUS * REL_SUN_DIAMETER;
export const MIN_MOON_RADIUS = 0.15;
export const JUPITER_ORBIT_RADIUS = 90;
export const SUN_POSITION = new THREE.Vector3(0, 0, 0);
export const POI_BASE_RADIUS = 0.01;
export const REAL_JUPITER_DIAMETER = 139820;
export const REAL_IO_DIAMETER = 3643;
export const REAL_GANYMEDE_DIAMETER = 5268;
export const REAL_EUROPA_DIAMETER = 3122;
export const REAL_CALLISTO_DIAMETER = 4821;
export const REAL_AMALTHEA_DIAMETER = 167;
export const REAL_THEBE_DIAMETER = 99;
export const REAL_ADRASTEA_DIAMETER = 16;
export const REAL_METIS_DIAMETER = 43;
export const IO_RADIUS = Math.max(MIN_MOON_RADIUS, JUPITER_RADIUS * (REAL_IO_DIAMETER / REAL_JUPITER_DIAMETER));
export const EUROPA_RADIUS = Math.max(MIN_MOON_RADIUS, JUPITER_RADIUS * (REAL_EUROPA_DIAMETER / REAL_JUPITER_DIAMETER));
export const GANYMEDE_RADIUS = Math.max(MIN_MOON_RADIUS, JUPITER_RADIUS * (REAL_GANYMEDE_DIAMETER / REAL_JUPITER_DIAMETER));
export const CALLISTO_RADIUS = Math.max(MIN_MOON_RADIUS, JUPITER_RADIUS * (REAL_CALLISTO_DIAMETER / REAL_JUPITER_DIAMETER));
export const AMALTHEA_RADIUS = MIN_MOON_RADIUS * 0.8;
export const THEBE_RADIUS = MIN_MOON_RADIUS * 0.8;
export const ADRASTEA_RADIUS = MIN_MOON_RADIUS * 0.7;
export const METIS_RADIUS = MIN_MOON_RADIUS * 0.7;
export const METIS_ORBIT_RADIUS = JUPITER_RADIUS + 1.5;
export const ADRASTEA_ORBIT_RADIUS = JUPITER_RADIUS + 1.8;
export const AMALTHEA_ORBIT_RADIUS = JUPITER_RADIUS + 2.5;
export const THEBE_ORBIT_RADIUS = JUPITER_RADIUS + 3.0;
export const IO_ORBIT_RADIUS = JUPITER_RADIUS + 3.8;
export const EUROPA_ORBIT_RADIUS = JUPITER_RADIUS + 5.0;
export const GANYMEDE_ORBIT_RADIUS = JUPITER_RADIUS + 7.5;
export const CALLISTO_ORBIT_RADIUS = JUPITER_RADIUS + 11.0;

// --- Texture URLs ---
export const SUN_TEXTURE_URL = 'textures/sun.jpg';
export const JUPITER_TEXTURE_URL = 'textures/jupiter.jpg';
export const IO_TEXTURE_URL = 'textures/io.jpg';
export const EUROPA_TEXTURE_URL = 'textures/europa.jpg';
export const GANYMEDE_TEXTURE_URL = 'textures/ganymede.jpg';
export const CALLISTO_TEXTURE_URL = 'textures/callisto.jpg';
export const METIS_TEXTURE_URL = 'textures/innermoons.jpg';     // Or null
export const ADRASTEA_TEXTURE_URL = 'textures/innermoons.jpg';  // Or null
export const AMALTHEA_TEXTURE_URL = 'textures/innermoons.jpg'; // Or null
export const THEBE_TEXTURE_URL = 'textures/innermoons.jpg';     // Or null


// --- Control & Transition Constants ---
export const WASD_PAN_SPEED = 0.3;
export const FOCUS_LERP_SPEED = 0.08;
export const TRANSITION_TIMEOUT_MS = 5000;
export const POI_FOCUSED_SCALE = 0.1;

// --- Economy Constants ---
export const ECONOMY_UPDATE_INTERVAL_MS = 5000; // Update every 5 seconds
export const PRICE_VOLATILITY_FACTOR = 0.8; // How much prices swing based on inventory (0 to 1+)
export const BASE_RATE_SCALE = 1; // Scale factor for production/consumption per update interval
export const MAX_INVENTORY_FACTOR = 200; // Production slows/stops when inventory is this many times the base rate
export const MAX_DEMAND_BUFFER_FACTOR = 150; // Consumption demand satisfied when buffer reaches this