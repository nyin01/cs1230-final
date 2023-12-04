import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();

/**
 * PERSPECTIVE CAMERA
 * 
 *  1) Field of View is the extent of the scene that is seen on the display at any given moment. The value is in degrees.
 *  2) Aspect Ratio: use the width of the element divided by the height, or you'll get squished image
 *  3) Near: if objects are closer than 'near', won't be rendered
 *  4) Far: if objects are farther than 'far', won't be rendered
 */
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth * 0.9, window.innerHeight * 0.9 );
document.body.appendChild( renderer.domElement );

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// Function to create a tree
function createTree() {
  // Create a cylinder to represent the trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(0, 0, 0);
  scene.add(trunk);

  // Create a cone to represent the foliage
  const foliageGeometry = new THREE.ConeGeometry(2, 4, 32);
  const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.set(0, 3, 0);
  scene.add(foliage);
}

createTree();

camera.position.z = 10;

// Create materials for the skybox
const skyColor = new THREE.Color('lightblue');
const groundColor = new THREE.Color('darkgreen');
const skyboxMaterials = [
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Left side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Right side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Top side
    new THREE.MeshBasicMaterial({ color: groundColor, side: THREE.BackSide }), // Bottom side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Front side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide })  // Back side
];

// Create the skybox
const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
scene.add(skybox);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0); // Set the point at which the camera looks
controls.update(); // Update controls



function animate() {
	requestAnimationFrame( animate );

  controls.update();

	renderer.render( scene, camera );
}
animate();

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector('#counter'))
