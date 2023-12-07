import "./style.css";
// import { setupCounter } from './counter.js'

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { generate } from "./l_util";

let camera;
let renderer;
let scene;
let light;
let skybox;
let controls;
let cube2;
let cube3;
let axiom = "X";

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color("lightblue");

  setupCamera();
  setupLights();
  setupRenderer();
  setupSkyBox();
  setupControl();
  // setupGeometry();
  buildTree(5);
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
  light = new THREE.DirectionalLight(0xffffff, 1);
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
  skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
  scene.add(skybox);
}

function setupControl() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0); // Set the point at which the camera looks
  controls.update();
}

function setupGeometry() {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x489e94,
  });
  cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube2.position.set(-5, 13, 12);
  scene.add(cube2);
  // another one, added as separate meshes
  cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube3.position.set(30, 13, 12);
  scene.add(cube3);
}

function buildTree(iteration) {
  // iteration = iteration < 2 ? 2 : iteration;
  let l_str = generate(axiom, iteration, 0);
  console.log(l_str);

  let curr_branch;
  var position = new THREE.Vector3(0, -20, 0);
  var quaternion = new THREE.Quaternion();
  const angle = Math.PI / 7;
  const stack = [];
  for (var i = 0; i < l_str.length; i++) {
    var char = l_str[i];
    if (char == "F") {
      const dir = new THREE.Vector3(0, 1, 0).normalize();
      dir.applyQuaternion(quaternion);
      position.add(dir.clone().multiplyScalar(5));
      curr_branch = makeBranch(position.clone(), quaternion.clone());
      scene.add(curr_branch);
      continue;
    } else if (char == "+") {
      quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          angle
        )
      );
    } else if (char == "-") {
      quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          -angle
        )
      );
    } else if (char == "[") {
      const new_obj = new Object();
      new_obj.pos = new THREE.Vector3(position.x, position.y, position.z);
      new_obj.qua = new THREE.Quaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z
      );
      stack.push(new_obj);
      console.log(stack);
    } else if (char == "]") {
      const tuple = stack.pop();
      if (tuple) {
        quaternion.copy(tuple.qua);
        position.copy(tuple.pos);
      }
    }
  }
}

function makeBranch(pos, quaternion) {
  const trunk_geo = new THREE.CylinderGeometry(1, 1, 5, 3, 1);
  const trunk_mat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  const trunk_mesh = new THREE.Mesh(trunk_geo, trunk_mat);
  trunk_mesh.position.copy(pos);
  trunk_mesh.applyQuaternion(quaternion);
  return trunk_mesh;
}
// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // cube2.rotation.x += 0.01;
  // cube2.rotation.y += 0.01;

  // cube3.rotation.x += 0.01;
  // cube3.rotation.z += 0.01;

  renderer.render(scene, camera);
}

init();
animate();
