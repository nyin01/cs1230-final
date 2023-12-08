import "./style.css";
// import { setupCounter } from './counter.js'

import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { generate } from "./l_util";

let camera;
let renderer;
let scene;
let light;
let skybox;
let controls;
let axiom = "X";
let total_tree_geo = new THREE.BufferGeometry();

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

// function setupGeometry() {
//   const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
//   const cubeMaterial = new THREE.MeshBasicMaterial({
//     color: 0x489e94,
//   });
//   cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
//   cube2.position.set(-5, 13, 12);
//   scene.add(cube2);
//   // another one, added as separate meshes
//   cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial);
//   cube3.position.set(30, 13, 12);
//   scene.add(cube3);
// }

function buildTree(iteration) {
  // iteration = iteration < 2 ? 2 : iteration;
  let l_str = generate(axiom, iteration, 0);
  total_tree_geo = new THREE.BufferGeometry();
  var quaternion = new THREE.Quaternion();
  let start_point = new THREE.Vector3(0, -50, 0);
  let trunks = [];
  let radius_start = 10;
  let thin_factor = 0.95;
  const angle = Math.PI / 7;
  const stack = [];
  for (var i = 0; i < l_str.length; i++) {
    var char = l_str[i];
    if (char == "F") {
      //determine endpoint with quaternion rotation
      const dir = new THREE.Vector3(0, 5, 0);
      dir.applyQuaternion(quaternion);
      const end_point = start_point.clone();
      end_point.add(dir);

      //determine start radius and end radius of the branch
      const radius_end = radius_start * thin_factor;
      const curr_branch = makeBranch(
        start_point.clone(),
        end_point.clone(),
        radius_start,
        radius_end,
        quaternion.clone()
      );

      //push to render group
      trunks.push(curr_branch.clone());

      //update variables
      start_point = end_point;
      radius_start = radius_end;
      continue;
    } else if (char == "+") {
      quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          angle
        )
      );
      quaternion.normalize();
    } else if (char == "-") {
      quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          -angle
        )
      );
      quaternion.normalize();
    } else if (char == "[") {
      const new_obj = new Object();
      new_obj.pos = new THREE.Vector3(
        start_point.x,
        start_point.y,
        start_point.z
      );
      new_obj.qua = new THREE.Quaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z
      );
      new_obj.radius = radius_start;
      stack.push(new_obj);
    } else if (char == "]") {
      const tuple = stack.pop();
      if (tuple) {
        quaternion.copy(tuple.qua);
        start_point.copy(tuple.pos);
        radius_start = tuple.radius;
      }
    } else if (char == "<") {
      quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          angle
        )
      );
      quaternion.normalize();
    } else if (char == ">") {
      quaternion.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          -angle
        )
      );
      quaternion.normalize();
    }
  }

  total_tree_geo = BufferGeometryUtils.mergeGeometries(trunks);
  const trunk_mat = new THREE.MeshLambertMaterial({ color: 12887172 });
  var tree_mesh = new THREE.Mesh(total_tree_geo, trunk_mat);
  scene.add(tree_mesh);
}

function makeBranch(start, end, s_radius, e_radius, quaternion) {
  const trunk_geo = new THREE.CylinderGeometry(e_radius, s_radius, 5, 3, 1);
  trunk_geo.applyQuaternion(quaternion);

  const pos = new THREE.Vector3(
    start.x + (end.x - start.x) / 2,
    start.y + (end.y - start.y) / 2,
    start.z + (end.z - start.z) / 2
  );
  trunk_geo.translate(pos);
  return trunk_geo;
}
// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();
animate();
