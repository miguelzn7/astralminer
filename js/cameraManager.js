// js/cameraManager.js
import * as THREE from 'three';
import * as CONST from './constants.js';
import * as STATE from './state.js';
// Import UI functions that need to be called during/after transitions
// This creates a circular dependency.
import { updateStatusPanel, updateLabelAndPOIVisibility, updateSelectedObjectPanel, updatePOIPanel, resetPoiScale } from './uiManager.js';

let cameraRef, controlsRef, clockRef, sceneRef, worldOriginRef;
let defaultCameraPositionRef, defaultControlsTargetRef;
let jupiterSystemRef; // Will be set from main.js after scene setup

const targetPosition = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const offsetVector = new THREE.Vector3();
const transitionTargetWorldPos = new THREE.Vector3();
let transitionStartDistance = 1;
let transitionEndDistance = 1;
const targetLookAt = new THREE.Vector3();


export function initCameraManager(_camera, _controls, _clock, _scene, _worldOrigin, _defaultCamPos, _defaultCtrlTarget, _jupiterSystem) {
    cameraRef = _camera;
    controlsRef = _controls;
    clockRef = _clock;
    sceneRef = _scene;
    worldOriginRef = _worldOrigin;
    defaultCameraPositionRef = _defaultCamPos;
    defaultControlsTargetRef = _defaultCtrlTarget;
    jupiterSystemRef = _jupiterSystem;
}


export function startTransitionToFocus(targetObj, parentMoonCtx, targetState, fromState = STATE.viewState, poiToReset = null) {
    if (!targetObj) {
        console.error("startTransition: Invalid targetObj");
        return;
    }
    console.log(`%cStart Focus: ${targetObj.userData.name} | ${fromState} -> ${targetState}`, "color:green");
    if (STATE.objectToResetScale && STATE.objectToResetScale !== poiToReset) {
        resetPoiScale(STATE.objectToResetScale);
    }
    STATE.objectToResetScale = poiToReset;
    STATE.previousViewState = STATE.viewState;
    STATE.transitionSourceState = fromState;
    STATE.viewState = targetState;
    STATE.focusedObject = targetObj;
    STATE.focusedMoon = (targetState === 'POI_FOCUS') ? parentMoonCtx : ((targetState === 'MOON_FOCUS') ? targetObj : null);
    STATE.isTransitioning = true;
    STATE.transitionStartTime = clockRef.elapsedTime;
    controlsRef.enabled = false;
    STATE.transitionProgress = 0;
    targetObj.getWorldPosition(transitionTargetWorldPos);

    if (targetState === 'POI_FOCUS') {
        const r = targetObj.userData.baseRadius || CONST.POI_BASE_RADIUS;
        offsetVector.set(0, r * 15, r * 25);
        transitionEndDistance = offsetVector.length();
        transitionStartDistance = Math.max(transitionEndDistance + 0.1, cameraRef.position.distanceTo(transitionTargetWorldPos));
    } else if (targetState === 'MOON_FOCUS') {
        const r = targetObj.userData.baseRadius || 1.0;
        offsetVector.set(0, r * 1.5, r * 4);
        transitionEndDistance = offsetVector.length();
        transitionStartDistance = Math.max(transitionEndDistance + 0.1, cameraRef.position.distanceTo(transitionTargetWorldPos));
    }
    updateStatusPanel();
    updateLabelAndPOIVisibility(cameraRef);
}

export function startTransitionToView(targetState, fromState = STATE.viewState, poiToReset = null) {
    console.log(`%cStart View: ${fromState} -> ${targetState}`, "color:green");
    if (STATE.objectToResetScale && STATE.objectToResetScale !== poiToReset) {
        resetPoiScale(STATE.objectToResetScale);
    }
    STATE.objectToResetScale = poiToReset;
    if (targetState === 'SYSTEM') {
        STATE.previousViewState = STATE.viewState;
        STATE.transitionSourceState = fromState;
        STATE.viewState = 'SYSTEM';
        STATE.focusedObject = null;
        STATE.focusedMoon = null;
        STATE.isTransitioning = true;
        STATE.transitionStartTime = clockRef.elapsedTime;
        controlsRef.enabled = false;
        STATE.transitionProgress = 0;
    }
    updateStatusPanel();
    updateLabelAndPOIVisibility(cameraRef);
}

