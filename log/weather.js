import * as THREE from "three";

// k [0,1]: 0: no weather, 1: heavy weather
function generateParticles(k=0.5) {
  if (k == 0) {
    return new THREE.BufferGeometry();
  }
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  for (let i = 0; i < 100000 * k; i++) {
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
  const geometry = generateParticles(k);
  const material = new THREE.PointsMaterial({ size: 0.2, color: 0x87CEEB, transparent: true, opacity: 0.5 });
  const rain = new THREE.Points(geometry, material);
  return rain;
}

export function generateSnow(k) {
  const geometry = generateParticles(k);
  const material = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff, transparent: true, opacity: 0.8 });
  const snow = new THREE.Points(geometry, material);
  return snow;
}

export function generateWind(k) {
  const geometry = generateParticles(k);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.03});
  const wind = new THREE.LineSegments(geometry, material);
  return wind;
}
