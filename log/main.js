import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

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
camera.position.set(0, 10, 25);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
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
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
directionalLight.position.set(-5, 5, 5);
ambientLight.position.set(1, 1, 1);
scene.add(directionalLight);
scene.add(ambientLight);


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

// function to create dias that will hold the tree
function createDias() {
  // const building = createDias(0xfedcc1, 0x5e6679, 2, 3, 2, 0.8);
  
  var bigCubeGeometry = new THREE.BoxGeometry(4, 2.5, 4);
  const bigGrassGeometry = new THREE.PlaneGeometry(4, 4);
  var smallCubeGeometry = new THREE.BoxGeometry(3, 0.7, 3);
  const smallGrassGeometry = new THREE.PlaneGeometry(3, 3);

  
  // var cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xfedcc1 });

  const material = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = normal;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 lightDirection;
        void main() {
          // Calculate lighting
          float lightIntensity = max(dot(normalize(vNormal), lightDirection), 0.0);

          // Quantize the light intensity for toon effect
          float quantizedIntensity = floor(lightIntensity * 4.0) / 3.0;

          // Gradient mix
          float mixRatio = clamp((vPosition.y + 0.5), 0.0, 1.0);
          vec3 gradient = mix(color2, color1, mixRatio);

          // Apply quantized lighting
          vec3 toonShadedColor = gradient * quantizedIntensity;

          gl_FragColor = vec4(toonShadedColor, 1.0);
      }
    `,
    uniforms: {
        color1: { value: new THREE.Color(0xfedcc1) }, //light peach
        color2: { value: new THREE.Color(0xecbea0) },  // tan
        lightDirection: { value: new THREE.Vector3(-5, 5, 5).normalize() }
    }
});
  
  const dias = new THREE.Mesh(bigCubeGeometry, material);
  dias.position.set(0, 1.5, -2);
  scene.add(dias);

  const diasTop = new THREE.Mesh(smallCubeGeometry, material);
  diasTop.position.set(0, 3, -2);
  scene.add(diasTop);

  const grassMaterial = new THREE.MeshToonMaterial({color: 0xe6eab5 });

  const smallgrass = new THREE.Mesh(smallGrassGeometry, grassMaterial);
  smallgrass.rotateX(-Math.PI * 0.5);

  const biggrass = new THREE.Mesh(bigGrassGeometry, grassMaterial);
  biggrass.rotateX(-Math.PI * 0.5);
  
  smallgrass.position.set(0, 3.36 ,-2);

  biggrass.position.set(0, 2.76 , -2);

  scene.add(smallgrass);
  scene.add(biggrass);

}

// Function to create a floating island
function createFloatingIsland() {
  // Create geometries for the island
  // Define the main island platform
  const islandGeometry = new THREE.BoxGeometry(10, 1, 10);

  const grassGeometry = new THREE.PlaneGeometry(10, 10);

  // Define a waterfall, assuming it's a thin, vertical box
  const waterfallVerticalGeometry = new THREE.PlaneGeometry(2, 10);
  const waterfallHorizontalGeometry = new THREE.PlaneGeometry(2, 5);

  // // Define a building, assuming it's a simple rectangular prism
  // const buildingGeometry = new THREE.BoxGeometry(2, 3, 2);

  // // Define a tower, assuming it's a cylinder
  const towerGeometry = new THREE.CylinderGeometry(0.75, 0.75, 5, 32);

  // // For the domed roofs, we could use a half-sphere geometry
  const domeGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);


  // Create materials for the island
  const islandMaterial = new THREE.MeshToonMaterial({ color: 0xecbea0 });
  const grassMaterial = new THREE.MeshToonMaterial({color: 0xe6eab5 });
  const waterfallMaterial = new THREE.MeshToonMaterial({ color: 0x71cbaa, side: THREE.DoubleSide });
  // const buildingMaterial = new THREE.MeshToonMaterial({color: 0xfedcc1});
  
  // tan: 0xfedcc1, blue: 0x5e6679
  const towerMaterial = new THREE.MeshToonMaterial({ color: 0xfedcc1 });
  const domeMaterial = new THREE.MeshToonMaterial({ color: 0xe6eab5 });

  // Combine geometries and materials for the island
  const island = new THREE.Mesh(islandGeometry, islandMaterial);

  const grass = new THREE.Mesh(grassGeometry, grassMaterial);
  grass.rotateX(-Math.PI * 0.5);

  const waterfallVertical = new THREE.Mesh(waterfallVerticalGeometry, waterfallMaterial);
  const waterfallHortizontal = new THREE.Mesh(waterfallHorizontalGeometry, waterfallMaterial);
  waterfallHortizontal.rotateX(-Math.PI * 0.5);

  // const building = createDias(0xfedcc1, 0x5e6679, 2, 3, 2, 0.8);

  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);

  // // Position your objects, this is just an example
  island.position.set(0, 0, 0);
  grass.position.set(0, 0.51 ,0);
  waterfallVertical.position.set(1, -4.48, 5.01);
  waterfallHortizontal.position.set(1, 0.52, 2.51);
  // building.position.set(-2, 1.5, -2);
  tower.position.set(3, 4, 3);
  dome.position.set(-2, 3, -2);


  // Add objects to the scene
  scene.add(island);
  scene.add(grass);
  scene.add(waterfallVertical);
  scene.add(waterfallHortizontal);
  createDias();
  scene.add(tower);
  scene.add(dome);

  // Add the tree to the island
  // createTree();

  // Add a waterfall
  // ... [Create waterfall using PlaneGeometry and animate it]
}

// Create the floating island
createFloatingIsland();


let foliagePosY = 3;

// Grow tree when clicked
function setupCounter(container) {
  const foliageGeometry = new THREE.ConeGeometry(2, 4, 32);
  const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
  // Append the counter button to the provided container
  const counterButton = document.createElement('button');
  counterButton.textContent = 'Grow';
  container.appendChild(counterButton);
  // Handle button click to grow the tree
  counterButton.addEventListener('click', () => {
    foliagePosY += 2;
    const moreFoliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    moreFoliage.position.set(0, foliagePosY, 0);
    scene.add(moreFoliage);
  });
}


// Create materials for the skybox
const skyColor = new THREE.Color('lightblue');
const skyboxMaterials = [
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Left side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Right side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Top side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Bottom side
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
