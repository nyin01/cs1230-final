import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
// import { setupCounter } from './counter.js'

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let camera;
let renderer;
let scene;

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  setupCamera();
  setupLights();
  setupRenderer();
  setupSkyBox();
  setupControl();
  setupGeometry();

  renderer.render(scene, camera);
}

function setupCamera() {
  /**
   * PERSPECTIVE CAMERA
   *
   *  1) Field of View is the extent of the scene that is seen on the display at any given moment. The value is in degrees.
   *  2) Aspect Ratio: use the width of the element divided by the height, or you'll get squished image
   *  3) Near: if objects are closer than 'near', won't be rendered
   *  4) Far: if objects are farther than 'far', won't be rendered
   */
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 25);
}

function setupLights() {
  // Add lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);
}

function setupRenderer() {
  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
  document.body.appendChild(renderer.domElement);
}

function setupSkyBox() {
  // Create materials for the skybox
  const skyColor = new THREE.Color("lightblue");
  const groundColor = new THREE.Color("darkgreen");
  const skyboxMaterials = [
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Left side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Right side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Top side
    new THREE.MeshBasicMaterial({ color: groundColor, side: THREE.BackSide }), // Bottom side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Front side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Back side
  ];

  // Create the skybox
  const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
  scene.add(skybox);
}

function setupControl() {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0); // Set the point at which the camera looks
  controls.update(); // Update controls
}

function setupGeometry() {
  const cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const cubeWireframe2 = new THREE.Mesh(cubeGeometry, cubeWireframeMaterial);
  cube2.position.set(-5, 13, 12);
  cubeWireframe2.position.set(-5, 13, 12);
  const cubeGroup = new THREE.Group();
  cubeGroup.add(cube2);
  cubeGroup.add(cubeWireframe2);
  scene.add(cubeGroup);
  // another one, added as separate meshes
  const cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
  const cubeWireframe3 = new THREE.Mesh(cubeGeometry, cubeWireframeMaterial);
  cube3.position.set(-5, 13, 12);
  cubeWireframe3.position.set(-5, 13, 12);
  scene.add(cube3);
  scene.add(cubeWireframe3);
}

init();
