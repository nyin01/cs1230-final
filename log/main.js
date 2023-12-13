import "./style.css";
// import { setupCounter } from './counter.js'

import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { generate } from "./l_util";
import { generateRain, generateSnow, generateWind } from './weather.js';
import { createFloatingIsland, 
        createFloatingIslandGrass,
        createWaterfallHorizontal,
        createWaterfallVertical,
        createDias,
        createDiasGrass,
        addCliff,
        addConeCliff,
        addStone,
        addLineHorizontal,
        addLineHVertical
      } from './island';

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { generateSun, generateMoon, generateStars } from "./astronomy.js";

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
let rain;
let snow;
let wind;
let iteration = 1;
let growth = 0;

let k_snow;
let k_rain;
let k_wind;
let snow_drop;
let rain_drop;
let wind_drift;

let isNight;
let sun;
let moon;
let stars;

// island
const island = createFloatingIsland();
const islandGrass = createFloatingIslandGrass();
const wfH = createWaterfallHorizontal();
const wfV = createWaterfallVertical();
const lineH1 = addLineHorizontal(10, -54.5, 60, 50, 70);
const lineH2 = addLineHorizontal(13, -54.5, 40, 30, 50);
const lineH3 = addLineHorizontal(15, -54.5, 80, 70, 80);

const lineV1 = addLineHVertical(10, -90, -70, -60, 100.5);
const lineV2 = addLineHVertical(5, -70, -120, -110, 100.5);
const lineV3 = addLineHVertical(14, -100, -120, -150, 100.5);


const dias = createDias();
const diasGrass = createDiasGrass();
const pillar1 = addCliff(20, 40, 20, -35, -35.5, -15, 0xFAEBD7, 0x5e6679);
const cap1 = addConeCliff(14, 20, -35, -5.5, -15, 0, Math.PI / 2 + 9.99, 0x1E90FF, 0x1E90FF);
const stone1 = addStone(-50, -55.5, 30, 5);
const stone2 = addStone(0, -55.5, 50, 7);
const stone3 = addStone(-60, -55.5, 20, 9);
const stone4 = addStone(20, -55.5, 70, 5);
const stone5 = addStone(40, -55.5, 0, 9);

const pillar2 = addCliff(10, 70, 10, -5, -35.5, -70, 0xFAEBD7, 0x5e6679);
const pillar3 = addCliff(10, 70, 10, 20, -35.5, -70, 0xFAEBD7, 0x5e6679);
const pillar4 = addCliff(10, 70, 10, 50, -35.5, -70, 0xFAEBD7, 0x5e6679);
const pillar5 = addCliff(10, 70, 10, 75, -35.5, -70, 0xFAEBD7, 0x5e6679);



function init() {
  // Scene
  container = document.querySelector("#app");
  scene = new THREE.Scene();
  scene.background = new THREE.Color("black");
  scene.fog = new THREE.Fog( 0xcccccc, 10, 600 );

  // basics
  setupCamera();
  setupLights();
  setupRenderer();
  setupSkyBox();
  setupControl();

  // tree
  buildTree(iteration, growth);
  setupSlider();

  // Create the floating island
  setUpIsland();

  // weather
  setWeather();
  setAstronomy();
}

function setupCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -1000, 5000);
  camera.position.set(20, 20, 20);
  camera.up = new THREE.Vector3(0, 1, 0);
}

function setupRenderer() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);

  document.body.appendChild(renderer.domElement);
}


function setupLights() {
  // Add lighting
  const pointLight = new THREE.DirectionalLight(0xffffff, 1);
  pointLight.position.set(-1, 1, 1);
  pointLight.castShadow = true;
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  ambientLight.position.set(1, 1, 1);
  ambientLight.castShadow = true;
  scene.add(ambientLight);

  //Set up shadow properties for the light
  pointLight.shadow.mapSize.width = 512; // default
  pointLight.shadow.mapSize.height = 512; // default
  pointLight.shadow.camera.near = 0.5; // default
  pointLight.shadow.camera.far = 500; // default
}

function setupSkyBox() {
  // Create materials for the skybox
  const skyColor = new THREE.Color("black");
  const skyboxMaterials = [
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Left side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Right side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Top side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Bottom side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Front side
    new THREE.MeshBasicMaterial({ color: skyColor, side: THREE.BackSide }), // Back side
  ];

  // Create the skybox
  const skyboxGeometry = new THREE.BoxGeometry(300, 300, 300);
  skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
  scene.add(skybox);
}

function setupControl() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0); // Set the point at which the camera looks
  controls.enableDamping = true;
  controls.dampingFactor = 0.15;
  controls.update();
}

