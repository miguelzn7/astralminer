// js/sceneSetup.js
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as CONST from './constants.js';
import * as STATE from './state.js';
import { marketData } from './economyManager.js'; // For checking hasMarket

let textureLoaderRef; // To be set by initScene

// Atmosphere Texture (created once)
const atmosphereCanvas = document.createElement('canvas');
const atmosphereContext = atmosphereCanvas.getContext('2d');
atmosphereCanvas.width = 128;
atmosphereCanvas.height = 128;
const gradient = atmosphereContext.createRadialGradient(
    atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, 0,
    atmosphereCanvas.width / 2, atmosphereCanvas.height / 2, atmosphereCanvas.width / 2
);
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.3)');
gradient.addColorStop(1.0, 'rgba(150, 150, 255, 0.0)');
atmosphereContext.fillStyle = gradient;
atmosphereContext.fillRect(0, 0, atmosphereCanvas.width, atmosphereCanvas.height);
const atmosphereTexture = new THREE.CanvasTexture(atmosphereCanvas);

function createAtmosphere(bodyMesh, radius, color = 0x88aaff) {
    const material = new THREE.SpriteMaterial({
        map: atmosphereTexture,
        color: color,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    const scale = radius * 2.4;
    sprite.scale.set(scale, scale, 1);
    bodyMesh.add(sprite);
    return sprite;
}

function createNametag(bodyMesh, name, radius, isPOI = false) {
    const div = document.createElement('div');
    div.className = isPOI ? 'nametag poi-nametag' : 'nametag';
    div.textContent = name;
    const label = new CSS2DObject(div);
    label.position.set(0, radius * (isPOI ? 1.8 : 1.4), 0);
    bodyMesh.add(label);
    label.layers.set(0);
    return label;
}

function createCelestialBody(radius, position, textureUrl = null, parent, fallbackColor = 0xffffff, isEmissive = false, hasAtmosphere = false, hasNametag = false) {
    if (!parent) {
        console.error("createCelestialBody: parent is undefined.");
        parent = new THREE.Group(); // Fallback to avoid crash, but this is an issue.
    }
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    let material;
    if (isEmissive) {
        material = new THREE.MeshBasicMaterial({ color: fallbackColor });
    } else {
        material = new THREE.MeshStandardMaterial({ color: fallbackColor, roughness: 0.9 });
    }
    if (textureUrl && textureLoaderRef) {
        textureLoaderRef.load(textureUrl, (loadedTexture) => {
            if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial) {
                material.map = loadedTexture;
                material.color.set(0xffffff);
                if (material instanceof THREE.MeshStandardMaterial) {
                    material.roughness = 0.85;
                }
                material.needsUpdate = true;
            }
        }, undefined, (errorEvent) => {
            console.warn(`Fallback color ${fallbackColor.toString(16)} used for failed texture: ${textureUrl}`, errorEvent);
        });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    parent.add(mesh);
    if (hasAtmosphere) {
        const atmosColor = new THREE.Color(fallbackColor).lerp(new THREE.Color(0x88aaff), 0.3);
        createAtmosphere(mesh, radius, atmosColor);
    }
    if (hasNametag) {
        mesh.userData = mesh.userData || {}; // Tag creation deferred to finalizeCelestialBody
    }
    return mesh;
}

function createPOIs(moonMesh, count) {
    if (!moonMesh || !moonMesh.geometry) {
        console.error("Invalid moonMesh for POIs.");
        return;
    }
    const poiGroup = new THREE.Group();
    poiGroup.visible = false;
    moonMesh.add(poiGroup);
    const moonRadius = moonMesh.userData?.baseRadius || moonMesh.geometry.parameters.radius;
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * Math.random()));
        const theta = Math.random() * Math.PI * 2;
        const poiGeometry = new THREE.SphereGeometry(CONST.POI_BASE_RADIUS, 10, 10);
        const poiMaterial = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x33ff33 : 0x33ddff });
        const poi = new THREE.Mesh(poiGeometry, poiMaterial);
        poi.position.setFromSphericalCoords(moonRadius * 1.05, phi, theta);
        const poiNameStr = `${moonMesh.userData.name} POI ${i + 1}`;
        poi.userData = {
            name: poiNameStr,
            type: "POI",
            parentMoon: moonMesh,
            baseRadius: CONST.POI_BASE_RADIUS,
        };
        poi.userData.label = createNametag(poi, poiNameStr, CONST.POI_BASE_RADIUS, true);
        poiGroup.add(poi);
        STATE.clickableObjects.push(poi);
        STATE.poisWithLabels.push(poi);
    }
    moonMesh.userData.poiGroup = poiGroup;
}

function finalizeCelestialBody(bodyMesh, addLabel = false) {
    if (addLabel && bodyMesh.userData?.name) {
        const radius = bodyMesh.geometry.parameters.radius;
        bodyMesh.userData.nametag = createNametag(bodyMesh, bodyMesh.userData.name, radius, false);
        STATE.celestialBodiesWithLabels.push(bodyMesh);
    }
}

function createOrbitLine(parent, radius, center = new THREE.Vector3(0,0,0)) {
    if (!parent || !parent.add) {
        console.error("Invalid parent for orbit line:", radius);
        return;
    }
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(center.x + radius * Math.cos(theta), center.y, center.z + radius * Math.sin(theta)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x333344, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geometry, material);
    parent.add(line);
}

function createStarfield(scene) {
    const vertices = [];
    for (let i = 0; i < 20000; i++) {
        const radius = THREE.MathUtils.randFloat(500, 2000);
        const phi = Math.acos(-1 + (2 * Math.random()));
        const theta = Math.random() * Math.PI * 2;
        vertices.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: true });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}