export function forceEndTransition(reason = "Timeout") {
    console.warn(`%cForce End Transition: ${reason} to ${STATE.viewState}`, "color:red");
    STATE.isTransitioning = false;
    let finalTarget = worldOriginRef.clone();
    let finalPos = defaultCameraPositionRef.clone();
    try {
        if (STATE.viewState === 'POI_FOCUS' && STATE.focusedObject) {
            STATE.focusedObject.getWorldPosition(finalTarget);
            const r = STATE.focusedObject.userData.baseRadius || CONST.POI_BASE_RADIUS;
            offsetVector.set(0, r * 15, r * 25);
            finalPos.copy(finalTarget).add(offsetVector);
            STATE.focusedObject.scale.setScalar(CONST.POI_FOCUSED_SCALE);
        } else if (STATE.viewState === 'MOON_FOCUS' && STATE.focusedObject) {
            STATE.focusedObject.getWorldPosition(finalTarget);
            const r = STATE.focusedObject.userData.baseRadius || 1.0;
            offsetVector.set(0, r * 1.5, r * 4);
            finalPos.copy(finalTarget).add(offsetVector);
        } else if (STATE.viewState === 'SYSTEM') {
            if (jupiterSystemRef) jupiterSystemRef.getWorldPosition(finalTarget);
            else finalTarget.copy(defaultControlsTargetRef);
            finalPos.copy(defaultCameraPositionRef);
            finalTarget.copy(defaultControlsTargetRef);
        } else {
            console.warn("Force end: Unknown viewState, defaulting to SYSTEM");
            STATE.viewState = 'SYSTEM';
            if (jupiterSystemRef) jupiterSystemRef.getWorldPosition(finalTarget);
            else finalTarget.copy(defaultControlsTargetRef);
            finalPos.copy(defaultCameraPositionRef);
            finalTarget.copy(defaultControlsTargetRef);
        }
        if (STATE.objectToResetScale) {
            resetPoiScale(STATE.objectToResetScale);
        }
        cameraRef.position.copy(finalPos);
        controlsRef.target.copy(finalTarget);
        controlsRef.enabled = true;
        controlsRef.update();
    } catch (e) {
        console.error("Error during forceEndTransition:", e);
        cameraRef.position.copy(defaultCameraPositionRef);
        controlsRef.target.copy(defaultControlsTargetRef);
        STATE.viewState = 'SYSTEM';
        STATE.isTransitioning = false;
        if (STATE.objectToResetScale) {
            resetPoiScale(STATE.objectToResetScale);
        }
        controlsRef.enabled = true;
        controlsRef.update();
    }
    updateStatusPanel();
    updateLabelAndPOIVisibility(cameraRef);
    console.log(`Forced end state set: ${STATE.viewState}, Controls enabled: ${controlsRef.enabled}`);
}


function handlePoiScaleTransition(deltaTime) {
    if (STATE.viewState === 'POI_FOCUS' && STATE.focusedObject && !STATE.objectToResetScale) {
        const currentDistance = cameraRef.position.distanceTo(transitionTargetWorldPos);
        STATE.transitionProgress = Math.max(0, Math.min(1, 1 - ((currentDistance - transitionEndDistance) / (transitionStartDistance - transitionEndDistance))));
        const scale = THREE.MathUtils.lerp(1.0, CONST.POI_FOCUSED_SCALE, STATE.transitionProgress);
        STATE.focusedObject.scale.setScalar(scale);
    } else if (STATE.objectToResetScale && (STATE.viewState === 'MOON_FOCUS' || STATE.viewState === 'SYSTEM') && STATE.transitionSourceState === 'POI_FOCUS') {
        STATE.transitionProgress += CONST.FOCUS_LERP_SPEED * (deltaTime * 60) * 0.9; // A bit slower than focus
        STATE.transitionProgress = Math.min(1, STATE.transitionProgress);
        const scaleUp = THREE.MathUtils.lerp(CONST.POI_FOCUSED_SCALE, 1.0, STATE.transitionProgress);
        STATE.objectToResetScale.scale.setScalar(scaleUp);
        if (STATE.transitionProgress >= 1.0) {
            resetPoiScale(STATE.objectToResetScale);
        }
    }
}

export function handleWASDMovement(deltaTime) {
    const moveSpeed = CONST.WASD_PAN_SPEED * (deltaTime * 60); // Ensure consistent speed regardless of framerate
    const forward = new THREE.Vector3();
    cameraRef.getWorldDirection(forward);
    forward.y = 0; // Keep movement horizontal
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(cameraRef.up, forward).normalize();
    const panOffset = new THREE.Vector3();

    if (STATE.keyStates['w']) panOffset.add(forward);
    if (STATE.keyStates['s']) panOffset.sub(forward);
    if (STATE.keyStates['a']) panOffset.sub(right);
    if (STATE.keyStates['d']) panOffset.add(right);

    panOffset.multiplyScalar(moveSpeed);

    if (panOffset.lengthSq() > 1e-6) { // Only move if there's input
        cameraRef.position.add(panOffset);
        controlsRef.target.add(panOffset);
    }
}


