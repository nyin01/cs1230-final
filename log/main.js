import "./style.css";
// import { setupCounter } from './counter.js'

import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { generate } from "./l_util";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { generateRain, generateSnow, generateWind } from "./weather.js";
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

function init() {
  // Scene
  container = document.querySelector("#app");
  scene = new THREE.Scene();
  scene.background = new THREE.Color("lightblue");

  // basics
  setupCamera();
  setupLights();
  setupRenderer();
  setupSkyBox();
  setupControl();

  // tree
  buildTree(iteration, growth);
  setupSlider();

  // cliff
  addCliff(2, 1.5, 10, 4, -1.25, 0); // big cliff
  addCliff(2, 4, 10, 2, -2.5, 0); // big cliff
  addConeCliff(1.3, 4, 3.7, -4, 3.8, 1); // Triangular cliff

  // Create the floating island
  createFloatingIsland();

  setWeather();
  setAstronomy();
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
  camera.position.set(0, 20, 250);
}

function setupRenderer() {
  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
  document.body.appendChild(renderer.domElement);
}

function setupLights() {
  // Add lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  directionalLight.position.set(-5, 5, 5);
  ambientLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  scene.add(ambientLight);
}

// function to create dias that will hold the tree
function createDias() {
  // const building = createDias(0xfedcc1, 0x5e6679, 2, 3, 2, 0.8);

  var bigCubeGeometry = new THREE.BoxGeometry(50, 15, 50);
  const bigGrassGeometry = new THREE.PlaneGeometry(50, 50);
  var smallCubeGeometry = new THREE.BoxGeometry(30, 7, 30);
  const smallGrassGeometry = new THREE.PlaneGeometry(30, 30);

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
      color2: { value: new THREE.Color(0xecbea0) }, // tan
      lightDirection: { value: new THREE.Vector3(-5, 5, 5).normalize() },
    },
  });

  const dias = new THREE.Mesh(bigCubeGeometry, material);
  dias.position.set(0, -47.5, 0);
  scene.add(dias);

  const grassMaterial = new THREE.MeshToonMaterial({ color: 0xe6eab5 });

  const biggrass = new THREE.Mesh(bigGrassGeometry, grassMaterial);
  biggrass.rotateX(-Math.PI * 0.5);

  biggrass.position.set(0, -39.9, 0);

  scene.add(biggrass);
}

