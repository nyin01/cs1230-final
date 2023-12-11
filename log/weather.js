import * as THREE from "three";

// k [0,1]: 0: no weather, 1: heavy weather
function generateParticle(k=0.5) {
  if (k == 0) {
    return new THREE.BufferGeometry();
  }
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  for (let i = 0; i < 10000 * k; i++) {
    vertices.push(
      Math.random() * 500 - 100,
      Math.random() * 500 - 100,
      Math.random() * 500 - 100
    );
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

export function generateRain(k) {
  const geometry = generateParticle(k);
  const material = new THREE.PointsMaterial({ size: 0.3, color: 0xaaaaaa });
  const rain = new THREE.Points(geometry, material);
  return rain;
}

export function generateSnow(k) {
  const geometry = generateParticle(k);
  const material = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff });
  const snow = new THREE.Points(geometry, material);
  return snow;
}

export function generateWind(k) {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.05
  });
  const wind = new THREE.LineSegments(geometry, material);
  return wind;
}