export function updateCameraAndControls(deltaTime) {
    updateLabelAndPOIVisibility(cameraRef);

    if (STATE.isTransitioning) {
        let finished = false;
        let targetPosOK = false;
        let cameraPosOK = false;
        let currentDesiredCamPos = new THREE.Vector3();
        targetLookAt.set(0, 0, 0);

        if (clockRef.elapsedTime - STATE.transitionStartTime > (CONST.TRANSITION_TIMEOUT_MS / 1000.0)) {
            forceEndTransition("Timeout");
            return;
        }
        if ((STATE.viewState === 'POI_FOCUS' || STATE.viewState === 'MOON_FOCUS') && (!STATE.focusedObject || !sceneRef.getObjectById(STATE.focusedObject.id))) {
            console.error("Focused object lost during transition!");
            forceEndTransition("Focused object lost");
            return;
        }

        try {
            if (STATE.viewState === 'POI_FOCUS') {
                STATE.focusedObject.getWorldPosition(targetLookAt);
                const r = STATE.focusedObject.userData.baseRadius || CONST.POI_BASE_RADIUS;
                offsetVector.set(0, r * 15, r * 25);
                currentDesiredCamPos.copy(targetLookAt).add(offsetVector);
            } else if (STATE.viewState === 'MOON_FOCUS') {
                STATE.focusedObject.getWorldPosition(targetLookAt);
                const r = STATE.focusedObject.userData.baseRadius || 1.0;
                offsetVector.set(0, r * 1.5, r * 4);
                currentDesiredCamPos.copy(targetLookAt).add(offsetVector);
            } else if (STATE.viewState === 'SYSTEM') {
                if (jupiterSystemRef) jupiterSystemRef.getWorldPosition(targetLookAt);
                else targetLookAt.copy(defaultControlsTargetRef);
                currentDesiredCamPos.copy(defaultCameraPositionRef);
                targetLookAt.copy(defaultControlsTargetRef); // Ensure target for system view is jupiter system origin
            }

            const lerpFactor = Math.min(1, CONST.FOCUS_LERP_SPEED * (deltaTime * 60)); // deltaTime compensation
            cameraRef.position.lerp(currentDesiredCamPos, lerpFactor);
            controlsRef.target.lerp(targetLookAt, lerpFactor);

            handlePoiScaleTransition(deltaTime);

            const distPos = cameraRef.position.distanceTo(currentDesiredCamPos);
            const distTarget = controlsRef.target.distanceTo(targetLookAt);
            const TARGET_SNAP_THRESH = 0.8;
            const POS_SNAP_THRESH_FAR = 1.2;
            const POS_SNAP_THRESH_NEAR = 0.6; // For POI focus, allow closer snap
            const posThresh = (STATE.viewState === 'POI_FOCUS') ? POS_SNAP_THRESH_NEAR * 2.0 : POS_SNAP_THRESH_FAR;


            cameraPosOK = distPos < posThresh;
            targetPosOK = distTarget < TARGET_SNAP_THRESH;
            finished = cameraPosOK && targetPosOK;

            if (finished) {
                console.log(`%cTransition Finished Naturally to ${STATE.viewState}`, "color: blue");
                cameraRef.position.copy(currentDesiredCamPos);
                controlsRef.target.copy(targetLookAt);
                STATE.isTransitioning = false;
                controlsRef.enabled = true;
                if (STATE.objectToResetScale) {
                    resetPoiScale(STATE.objectToResetScale);
                }
                if (STATE.viewState === 'POI_FOCUS' && STATE.focusedObject) {
                    STATE.focusedObject.scale.setScalar(CONST.POI_FOCUSED_SCALE);
                }
                controlsRef.update();
                updateStatusPanel();
                updateLabelAndPOIVisibility(cameraRef);
                console.log(`Natural end state set: ${STATE.viewState}, Controls enabled: ${controlsRef.enabled}`);
                
                if (STATE.viewState === 'MOON_FOCUS' && STATE.focusedObject) {
                    updateSelectedObjectPanel(STATE.focusedObject.userData);
                } else if (STATE.viewState === 'POI_FOCUS' && STATE.focusedObject) {
                    updatePOIPanel(STATE.focusedObject.userData);
                }
            }
        } catch (e) {
            console.error("Error during transition update:", e);
            forceEndTransition("Error in update loop");
            return;
        }
    } else { // Not transitioning
        if (STATE.viewState === 'SYSTEM') {
            handleWASDMovement(deltaTime);
            controlsRef.update();
        } else if (STATE.viewState === 'MOON_FOCUS' || STATE.viewState === 'POI_FOCUS') {
            if (STATE.focusedObject) {
                STATE.focusedObject.getWorldPosition(targetPosition); // Keep target on focused object
                controlsRef.target.copy(targetPosition);
                controlsRef.update();
            } else {
                console.warn("In focused view but focusedObject is null!");
                startTransitionToView('SYSTEM'); // Go back to system view
            }
        } else {
            controlsRef.update(); // Default update
        }
    }
}