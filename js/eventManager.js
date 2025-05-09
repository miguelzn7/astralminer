// js/eventManager.js
import * as THREE from 'three';
import * as CONST from './constants.js';
import * as STATE from './state.js';
import { startTransitionToFocus, startTransitionToView } from './cameraManager.js';
import { hideAllInfoPanels, updateSelectedObjectPanel, updatePOIPanel, hideCraftingMenu, hideTradingMenu, resetPoiScale } from './uiManager.js';

let sceneRef, cameraRef;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onKeyDown(event) {
    const key = event.key.toLowerCase();
    STATE.keyStates[key] = true;
    if (key === 'escape') handleEscapeKey();
    if (['w', 'a', 's', 'd'].includes(key) && document.activeElement === document.body) {
        event.preventDefault(); // Prevent page scroll
    }
}

function onKeyUp(event) {
    STATE.keyStates[event.key.toLowerCase()] = false;
}

function onMouseDoubleClick(event) {
    if (STATE.isTransitioning || event.target.closest('.ui-panel')) {
        if(STATE.isTransitioning) console.log("%cIgnoring dblclick: Transitioning", "color:orange");
        else console.log("%cIgnoring dblclick: UI Panel clicked", "color:orange");
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    sceneRef.updateMatrixWorld(true); // Ensure world matrices are up-to-date
    raycaster.setFromCamera(mouse, cameraRef);
    const intersects = raycaster.intersectObjects(STATE.clickableObjects, true);

    if (intersects.length > 0) {
        let clickedRegisteredObject = null;
        for (const intersect of intersects) {
            let obj = intersect.object;
            for (let i = 0; i < 5 && obj; i++) { // Check up to 5 parents
                if (STATE.clickableObjects.includes(obj)) {
                    clickedRegisteredObject = obj;
                    break;
                }
                obj = obj.parent;
            }
            if (clickedRegisteredObject) break;
        }

        if (!clickedRegisteredObject || !clickedRegisteredObject.userData) {
            console.warn("DblClick miss on registered object or no userData:", intersects[0]?.object?.name);
            return;
        }
        
        console.log(`%cDblClick Proc: ${clickedRegisteredObject.userData.name} | ${clickedRegisteredObject.userData.type}`, "color:lightblue");
        const userData = clickedRegisteredObject.userData;
        hideAllInfoPanels();

        if (userData.type === "POI") {
            if (!userData.parentMoon) { console.error("POI no parentMoon!"); return; }
            startTransitionToFocus(clickedRegisteredObject, userData.parentMoon, 'POI_FOCUS');
            // Panel update will happen after transition finishes (in cameraManager)
        } else if (userData.type === "Moon") {
            if (STATE.objectToResetScale && STATE.objectToResetScale.userData.parentMoon === clickedRegisteredObject) {
                resetPoiScale(STATE.objectToResetScale); // Reset if focusing on its parent
            }
            startTransitionToFocus(clickedRegisteredObject, null, 'MOON_FOCUS');
        } else if (userData.type === "Planet") {
            if (STATE.objectToResetScale) {
                resetPoiScale(STATE.objectToResetScale);
            }
            if (STATE.viewState !== 'SYSTEM') {
                startTransitionToView('SYSTEM');
            }
            updateSelectedObjectPanel(userData); // Planets are simple, update panel immediately
        } else {
            console.warn("DblClick unhandled type:", userData.type);
        }
    } else {
        console.log("DblClick empty space.");
        if (STATE.objectToResetScale) {
            resetPoiScale(STATE.objectToResetScale);
        }
        if (STATE.viewState === 'SYSTEM') hideAllInfoPanels();
    }
}

function handleEscapeKey() {
    const craftingMenuPanel = document.getElementById('crafting-menu-panel'); // Direct access for simplicity
    const tradingMenuPanel = document.getElementById('trading-menu-panel');

    if (STATE.isTransitioning) {
        console.log("%cIgnoring Esc: Transitioning", "color:orange");
        return;
    }

    if (craftingMenuPanel.style.display !== 'none') {
        hideCraftingMenu();
        return;
    }
    if (tradingMenuPanel.style.display !== 'none') {
        hideTradingMenu();
        if (STATE.viewState === 'MOON_FOCUS' && STATE.focusedObject?.userData?.hasMarket) {
            updateSelectedObjectPanel(STATE.focusedObject.userData);
        } else if (STATE.viewState === 'POI_FOCUS' && STATE.focusedObject?.userData?.parentMoon?.userData?.hasMarket) {
            updatePOIPanel(STATE.focusedObject.userData);
        }
        return;
    }

    console.log(`%cEsc. Current View: ${STATE.viewState}`, "color:yellow");
    const sourceState = STATE.viewState;
    let poiToReset = (sourceState === 'POI_FOCUS' && STATE.focusedObject?.userData?.type === 'POI') ? STATE.focusedObject : null;
    
    hideAllInfoPanels();

    if (sourceState === 'POI_FOCUS' && STATE.focusedObject?.userData?.parentMoon) {
        startTransitionToFocus(STATE.focusedObject.userData.parentMoon, null, 'MOON_FOCUS', sourceState, poiToReset);
        // Panel will be updated by cameraManager after transition
    } else if (sourceState === 'MOON_FOCUS') {
        startTransitionToView('SYSTEM', sourceState, poiToReset);
    } else if (poiToReset) { // Esc in SYSTEM view but a POI was scaled
        resetPoiScale(poiToReset);
    }
}


export function initEventManager(_scene, _camera) {
    sceneRef = _scene;
    cameraRef = _camera;

    window.addEventListener('dblclick', onMouseDoubleClick);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

// onWindowResize needs access to camera, renderer, css2dRenderer from main.js
// It's simpler to keep it in main.js or pass those refs here.
// For now, assume onWindowResize will be defined in main.js and called from there.