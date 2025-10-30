// Import necessary modules from Three.js CDN
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

// --- STATE MANAGEMENT ---
const state = {
    selectedProject: null,
    projects: [
        { id: 'box', name: 'Project: Box', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb' },
        { id: 'avocado', name: 'Project: Avocado', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Avocado/glTF-Binary/Avocado.glb' },
        { id: 'fish', name: 'Project: Barramundi Fish', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BarramundiFish/glTF-Binary/BarramundiFish.glb' }
    ],
    three: {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        model: null,
        requestId: null
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
    state.three.camera.position.set(2, 2, 3);

    // 3. Renderer
    state.three.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.three.renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    state.three.renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(state.three.renderer.domElement);

    // 4. Controls
    state.three.controls = new OrbitControls(state.three.camera, state.three.renderer.domElement);
    state.three.controls.enableDamping = true;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    state.three.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    state.three.scene.add(directionalLight);

    // 6. Model Loading
    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
        state.three.model = gltf.scene;

        // Center the model
        const box = new THREE.Box3().setFromObject(state.three.model);
        const center = box.getCenter(new THREE.Vector3());
        state.three.model.position.sub(center);

        state.three.scene.add(state.three.model);
    }, undefined, (error) => {
        console.error('An error happened while loading the model:', error);
    });

    // 7. Start Animation Loop
    animate();
}

/**
 * The animation loop for rendering the 3D scene.
 */
function animate() {
    state.three.requestId = requestAnimationFrame(animate);
    state.three.controls.update(); // Required for damping
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
