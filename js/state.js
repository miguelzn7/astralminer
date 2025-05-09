// js/state.js
export let player = {
    credits: 10000,
    inventory: {} // Key: resource name, Value: quantity (kg)
};

export const keyStates = {}; // Tracks pressed keys

// Arrays for object management
export const clickableObjects = [];
export const celestialBodiesWithLabels = [];
export const moonsWithPOIs = [];
export const poisWithLabels = [];

// View and Focus State
export let viewState = 'SYSTEM'; // 'SYSTEM', 'MOON_FOCUS', 'POI_FOCUS'
export let previousViewState = 'SYSTEM';
export let focusedObject = null; // Currently focused THREE.Object3D (moon or POI)
export let focusedMoon = null;   // Parent moon if POI is focused, or the moon itself if moon is focused

// Transition State
export let isTransitioning = false;
export let transitionStartTime = 0;
export let transitionProgress = 0;
export let transitionSourceState = null; // View state from which transition started
export let objectToResetScale = null; // POI that needs its scale reset after focusing away

// Economy Update
export let economyUpdateIntervalId = null;

// --- State Modifier Functions ---
export function setEconomyUpdateIntervalId(newId) { // <--- ADD THIS FUNCTION
    economyUpdateIntervalId = newId;
}

export function getEconomyUpdateIntervalId() { // <--- ADD THIS (Good practice for getting)
    return economyUpdateIntervalId;
}

// --- State Modifier Functions (Optional, but good practice for complex state) ---
// Example:
// export function setFocusedObject(obj) {
// focusedObject = obj;
// }
// For now, direct modification is used for simplicity as in the original code.