// js/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import * as CONST from './constants.js';
import * as STATE from './state.js'; // Not strictly needed here if other modules use it directly
import { initScene } from './sceneSetup.js';
import { marketData, craftingRecipes, startEconomyUpdates, updateEconomy } from './economyManager.js';
import { initUIManager, updateStatusPanel, updateLabelAndPOIVisibility } from './uiManager.js';
import { initCameraManager, updateCameraAndControls } from './cameraManager.js';
import { initEventManager } from './eventManager.js';

// --- Core Three.js Variables ---
let scene, camera, renderer, controls, clock, textureLoader;
let css2dRenderer;

// --- Scene Object References (populated by initScene) ---
let sun, jupiterSystem, jupiter;
let io, europa, ganymede, callisto;
let metis, adrastea, amalthea, thebe;

const worldOrigin = new THREE.Vector3(0, 0, 0);
let defaultCameraPosition = new THREE.Vector3();
let defaultControlsTarget = new THREE.Vector3();

// UI Elements caching is now handled in uiManager.js

function init() {
    clock = new THREE.Clock();
    textureLoader = new THREE.TextureLoader();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);

    const sceneContainer = document.getElementById('scene-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    sceneContainer.appendChild(renderer.domElement);

    const css2dContainer = document.getElementById('css2d-container');
    css2dRenderer = new CSS2DRenderer();
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
    css2dContainer.appendChild(css2dRenderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true; controls.minDistance = 0.1; controls.maxDistance = 1500;

    // Initialize Scene Objects
    const bodies = initScene(scene, textureLoader, worldOrigin);
    sun = bodies.sun; jupiterSystem = bodies.jupiterSystem; jupiter = bodies.jupiter;
    io = bodies.io; europa = bodies.europa; ganymede = bodies.ganymede; callisto = bodies.callisto;
    metis = bodies.metis; adrastea = bodies.adrastea; amalthea = bodies.amalthea; thebe = bodies.thebe;
    
    // Initialize Managers
    initUIManager(); // Caches its own DOM elements
    initCameraManager(camera, controls, clock, scene, worldOrigin, defaultCameraPosition, defaultControlsTarget, jupiterSystem);
    initEventManager(scene, camera); // Passes scene and camera for raycasting etc.

    // Initial Camera & UI
    jupiterSystem.getWorldPosition(defaultControlsTarget);
    defaultCameraPosition.copy(defaultControlsTarget).add(new THREE.Vector3(0, CONST.JUPITER_RADIUS * 4, CONST.JUPITER_RADIUS * 8));
    camera.position.copy(defaultCameraPosition);
    controls.target.copy(defaultControlsTarget);
    controls.update();

    updateStatusPanel(); // Initial UI update
    updateLabelAndPOIVisibility(camera); // Initial label visibility

    // Listeners
    window.addEventListener('resize', onWindowResize); // Keep resize here as it affects renderer/camera directly

    // Start Economy
    startEconomyUpdates();
    updateEconomy(); // Initial run to set prices

    console.log("Init v12.2 (Market Dynamics) complete from main.js.");
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    css2dRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    try {
        updateCameraAndControls(delta); // Handles transitions, WASD, label visibility
    } catch (e) {
        console.error("Anim loop err in updateCameraAndControls:", e);
        // Attempt to recover or log, e.g., force end transition might be called inside
        if (STATE.isTransitioning) { // Basic recovery attempt
             // forceEndTransition might be better called from within cameraManager if it detects an error
             console.warn("Forcing transition end due to animation loop error.");
             // This would need forceEndTransition to be exported from cameraManager and callable here
             // For now, rely on internal error handling or timeouts in cameraManager
        }
        controls.enabled = true; // Ensure controls are re-enabled if stuck
    }

    renderer.render(scene, camera);
    css2dRenderer.render(scene, camera);
}

// --- Start ---
init();
animate();