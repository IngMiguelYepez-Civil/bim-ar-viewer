import { IfcViewerAPI } from 'https://cdn.jsdelivr.net/npm/web-ifc-viewer@1.0.218/dist/IFCjs-bundle.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container });
viewer.axes.setAxes();
viewer.grid.setGrid();

const scene = viewer.context.getScene();
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

const arButton = document.getElementById('ar-button');
const input = document.getElementById('model-input');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

input.addEventListener('change', async (changed) => {
    showLoading();
    hideError();

    const file = changed.target.files[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    try {
        if (fileExtension === 'ifc') {
            const ifcURL = URL.createObjectURL(file);
            await viewer.IFC.loadIfcUrl(ifcURL, true);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                let loader;
                let object;
                const scene = viewer.context.getScene();
                switch (fileExtension) {
                    case 'obj':
                        loader = new OBJLoader();
                        object = loader.parse(e.target.result);
                        scene.add(object);
                        fitModelToFrame(object);
                        break;
                    case 'fbx':
                        loader = new FBXLoader();
                        object = loader.parse(e.target.result);
                        scene.add(object);
                        fitModelToFrame(object);
                        break;
                    case 'glb':
                    case 'gltf':
                        loader = new GLTFLoader();
                        loader.parse(e.target.result, '', (gltf) => {
                            scene.add(gltf.scene);
                            fitModelToFrame(gltf.scene);
                        });
                        break;
                }
            };

            if (fileExtension === 'obj') {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        }
    } catch (error) {
        showError('Error loading model: ' + error.message);
    } finally {
        hideLoading();
    }
});

function fitModelToFrame(object) {
    const box = new THREE.Box3().setFromObject(object);
    const boxSize = box.getSize(new THREE.Vector3());
    const boxCenter = box.getCenter(new THREE.Vector3());

    const modelRadius = boxSize.length() / 2;
    const camera = viewer.context.getCamera();
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(modelRadius / Math.sin(fov / 2));

    const direction = new THREE.Vector3(0, 0, 1)
        .applyQuaternion(camera.quaternion)
        .multiplyScalar(cameraDistance)
        .add(boxCenter);

    camera.position.copy(direction);
    camera.updateProjectionMatrix();
    camera.lookAt(boxCenter);
}

async function startAR() {
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
        arButton.textContent = 'AR not supported';
        return;
    }

    const session = await navigator.xr.requestSession('immersive-ar');
    const renderer = viewer.context.getRenderer();
    renderer.xr.enabled = true;
    await renderer.xr.setSession(session);
    arButton.textContent = 'Stop AR';

    session.addEventListener('end', () => {
        renderer.xr.enabled = false;
        arButton.textContent = 'Enter AR';
    });
}

arButton.addEventListener('click', () => {
    const currentSession = viewer.context.getRenderer().xr.getSession();
    if (currentSession) {
        currentSession.end();
    } else {
        startAR();
    }
});