function buildTree(iteration, growth) {
  // iteration = iteration < 2 ? 2 : iteration;
  let radius = 3 + (5 * growth) / 1000;
  let decay = Math.min(0.95, 1 - 0.05 / (growth / 50));
  let length = (10 * growth) / 100;
  let length_factor = -1 / (growth + 1) + 1;
  let l_str = generate(axiom, iteration, 0);
  let leaf_radius = Math.max(0, (growth / 100) * 20 - 5);
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
      if (branch_length > 0) {
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
        branch_length = branch_length * length_factor;
        continue;
      }
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
      new_obj.l = branch_length;
      stack.push(new_obj);
    } else if (char == "]") {
      const curr_leaf = makeLeaf(start_point.clone(), leaf_radius);
      leaves.push(curr_leaf.clone());

      const tuple = stack.pop();
      if (tuple) {
        quaternion.copy(tuple.qua);
        start_point.copy(tuple.pos);
        radius_start = tuple.radius;
        branch_length = tuple.l;
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

function makeLeaf(center, radius) {
  const leaf_geo = new THREE.SphereGeometry(radius, 2, 2);

  const pos = new THREE.Vector3(center.x, center.y, center.z);
  leaf_geo.translate(pos);
  return leaf_geo;
}

// ====== WEATHER ======
// setters will be called by GUI

function setSnow(k) {
  if (snow) {
    // Remove existing snow from the scene if it exists
    scene.remove(snow);
  }
  snow = generateSnow(k);
  scene.add(snow);
}

function setRain(k) {
  if (rain) { // Remove existing rain from the scene if it exists
    scene.remove(rain);
  }   
  rain = generateRain(k);
  scene.add(rain);
}

function setWind(k) {
  if (wind) { // Remove existing wind from the scene if it exists
    scene.remove(wind);
  }   
  wind = generateWind(k);
  // scene.add(wind); // for now do not visualize wind
}

function setWeather() {
  setSnow(0);
  setRain(0);
  setWind(0);
}

function isOutOfFrame(yPos) {
  return yPos < -500;
}

function animateWeather(k_snow=0, k_rain=0, k_wind=0, snow_drop=0.01, rain_drop=0.5, wind_drift=0.1) {
  // y is vertical direction!

  // weather
  if (k_snow > 0) {
    snow.position.y -= 0.5 * (k_snow * (2 - k_snow));
    snow.position.x += wind_drift * k_wind;
    if (isOutOfFrame(snow.position.y)) {
      setSnow(k_snow);
    }
  }

  if (k_rain > 0) {
    rain.position.y -= 0.75 * (k_rain * (2 - k_rain) + 1); // rain drops faster than snow
    rain.position.x += wind_drift * k_wind * 2;
    if (isOutOfFrame(rain.position.y)) {
      setRain(k_rain);
    }
  }

  if (k_wind > 0) {
    // wind.rotation.x += wind_drift * k_wind * 30;
  }

}

// ====== ASTRONOMY ======
// setters will be called by GUI

function setSun() {
  sun = generateSun();
  sun.visible = !isNight;
  scene.add(sun);
}

function setMoon() {
  moon = generateMoon();
  moon.visible = isNight;
  scene.add(moon);
}

function setStars() {
  stars = generateStars();
  stars.visible = isNight;
  scene.add(stars);
}

function setAstronomy() {
  isNight = false;
  setSun();
  setMoon();
  setStars();
}

// GUI controlled
function updateAstronomy(isNight) {
  sun.visible = !isNight;
  moon.visible = isNight;
  stars.visible = isNight;
}

// not GUI controlled
function animateAstronomy() {
  // orbit around the scene
  const time = Date.now() * 0.001;
  const sunRadius = 100;
  const moonRadius = 100;
  const starsRadius = 100;
  const sunRate = 0.1;
  const moonRate = 0.1;
  const starsRate = 0.01;
  const sunX = Math.cos(time * sunRate) * sunRadius;
  const sunY = Math.sin(time * sunRate) * sunRadius;
  const sunZ = Math.sin(time * sunRate) * sunRadius;
  const moonX = Math.cos(time * moonRate + Math.PI) * moonRadius;
  const moonY = Math.sin(time * moonRate + Math.PI) * moonRadius;
  const moonZ = Math.sin(time * moonRate + Math.PI) * moonRadius;
  const starsX = Math.cos(time * starsRate) * starsRadius;
  const starsY = Math.sin(time * starsRate) * starsRadius;
  const starsZ = Math.sin(time * starsRate) * starsRadius;
  sun.position.set(sunX, sunY, sunZ);
  moon.position.set(moonX, moonY, moonZ);
  stars.position.set(starsX, starsY, starsZ);
}

function setUpIsland() {
  scene.add(island);
  scene.add(islandGrass);
  scene.add(wfH);
  scene.add(wfV);
  scene.add(dias);
  scene.add(diasGrass);
  scene.add(pillar1);
  scene.add(cap1);
  scene.add(stone1);
  scene.add(stone2);
  scene.add(stone3);
  scene.add(stone4);
  scene.add(stone5);

  scene.add(lineH1);
  scene.add(lineH2);
  scene.add(lineH3);
  scene.add(lineV1);
  scene.add(lineV2);
  scene.add(lineV3);

  scene.add(pillar2);
  scene.add(pillar3);
  scene.add(pillar4);
  scene.add(pillar5);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  animateWeather(k_snow, k_rain, k_wind, snow_drop, rain_drop, wind_drift);
  animateAstronomy();

  // animate lines in waterfall
  lineH1.position.z = Math.sin(Date.now() * 0.002 + 1) * 2;
  lineH2.position.z = Math.sin(Date.now() * 0.002 + 2) * 2;
  lineH3.position.z = Math.sin(Date.now() * 0.002 + 3) * 2;

  lineV1.position.y = Math.sin(Date.now() * 0.002 + 1) * 2;
  lineV2.position.y = Math.sin(Date.now() * 0.002 + 2) * 2;
  lineV3.position.y = Math.sin(Date.now() * 0.002 + 3) * 2;


  controls.update();
	renderer.render( scene, camera );
}

// document.querySelector("#app").innerHTML = `
//   <div>
//     <div class="card">
//       <input type="range" min="0" max="100" value="0" class="slider" id="mySlider">

//     </div>
//   </div>
// `;

const params = {
  growth: 0,
  iter: 1,
  wind: 0,
  rain: 0,
  snow: 0,
  night: 0,
};

function setupSlider() {
  const gui = new GUI();

  gui
    .add(params, "growth", 0, 100)
    .step(1)
    .name("Growth")
    .onChange(function (value) {
      //delete existing tree mesh
      var tree_mesh = scene.getObjectByName("tree_mesh");
      scene.remove(tree_mesh);

      var leaf_mesh = scene.getObjectByName("leaf_mesh");
      scene.remove(leaf_mesh);

      //configure new tree mesh iteration, radius, and decay factor
      growth = value;

      buildTree(iteration, growth);
    });

  gui
    .add(params, "iter", 1, 5)
    .step(1)
    .name("Iteration")
    .onChange(function (value) {
      //delete existing tree mesh
      var tree_mesh = scene.getObjectByName("tree_mesh");
      scene.remove(tree_mesh);

      var leaf_mesh = scene.getObjectByName("leaf_mesh");
      scene.remove(leaf_mesh);

      //configure new tree mesh iteration, radius, and decay factor
      iteration = value;

      buildTree(iteration, growth);
    });
  
  gui
    .add(params, "wind", 0, 1)
    .step(0.1)
    .name("Wind")
    .onChange(function (value) {
      k_wind = value;
      setWind(value);
    });
  
  gui
    .add(params, "rain", 0, 1)
    .step(0.1)
    .name("Rain")
    .onChange(function (value) {
      k_rain = value;
      setRain(value);
    });
  
  gui
    .add(params, "snow", 0, 1)
    .step(0.1)
    .name("Snow")
    .onChange(function (value) {
      k_snow = value;
      setSnow(value);
    });
  
  gui
    .add(params, "night", 0, 1)
    .step(1)
    .name("Night")
    .onChange(function (value) {
      isNight = Boolean(value);
      updateAstronomy(isNight);
    });

  // const slider = document.getElementById("mySlider");
  // slider.addEventListener("input", () => {
  //   //delete existing tree mesh
  //   var tree_mesh = scene.getObjectByName("tree_mesh");
  //   scene.remove(tree_mesh);

  //   var leaf_mesh = scene.getObjectByName("leaf_mesh");
  //   scene.remove(leaf_mesh);

  //   //configure new tree mesh iteration, radius, and decay factor
  //   const value = slider.value;
  //   const radius = 3 + (5 * value) / 100;
  //   const decay_factor = Math.min(0.95, 1 - 0.05 / (value / 50));
  //   const iter = Math.ceil(value / 20);
  //   const length = (10 * value) / 100;

  //   buildTree(iter, radius, decay_factor, length);
  // });
}

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);

init();
animate();