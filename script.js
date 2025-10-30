// Import necessary modules from Three.js CDN
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader.js';
import { IFCLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/IFCLoader.js';

// --- STATE MANAGEMENT ---
const state = {
    selectedProject: null,
    projects: [
        { id: 'ifc-house', name: 'IFC: Sample House', url: 'https://raw.githubusercontent.com/youshengCode/IfcSampleFiles/main/Ifc4_SampleHouse.ifc' },
        { id: 'obj-watch', name: 'OBJ: Pocket Watch', url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/obj/watch/watch.obj' },
        { id: 'fbx-car', name: 'FBX: Mercedes Benz', url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/fbx/Mercedes.fbx' },
        { id: 'glb-avocado', name: 'GLB: Avocado', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Avocado/glTF-Binary/Avocado.glb' }
    ],
    three: {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        model: null,
        requestId: null,
        mixer: null,
        clock: new THREE.Clock()
    }
};

// --- DOM ELEMENTS ---
const projectSelectionScreen = document.getElementById('project-selection-screen');
const viewerScreen = document.getElementById('viewer-screen');
const projectList = document.getElementById('project-list');
const launchButton = document.getElementById('launch-button');
const backButton = document.getElementById('back-button');
const projectTitle = document.getElementById('project-title');
const canvasContainer = document.getElementById('canvas-container');

// --- FUNCTIONS ---

/**
 * Renders the list of projects on the selection screen.
 */
function renderProjectList() {
    projectList.innerHTML = '';
    state.projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.dataset.projectId = project.id;
        li.addEventListener('click', () => handleProjectSelection(project));
        projectList.appendChild(li);
    });
}

/**
 * Handles the selection of a project from the list.
 * @param {object} project - The selected project object.
 */
function handleProjectSelection(project) {
    state.selectedProject = project;

    // Update visual selection
    const items = projectList.querySelectorAll('li');
    items.forEach(item => {
        if (item.dataset.projectId === project.id) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    launchButton.disabled = false;
}

/**
 * Switches the view from the project selection to the 3D viewer.
 */
function showViewer() {
    if (!state.selectedProject) return;

    projectTitle.textContent = state.selectedProject.name;
    projectSelectionScreen.style.display = 'none';
    viewerScreen.style.display = 'flex'; // Use flex to match CSS

    initThreeScene(state.selectedProject.url);
}

/**
 * Switches the view from the 3D viewer back to the project selection.
 */
function showProjectSelection() {
    projectSelectionScreen.style.display = 'block';
    viewerScreen.style.display = 'none';

    cleanupThreeScene();
}

/**
 * Initializes the Three.js scene, camera, renderer, and loads the model.
 * @param {string} modelUrl - The URL of the 3D model to load.
 */
function initThreeScene(modelUrl) {
    // 1. Scene
    state.three.scene = new THREE.Scene();
    state.three.scene.background = new THREE.Color(0x16213e);

    // 2. Camera
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    state.three.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    state.three.camera.position.set(5, 5, 5);

    // 3. Renderer
    state.three.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.three.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    state.three.renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(state.three.renderer.domElement);

    // 4. Controls
    state.three.controls = new OrbitControls(state.three.camera, state.three.renderer.domElement);
    state.three.controls.enableDamping = true;

    // Add a grid helper for visual debugging of scale and position
    const gridHelper = new THREE.GridHelper(100, 30);
    state.three.scene.add(gridHelper);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    state.three.scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemisphereLight.position.set(0, 200, 0);
    state.three.scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    state.three.scene.add(directionalLight);

    // 6. Model Loading (Dynamic Loader Selection)
    const fileExtension = modelUrl.split('.').pop().toLowerCase();
    let loader;

    const onModelLoad = (model) => {
        state.three.model = model;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(state.three.model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Auto-scaling
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 10 / maxSize;
        state.three.model.scale.set(scale, scale, scale);

        // Auto-centering
        state.three.model.position.sub(center.multiplyScalar(scale));

        // Special camera adjustments for large IFC models
        if (state.selectedProject.url.endsWith('.ifc')) {
            const radius = size.length() * scale;
            state.three.camera.position.set(radius, radius, radius);
            state.three.controls.target.copy(center.multiplyScalar(scale));
            state.three.camera.far = radius * 5;
            state.three.camera.updateProjectionMatrix();
        }


        state.three.scene.add(state.three.model);
    };

    const onError = (error) => {
        console.error('An error happened while loading the model:', error);
    };

    if (fileExtension === 'ifc') {
        loader = new IFCLoader();
        // The IFCLoader needs to know where to find the WASM module.
        loader.ifcManager.setWasmPath('https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/ifc/');
        loader.load(modelUrl, onModelLoad, undefined, onError);
    } else if (fileExtension === 'obj') {
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();

        // The MTL file usually has the same name and is in the same directory.
        const mtlUrl = modelUrl.replace('.obj', '.mtl');

        mtlLoader.load(mtlUrl, (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load(modelUrl, onModelLoad, undefined, onError);
        }, undefined, (error) => {
            // If the MTL file is not found, load the OBJ without materials.
            console.warn(`Could not load material file ${mtlUrl}:`, error);
            objLoader.load(modelUrl, onModelLoad, undefined, onError);
        });
        return; // Exit here because loading is async with two steps
    } else if (fileExtension === 'fbx') {
        loader = new FBXLoader();
        loader.load(modelUrl, (object) => {
            // FBX models can contain animations. We need a mixer to handle them.
            state.three.mixer = new THREE.AnimationMixer(object);
            if (object.animations.length > 0) {
                const action = state.three.mixer.clipAction(object.animations[0]);
                action.play();
            }

            // Ensure materials are correctly applied to all parts of the model.
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            onModelLoad(object);
        }, undefined, onError);
        return; // Exit here for custom async handling
    } else { // Default to GLTF/GLB
        loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => onModelLoad(gltf.scene), undefined, onError);
    }

    // 7. Start Animation Loop
    animate();
}

/**
 * The animation loop for rendering the 3D scene.
 */
function animate() {
    state.three.requestId = requestAnimationFrame(animate);
    state.three.controls.update(); // Required for damping

    // Update the animation mixer if it exists
    if (state.three.mixer) {
        state.three.mixer.update(state.three.clock.getDelta());
    }

    state.three.renderer.render(state.three.scene, state.three.camera);
}

/**
 * Cleans up the Three.js scene to free up resources.
 */
function cleanupThreeScene() {
    if (state.three.requestId) {
        cancelAnimationFrame(state.three.requestId);
    }

    if (state.three.scene) {
        state.three.scene.traverse(object => {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
    }

    if (state.three.renderer) {
        state.three.renderer.dispose();
        canvasContainer.removeChild(state.three.renderer.domElement);
    }

    // Reset state
    Object.assign(state.three, {
        scene: null, camera: null, renderer: null, controls: null, model: null, requestId: null
    });
}

/**
 * Handles window resize events to keep the viewport correct.
 */
function onWindowResize() {
    if (state.three.camera && state.three.renderer) {
        state.three.camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        state.three.camera.updateProjectionMatrix();
        state.three.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    }
}

// --- INITIALIZATION ---
function main() {
    renderProjectList();
    launchButton.addEventListener('click', showViewer);
    backButton.addEventListener('click', showProjectSelection);
    window.addEventListener('resize', onWindowResize);
}

main();
