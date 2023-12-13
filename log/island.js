import * as THREE from "three";


// function to create dias that will hold the tree
export function createDias() {

  var bigCubeGeometry = new THREE.BoxGeometry(50, 15, 50);

  const material = shader(new THREE.Color(0xecbea0), new THREE.Color(0x4c3649), 20, -27.5, 20);
  
  const dias = new THREE.Mesh(bigCubeGeometry, material);
  dias.receiveShadow = true;
  dias.castShadow = true;
  dias.position.set(0, -47.5, 0);
  
  return dias;
}

export function createDiasGrass() {
  
  const bigGrassGeometry = new THREE.PlaneGeometry(50, 50);

  const grassMaterial = shader(new THREE.Color(0xe6eab5), new THREE.Color(0x8baa92), 20, -10, 20);
  //new THREE.MeshLambertMaterial({color: 0xe6eab5 });
  

  const biggrass = new THREE.Mesh(bigGrassGeometry, grassMaterial);
  biggrass.rotateX(-Math.PI * 0.5);
  biggrass.receiveShadow = true;
  biggrass.castShadow = true;
  
  biggrass.position.set(0, -39.6 , 0);

  return biggrass;
}

export function shader(lowColor, highColor, x, y, z) {

  const uniforms = {
    _ColorLow: { value: lowColor },
    _ColorHigh: { value: highColor },
    _yPosLow: { value: 0.01 },
    _yPosHigh: { value: 50.0 },
    _GradientStrength: { value: 1.0 },
    _ColorX: { value: new THREE.Color(1, 1, 1) },
    _ColorY: { value: new THREE.Color(1, 1, 1) },
    lightDirection: { value: new THREE.Vector3(10 + x, 10 + y, 10 + z).normalize() },
    cameraPosition: { value:  new THREE.Vector3(50 + x, y, 50 + z) }, // Camera position for edge detection

  };
  
  const vertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;

  const fragmentShader = `
  uniform vec3 _ColorLow;
  uniform vec3 _ColorHigh;
  uniform float _yPosLow;
  uniform float _yPosHigh;
  uniform float _GradientStrength;
  uniform float _EmissiveStrength;
  uniform vec3 _ColorX;
  uniform vec3 _ColorY;
  uniform vec3 lightDirection;
  // uniform vec3 cameraPosition;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;


  void main() {

    float lightIntensity = max(dot(normalize(vWorldPosition), lightDirection), 0.0);

    float gradientFactor = smoothstep(_yPosLow, _yPosHigh, vWorldPosition.y);
    vec3 gradient = mix(_ColorLow, _ColorHigh, gradientFactor);
    vec3 pastelGradient = mix(vec3(1.0, 1.0, 1.0), gradient, 0.7); // Adjust the mix factor for pastel effect

    vec3 litGradient = mix(pastelGradient * 0.8, gradient, lightIntensity);

    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float edgeFactor = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 5.0); // Change the exponent for more/less sensitivity
    vec3 finalColor = mix(litGradient, litGradient * 0.8, edgeFactor); // Darken the color at edges


    // Ensure final color doesn't exceed 1.0
    finalColor = clamp(finalColor, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide // Render both sides
  });

  return material;

}


export function createWaterfallVertical() {

  const waterfallVerticalGeometry = new THREE.PlaneGeometry(20, 100);

  const material = shader(new THREE.Color(0xabddbc), new THREE.Color(0x3a9c88), 20, -84.7, 120.1);
  material.reflectivity = 1;
  
  const waterfallVertical = new THREE.Mesh(waterfallVerticalGeometry, material);
  waterfallVertical.receiveShadow = true;
  waterfallVertical.castShadow = true;

  waterfallVertical.position.set(10, -103, 101);

  return waterfallVertical;
}

export function createWaterfallHorizontal() {

  // Define a waterfall, assuming it's a thin, vertical box
  const waterfallHorizontalGeometry = new THREE.PlaneGeometry(20, 80);

  const material = shader(new THREE.Color(0xabddbc), new THREE.Color(0x3a9c88), 20, -34.81, 80);
  // const material = new THREE.MeshPhongMaterial(new THREE.Color(0xabddbc))

  const waterfallHortizontal = new THREE.Mesh(waterfallHorizontalGeometry, material);
  waterfallHortizontal.rotateX(-Math.PI * 0.5);
  waterfallHortizontal.position.set(10, -54.1, 60);

  return waterfallHortizontal;
}

// Function to create a floating island
export function createFloatingIsland() {
  // Create geometries for the island
  // Define the main island platform
  const islandGeometry = new THREE.BoxGeometry(200, 40, 200);

  // Create materials for the island
  const islandMaterial = shader(new THREE.Color(0xecbea0), new THREE.Color(0xDEB887), 20, -40, 20);
  
  // Combine geometries and materials for the island
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  island.receiveShadow = true;
  island.castShadow = true;

  island.position.set(0, -75, 0);

  return island;
}

export function createFloatingIslandGrass() {

  const grassGeometry = new THREE.PlaneGeometry(200, 200);
  const grassMaterial = shader(new THREE.Color(0xe6eab5), new THREE.Color(0x8baa92), 20, -30, 20);
  // new THREE.MeshLambertMaterial({color: 0xe6eab5 });
  
  const grass = new THREE.Mesh(grassGeometry, grassMaterial);
  grass.rotateX(-Math.PI * 0.5);

  grass.receiveShadow = true;
  grass.castShadow = true;

  grass.position.set(0, -54.5 ,0);
  
  return grass;
}


export const addCliff = (width, height, depth, x, y, z, color1, color2) => {
  const cliffGeometry = new THREE.BoxGeometry(width, height, depth);
  const cliffMaterial = shader(new THREE.Color(color1), new THREE.Color(color2), x, y, z);
  const cliff = new THREE.Mesh(cliffGeometry, cliffMaterial);
  cliff.position.set(x, y, z);
  return cliff;
};

export const addConeCliff = (radius, height, x, y, z, rotateX, rotateY, color1, color2) => {
  const geometry = new THREE.ConeGeometry(radius, height, 4);
  const material = shader(new THREE.Color(color1), new THREE.Color(color2), x, y, z);
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotateX(rotateX);
  mesh.rotateY(rotateY);
  return mesh;
};

export const addStone = (x, y, z, radius) => {
  const geometry = new THREE.SphereGeometry(radius, 6, 5);
  const material = shader(new THREE.Color(0xecbea0), new THREE.Color(0xDEB887), x, y, z);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return mesh;
}

export const addLineHorizontal = (x, y, z1, z2, z3, thickness=20) => {
  const material = new THREE.LineBasicMaterial({ color: 0xE0FFFF, linewidth: thickness, transparent: true, opacity: 0.9 });
  const points = [];
  points.push(new THREE.Vector3(x, y, z1));
  points.push(new THREE.Vector3(x, y, z2));
  points.push(new THREE.Vector3(x, y, z3));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  

  return line;
}

export const addLineHVertical = (x, y1, y2, y3, z, thickness=20) => {
  const material = new THREE.LineBasicMaterial({ color: 0xE0FFFF, linewidth: thickness , transparent: true, opacity: 0.7 });
  const points = [];
  points.push(new THREE.Vector3(x, y1, z));
  points.push(new THREE.Vector3(x, y2, z));
  points.push(new THREE.Vector3(x, y3, z));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);  

  return line;
}
