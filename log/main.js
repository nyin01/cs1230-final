import "./style.css";
// import { setupCounter } from './counter.js'

import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { generate } from "./l_util";
import { generateRain, generateSnow, generateWind } from './weather.js';


let camera;
let renderer;
let scene;
let light;
let skybox;
let controls;
let axiom = "X";
let total_tree_geo = new THREE.BufferGeometry();
let total_leaf_geo = new THREE.BufferGeometry();
let container;

function init() {
  // Scene
  container = document.querySelector("#app");
  scene = new THREE.Scene();
  scene.background = new THREE.Color("lightblue");

  setupCamera();
  setupLights();
  setupRenderer();
  setupSkyBox();
  setupControl();
  // setupGeometry();
  buildTree(5);
  setupSider();
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
    const skyColor = new THREE.Color('lightblue');
    const groundColor = new THREE.Color('darkgreen');
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

function buildTree(iteration, radius, decay, length) {
  // iteration = iteration < 2 ? 2 : iteration;
  let l_str = generate(axiom, iteration, 0);
  total_tree_geo = new THREE.BufferGeometry();
  total_leaf_geo = new THREE.BufferGeometry();
  var quaternion = new THREE.Quaternion();
  let start_point = new THREE.Vector3(0, -50, 0);
  let trunks = [];
  let leaves = [];
  let radius_start = radius;
  let thin_factor = decay;
  let branch_length = length;
  const angle = Math.PI / 7;
  const stack = [];
  for (var i = 0; i < l_str.length; i++) {
    var char = l_str[i];
    if (char == "F") {
      //determine endpoint with quaternion rotation
      const dir = new THREE.Vector3(0, branch_length, 0);
      dir.applyQuaternion(quaternion);
      const end_point = start_point.clone();
      end_point.add(dir);

      //determine start radius and end radius of the branch
      const radius_end = radius_start * thin_factor;

      //create branch and leaf geometry
      const curr_branch = makeBranch(
        start_point.clone(),
        end_point.clone(),
        radius_start,
        radius_end,
        quaternion.clone(),
        branch_length
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
      const curr_leaf = makeLeaf(start_point.clone());
      leaves.push(curr_leaf.clone());
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

  if (trunks.length > 0) {
    total_tree_geo = BufferGeometryUtils.mergeGeometries(trunks);
    const trunk_mat = new THREE.MeshLambertMaterial({ color: 12887172 });
    var tree_mesh = new THREE.Mesh(total_tree_geo, trunk_mat);
    tree_mesh.name = "tree_mesh";
    scene.add(tree_mesh);
  }

  if (leaves.length > 0) {
    total_leaf_geo = BufferGeometryUtils.mergeGeometries(leaves);
    const leaf_mat = new THREE.MeshLambertMaterial({ color: "green" });
    var leaf_mesh = new THREE.Mesh(total_leaf_geo, leaf_mat);
    leaf_mesh.name = "leaf_mesh";
    scene.add(leaf_mesh);
  }
}

function makeBranch(start, end, s_radius, e_radius, quaternion, length) {
  const trunk_geo = new THREE.CylinderGeometry(
    e_radius,
    s_radius,
    length,
    3,
    1
  );
  trunk_geo.applyQuaternion(quaternion);

  const pos = new THREE.Vector3(
    start.x + (end.x - start.x) / 2,
    start.y + (end.y - start.y) / 2,
    start.z + (end.z - start.z) / 2
  );
  trunk_geo.translate(pos);
  return trunk_geo;
}

function makeLeaf(center) {
  const leaf_geo = new THREE.SphereGeometry(20, 2, 2);

  const pos = new THREE.Vector3(center.x, center.y, center.z);
  leaf_geo.translate(pos);
  return leaf_geo;
}

// weather
const rain = generateRain();
const snow = generateSnow();
const wind = generateWind();
scene.add(rain);
scene.add(snow);
scene.add(wind);

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

  // animate rain and snow to fall down vertically
  rain.rotation.y += 0.01;
  rain.position.y -= 0.1;
  snow.rotation.y += 0.01;
  snow.position.y -= 0.1;

  // animate wind 
  wind.position.x += 2;

  controls.update();
	renderer.render( scene, camera );
}

document.querySelector("#app").innerHTML = `
  <div>
    <div class="card">
      <input type="range" min="0" max="100" value="0" class="slider" id="mySlider">

    </div>
  </div>
`;

function setupSider() {
  const slider = document.getElementById("mySlider");
  slider.addEventListener("input", () => {
    //delete existing tree mesh
    var tree_mesh = scene.getObjectByName("tree_mesh");
    scene.remove(tree_mesh);

    var leaf_mesh = scene.getObjectByName("leaf_mesh");
    scene.remove(leaf_mesh);

    //configure new tree mesh iteration, radius, and decay factor
    const value = slider.value;
    const radius = 3 + (5 * value) / 100;
    const decay_factor = Math.min(0.95, 1 - 0.05 / (value / 50));
    const iter = Math.ceil(value / 20);
    const length = (10 * value) / 100;

    buildTree(iter, radius, decay_factor, length);
  });
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
animate();
