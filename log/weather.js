import * as THREE from "three";

// k [0,1]: 0: no weather, 1: heavy weather
function generateParticles(k = 0.5) {
  const numParticles = 100000;
  if (k == 0) {
    return new THREE.BufferGeometry();
  }
  let geometry = new THREE.BufferGeometry();
  let vertices = [];
  for (let i = 0; i < numParticles * k; i++) {
    // center block: majority of particles
    vertices.push(
      Math.random() * 1000 - 500,
      Math.random() * 1000 - 100,
      Math.random() * 1000 - 500
    );

    // extra particles to simulate start/end of rain/snow. ignored for now
    // if (numParticles * k % 100 == 0) {
    //   // lower block: first portion of particles falling down
    //   vertices.push(
    //     Math.random() * 1000 - 500,
    //     Math.random() * 1000 + 150,
    //     Math.random() * 1000 - 500
    //   );
    //   // upper block: last portion of particles falling down
    //   vertices.push(
    //     Math.random() * 1000 - 500,
    //     Math.random() * 1000 + 750,
    //     Math.random() * 1000 - 500
    //   );
    // }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

export function generateRain(k) {
  const geometry = generateParticles(k);
  const material = new THREE.PointsMaterial({ size: 0.2, color: 0x9fd0ff, transparent: true, opacity: 0.8 });
  const rain = new THREE.Points(geometry, material);
  return rain;
}

export function generateSnow(k) {
  const geometry = generateParticles(k);
  const material = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff, transparent: true, opacity: 0.7 });
  const snow = new THREE.Points(geometry, material);
  return snow;
}

export function generateWind(k) {
  const geometry = generateParticles(k);
  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.03});
  const wind = new THREE.LineSegments(geometry, material);
  return wind;
}

export function generateCloud(k) {
  const geometry = generateParticles(k);
  const material = new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.5 });
  const cloud = new THREE.Points(geometry, material);
  return cloud;
}