export function initScene(scene, textureLoader, worldOrigin) {
    textureLoaderRef = textureLoader;
    createStarfield(scene);

    scene.add(new THREE.AmbientLight(0x606070, 0.8));
    const sunLight = new THREE.PointLight(0xffffee, 2.5, 0, 1.0);
    sunLight.position.copy(CONST.SUN_POSITION);
    scene.add(sunLight);

    const sun = createCelestialBody(CONST.SUN_RADIUS, CONST.SUN_POSITION, CONST.SUN_TEXTURE_URL, scene, 0xffff88, true, false, false);
    sun.userData = { name: "Sun", info: "G-type star.", type: "Star" };

    const jupiterSystem = new THREE.Group();
    const jupiterAngle = Math.random() * Math.PI * 2;
    jupiterSystem.position.x = CONST.JUPITER_ORBIT_RADIUS * Math.cos(jupiterAngle);
    jupiterSystem.position.z = CONST.JUPITER_ORBIT_RADIUS * Math.sin(jupiterAngle);
    scene.add(jupiterSystem);
    createOrbitLine(scene, CONST.JUPITER_ORBIT_RADIUS, worldOrigin);

    const jupiter = createCelestialBody(CONST.JUPITER_RADIUS, worldOrigin, CONST.JUPITER_TEXTURE_URL, jupiterSystem, 0xcf8a50, false, true, true);
    jupiter.userData = { name: "Jupiter", info: "Gas giant.", type: "Planet" };
    STATE.clickableObjects.push(jupiter);
    finalizeCelestialBody(jupiter, true);

    const createMoonAtRandomAngle = (radius, orbitRadius, textureUrl, color, hasAtmos, hasLabel, name, info) => {
        const angle = Math.random() * Math.PI * 2;
        const position = new THREE.Vector3(orbitRadius * Math.cos(angle), 0, orbitRadius * Math.sin(angle));
        const moon = createCelestialBody(radius, position, textureUrl, jupiterSystem, color, false, hasAtmos, hasLabel);
        moon.userData = { name: name, info: info, type: "Moon", baseRadius: radius };
        STATE.clickableObjects.push(moon);
        createOrbitLine(jupiterSystem, orbitRadius, worldOrigin); // Moons orbit Jupiter's center in the jupiterSystem group
        finalizeCelestialBody(moon, hasLabel);
        
        if (marketData[name]) { // marketData from economyManager
            moon.userData.hasMarket = true;
            marketData[name].companies.forEach(company => {
                if (company.produces) company.produces.currentPrice = company.produces.basePrice;
                if (company.consumes) company.consumes.currentPrice = company.consumes.basePrice;
            });
        } else {
            moon.userData.hasMarket = false;
        }
        return moon;
    };

        const metis = createMoonAtRandomAngle(CONST.METIS_RADIUS, CONST.METIS_ORBIT_RADIUS, CONST.METIS_TEXTURE_URL, 0x999999, false, true, "Metis", "Inner Jovian moon.");
    const adrastea = createMoonAtRandomAngle(CONST.ADRASTEA_RADIUS, CONST.ADRASTEA_ORBIT_RADIUS, CONST.ADRASTEA_TEXTURE_URL, 0xaaaaaa, false, true, "Adrastea", "Inner Jovian moon.");
    const amalthea = createMoonAtRandomAngle(CONST.AMALTHEA_RADIUS, CONST.AMALTHEA_ORBIT_RADIUS, CONST.AMALTHEA_TEXTURE_URL, 0xaa8877, false, true, "Amalthea", "Inner Jovian moon.");
    const thebe = createMoonAtRandomAngle(CONST.THEBE_RADIUS, CONST.THEBE_ORBIT_RADIUS, CONST.THEBE_TEXTURE_URL, 0x888888, false, true, "Thebe", "Inner Jovian moon.");

    const io = createMoonAtRandomAngle(CONST.IO_RADIUS, CONST.IO_ORBIT_RADIUS, CONST.IO_TEXTURE_URL, 0xffdd88, true, true, "Io", "Volcanic moon.");
    const europa = createMoonAtRandomAngle(CONST.EUROPA_RADIUS, CONST.EUROPA_ORBIT_RADIUS, CONST.EUROPA_TEXTURE_URL, 0xeeeecc, true, true, "Europa", "Icy moon, potential ocean.");
    const ganymede = createMoonAtRandomAngle(CONST.GANYMEDE_RADIUS, CONST.GANYMEDE_ORBIT_RADIUS, CONST.GANYMEDE_TEXTURE_URL, 0xaaaaaa, true, true, "Ganymede", "Largest moon, icy.");
    const callisto = createMoonAtRandomAngle(CONST.CALLISTO_RADIUS, CONST.CALLISTO_ORBIT_RADIUS, CONST.CALLISTO_TEXTURE_URL, 0x776655, true, true, "Callisto", "Heavily cratered icy moon.");

    createPOIs(io, 3); STATE.moonsWithPOIs.push(io);
    createPOIs(europa, 2); STATE.moonsWithPOIs.push(europa);
    createPOIs(ganymede, 3); STATE.moonsWithPOIs.push(ganymede);
    createPOIs(callisto, 2); STATE.moonsWithPOIs.push(callisto);

    STATE.moonsWithPOIs.forEach(moon => { if (moon.userData.poiGroup) moon.userData.poiGroup.visible = false; });

    return { sun, jupiterSystem, jupiter, io, europa, ganymede, callisto, metis, adrastea, amalthea, thebe };
}