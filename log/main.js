import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// Scene
const scene = new THREE.Scene();

/**
 * PERSPECTIVE CAMERA
 * 
 *  1) Field of View is the extent of the scene that is seen on the display at any given moment. The value is in degrees.
 *  2) Aspect Ratio: use the width of the element divided by the height, or you'll get squished image
 *  3) Near: if objects are closer than 'near', won't be rendered
 *  4) Far: if objects are farther than 'far', won't be rendered
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth * 0.9, window.innerHeight * 0.9 );
document.body.appendChild(renderer.domElement);

// Mesh, object only
const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
const cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0x489e94,
});
const cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube1.position.set(-5, 7, 12); // or set individual x, y, z like cube.position.x = 5;
scene.add(cube1);

// Mesh, wireframe only
const cubeWireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const cubeWireframe1 = new THREE.Mesh(cubeGeometry, cubeWireframeMaterial);
cubeWireframe1.position.set(-5, 10, 12); 
scene.add(cubeWireframe1);
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



// Mesh, both object color and wireframe, added as a group 
// this means the group has a different center pos? see the cube floating around
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

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  
  cube1.rotation.x += 0.01;
  cube1.rotation.y += 0.01;

  cubeWireframe1.rotation.y += 0.01;
  cubeWireframe1.rotation.z += 0.01;

  // this is potentially how we can add clouds and birds (any chronically occuring objects)? although might be inefficient
  cubeGroup.rotation.z += 0.01;

  cube3.rotation.x += 0.01;
  cube3.rotation.z += 0.01;
  cubeWireframe3.rotation.x += 0.01;
  cubeWireframe3.rotation.z += 0.01;

  controls.update();
	renderer.render( scene, camera );
}
animate();


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

document.querySelector('#app').innerHTML = `
  <div>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`

// Call the setupCounter function with the container element
setupCounter(document.querySelector('#counter'));
