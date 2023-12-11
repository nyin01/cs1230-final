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
  
  biggrass.position.set(0, -39.9 , 0);

  return biggrass;
}

function shader(lowColor, highColor, x, y, z) {

  const uniforms = {
    _ColorLow: { value: lowColor },
    _ColorHigh: { value: highColor },
    _yPosLow: { value: 0.01 },
    _yPosHigh: { value: 0.1 },
    _GradientStrength: { value: 1.0 },
    _ColorX: { value: new THREE.Color(1, 1, 1) },
    _ColorY: { value: new THREE.Color(1, 1, 1) },
    lightDirection: { value: new THREE.Vector3(10 + x, 10 + y, 10 + z).normalize() },
  };
  
  const vertexShader = `
  varying vec3 vWorldPosition;

  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
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


  varying vec3 vWorldPosition;

  void main() {

    float lightIntensity = max(dot(normalize(vWorldPosition), lightDirection), 0.0);

    float gradientFactor = smoothstep(_yPosLow, _yPosHigh, vWorldPosition.y);
    vec3 gradient = mix(_ColorLow, _ColorHigh, gradientFactor);
    vec3 pastelGradient = mix(vec3(1.0, 1.0, 1.0), gradient, 0.7); // Adjust the mix factor for pastel effect

    vec3 litGradient = mix(pastelGradient * 0.8, gradient, lightIntensity);

    vec3 finalColor = litGradient;

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

  const material = shader( new THREE.Color(0xabddbc),  new THREE.Color(0x3a9c88), 20, -84.7, 120.1);
  
  const waterfallVertical = new THREE.Mesh(waterfallVerticalGeometry, material);
  waterfallVertical.receiveShadow = true;
  waterfallVertical.castShadow = true;

  waterfallVertical.position.set(10, -104.7, 100.1);

  return waterfallVertical;
}

export function createWaterfallHorizontal() {

  // Define a waterfall, assuming it's a thin, vertical box
  const waterfallHorizontalGeometry = new THREE.PlaneGeometry(20, 80);

  const material = shader( new THREE.Color(0xabddbc),  new THREE.Color(0x3a9c88), 20, -34.81, 80);

  const waterfallHortizontal = new THREE.Mesh(waterfallHorizontalGeometry, material);
  waterfallHortizontal.rotateX(-Math.PI * 0.5);
  waterfallHortizontal.position.set(10, -54.81, 60);

  return waterfallHortizontal;
}

// Function to create a floating island
export function createFloatingIsland() {
  // Create geometries for the island
  // Define the main island platform
  const islandGeometry = new THREE.BoxGeometry(200, 10, 200);

  // Create materials for the island
  const islandMaterial = shader(new THREE.Color(0xecbea0), new THREE.Color(0x4c3649), 20, -40, 20);
  
  // Combine geometries and materials for the island
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  island.receiveShadow = true;
  island.castShadow = true;

  island.position.set(0, -60, 0);

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

  grass.position.set(0, -54.91 ,0);
  
  return grass;
}

export function createBase() {

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


  addCliff(2, 1.5, 10, 4, -1.25, 0); // big cliff
  addCliff(2, 4, 10, 2, -2.5, 0); // big cliff
  addConeCliff(1.3, 4, 3.7, -4, 3.8, 1);     // Triangular cliff
}

