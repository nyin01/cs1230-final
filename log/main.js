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
let rain;
let snow;
let wind;

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
  buildTree(5);
  setupSlider();

  // cliff
  addCliff(2, 1.5, 10, 4, -1.25, 0); // big cliff
  addCliff(2, 4, 10, 2, -2.5, 0); // big cliff
  addConeCliff(1.3, 4, 3.7, -4, 3.8, 1);     // Triangular cliff

  // Create the floating island
  createFloatingIsland();

  setWeather();

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
        color2: { value: new THREE.Color(0xecbea0) },  // tan
        lightDirection: { value: new THREE.Vector3(-5, 5, 5).normalize() },
    }
});
  
  const dias = new THREE.Mesh(bigCubeGeometry, material);
  dias.position.set(0, -47.5, 0);
  scene.add(dias);

  const grassMaterial = new THREE.MeshToonMaterial({color: 0xe6eab5 });

  const biggrass = new THREE.Mesh(bigGrassGeometry, grassMaterial);
  biggrass.rotateX(-Math.PI * 0.5);
  
  biggrass.position.set(0, -39.9 , 0);

  scene.add(biggrass);

}

function createWaterfall() {

  // Define a waterfall, assuming it's a thin, vertical box
  const waterfallVerticalGeometry = new THREE.PlaneGeometry(20, 100);
  const waterfallHorizontalGeometry = new THREE.PlaneGeometry(20, 50);

  const waterfallMaterial = new THREE.MeshToonMaterial({ color: 0x71cbaa, side: THREE.DoubleSide });


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
        color2: { value: new THREE.Color(0x46a493) },  // tan
        lightDirection: { value: new THREE.Vector3(-5, 5, 10).normalize() },
    },
    side: THREE.DoubleSide // Render both sides
  });

  const waterfallVertical = new THREE.Mesh(waterfallVerticalGeometry, material);
  const waterfallHortizontal = new THREE.Mesh(waterfallHorizontalGeometry, waterfallMaterial);
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
  const domeGeometry = new THREE.SphereGeometry(10, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);


  // Create materials for the island
  const islandMaterial = new THREE.MeshToonMaterial({ color: 0xecbea0 });
  const grassMaterial = new THREE.MeshToonMaterial({color: 0xe6eab5 });
  
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
  grass.position.set(0, -54.91 ,0);
  
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
  mesh.rotateY(Math.PI + rotate)
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


function setSnow(k) {
  if (snow) {
    // Remove existing snow from the scene if it exists
    scene.remove(snow);
  }
  snow = generateSnow(k);
  scene.add(snow);
}

function setWeather() {
  setSnow(0.5);
}

function updateWeather(k_snow=0, k_rain=0, k_wind=0, snow_drop=0.1, rain_drop=0.5, wind_drift=0.01) {
  // y is vertical direction!

  // weather
  setSnow(k_snow);
  if (k_snow > 0) {
    // snow.position.y -= 0.1;
    // snow.rotation.x += 0.01;
  }

  // if (k_rain > 0) {
  //   setRain(k_rain);
  //   scene.add(rain);
  //   rain.position.y -= rain_drop;
  //   rain.rotation.x += wind_drift;
  // }

  // if (k_wind > 0) {
  //   setWind(k_wind);
  //   scene.add(wind);
  //   wind.position.x += wind_drift * 100;
  // }

}



// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  let k = 0.5
  setSnow(k);
  updateWeather(k,k,k)

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

function setupSlider() {
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