function createWaterfall() {
  // Define a waterfall, assuming it's a thin, vertical box
  const waterfallVerticalGeometry = new THREE.PlaneGeometry(20, 100);
  const waterfallHorizontalGeometry = new THREE.PlaneGeometry(20, 50);

  const waterfallMaterial = new THREE.MeshToonMaterial({
    color: 0x71cbaa,
    side: THREE.DoubleSide,
  });

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
          float quantizedIntensity = floor(lightIntensity * 6.0) / 3.0;

          // Gradient mix
          float mixRatio = clamp((vPosition.y + 10.0), 0.0, 1.0);
          vec3 gradient = mix(color2, color1, mixRatio);

          // Apply quantized lighting
          vec3 toonShadedColor = gradient * quantizedIntensity;

          gl_FragColor = vec4(toonShadedColor, 1.0);
      }
    `,
    uniforms: {
      color1: { value: new THREE.Color(0x71cbaa) }, //light peach
      color2: { value: new THREE.Color(0x46a493) }, // tan
      lightDirection: { value: new THREE.Vector3(-5, 5, 10).normalize() },
    },
    side: THREE.DoubleSide, // Render both sides
  });

  const waterfallVertical = new THREE.Mesh(waterfallVerticalGeometry, material);
  const waterfallHortizontal = new THREE.Mesh(
    waterfallHorizontalGeometry,
    waterfallMaterial
  );
  waterfallHortizontal.rotateX(-Math.PI * 0.5);

  waterfallVertical.position.set(10, -104.7, 75.1);
  waterfallHortizontal.position.set(10, -54.81, 50);

  scene.add(waterfallVertical);
  scene.add(waterfallHortizontal);
}

// Function to create a floating island
function createFloatingIsland() {
  // Create geometries for the island
  // Define the main island platform
  const islandGeometry = new THREE.BoxGeometry(200, 10, 150);

  const grassGeometry = new THREE.PlaneGeometry(200, 150);

  // // Define a tower, assuming it's a cylinder
  const towerGeometry = new THREE.CylinderGeometry(7.5, 7.5, 50, 32);

  // // For the domed roofs, we could use a half-sphere geometry
  const domeGeometry = new THREE.SphereGeometry(
    10,
    32,
    32,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );

  // Create materials for the island
  const islandMaterial = new THREE.MeshToonMaterial({ color: 0xecbea0 });
  const grassMaterial = new THREE.MeshToonMaterial({ color: 0xe6eab5 });

  // tan: 0xfedcc1, blue: 0x5e6679
  const towerMaterial = new THREE.MeshToonMaterial({ color: 0xfedcc1 });
  const domeMaterial = new THREE.MeshToonMaterial({ color: 0xe6eab5 });

  // Combine geometries and materials for the island
  const island = new THREE.Mesh(islandGeometry, islandMaterial);

  const grass = new THREE.Mesh(grassGeometry, grassMaterial);
  grass.rotateX(-Math.PI * 0.5);

  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);

  island.position.set(0, -60, 0);
  grass.position.set(0, -54.91, 0);

  tower.position.set(3, 4, 3);
  dome.position.set(-2, 3, -2);

  // Add objects to the scene
  scene.add(island);
  scene.add(grass);
  createWaterfall();
  createDias();
  // scene.add(tower);
  // scene.add(dome);
}

const addCliff = (width, height, depth, x, y, z) => {
  const cliffGeometry = new THREE.BoxGeometry(width, height, depth);
  const cliffMaterial = new THREE.MeshLambertMaterial({ color: 0xecbea0 });
  const cliff = new THREE.Mesh(cliffGeometry, cliffMaterial);
  cliff.position.set(x, y, z);
  scene.add(cliff);
};

const addConeCliff = (radius, height, x, y, z, rotate) => {
  const geometry = new THREE.ConeGeometry(radius, height, 4); // 4-sided cone for a triangular base
  const material = new THREE.MeshLambertMaterial({ color: 0xecbea0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotateX(-Math.PI);
  mesh.rotateY(Math.PI + rotate);
  scene.add(mesh);
};

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

function animateWeather(k_snow=0, k_rain=0, k_wind=0, snow_drop=0.01, rain_drop=0.5, wind_drift=0.1) {
  // y is vertical direction!

  // weather
  if (k_snow > 0) {
    snow.position.y -= 0.5 * (k_snow * (2 - k_snow));
    snow.position.x += wind_drift * k_wind;
  }

  if (k_rain > 0) {
    rain.position.y -= 0.75 * (k_rain * (2 - k_rain) + 1); // rain drops faster than snow
    rain.position.x += wind_drift * k_wind * 2;
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
  // make sun and moon orbit around the scene
  const time = Date.now() * 0.0001;
  const radius = 100;
  const sunX = Math.cos(time) * radius;
  const sunY = Math.sin(time) * radius;
  const sunZ = Math.sin(time) * radius;
  const moonX = Math.cos(time + Math.PI) * radius;
  const moonY = Math.sin(time + Math.PI) * radius;
  const moonZ = Math.sin(time + Math.PI) * radius;
  sun.position.set(sunX, sunY, sunZ);
  moon.position.set(moonX, moonY, moonZ);
  stars.position.set(moonX, moonY, moonZ);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  animateWeather(k_snow, k_rain, k_wind, snow_drop, rain_drop, wind_drift);
  animateAstronomy();
  controls.update();
  renderer.render(scene, camera);
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

