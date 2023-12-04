import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

import * as THREE from 'three';

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

	renderer.render( scene, camera );
}
animate();

// Each time button clicked, increase height of tree (this is not the built in setupCounter function)
function setupCounter(container) {
  // Create a tree object with trunk and branches
  const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 8); // Trunk geometry
  const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 }); // Brown color for trunk
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  const branchGeometry = new THREE.ConeGeometry(0.5, 2, 8); // Branch geometry
  const branchMaterial = new THREE.MeshBasicMaterial({ color: 0x228b22 }); // Green color for branches
  const branches = new THREE.Group();
  // Position and add trunk to branches group
  trunk.position.set(0, -1.5, 0);
  // branches.add(trunk);
  // Add branches to the branches group
  for (let i = 0; i < 3; i++) {
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branch.position.set(0, i * 1.5, 0);
    branches.add(branch);
  }
  // Position the branches group in the scene
  branches.position.set(0, 0, 0);
  // Add the branches group to the scene
  scene.add(trunk);
  scene.add(branches);
  // Append the counter button to the provided container
  const counterButton = document.createElement('button');
  counterButton.textContent = 'make it grow';
  container.appendChild(counterButton);
  // Handle button click to grow the tree
  counterButton.addEventListener('click', () => {
    // Add one branch to the branches group
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branch.position.set(0, branches.children.length * 1.5, 0);
    branches.add(branch);
    // Decrease the scale of the branches group
    branches.scale.y -= 0.025;
    // Move the branches group down
    branches.position.y -= 0.025;
  });
}


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
