import * as THREE from "three";

export function generateRain() {
  let geometry = new THREE.BufferGeometry();
  let vertices = [];

  for (let i = 0; i < 10000; i++) {
    vertices.push(
      Math.random() * 200 - 100,
      Math.random() * 200 - 100,
      Math.random() * 200 - 100
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  let material = new THREE.PointsMaterial({ size: 0.3, color: 0xaaaaaa });

  let rain = new THREE.Points(geometry, material);
  return rain;
}

export function generateSnow() {
  let geometry = new THREE.BufferGeometry();
  let vertices = [];

  for (let i = 0; i < 10000; i++) {
    vertices.push(
      Math.random() * 200 - 100,
      Math.random() * 200 - 100,
      Math.random() * 200 - 100
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  let material = new THREE.PointsMaterial({ size: 0.3, color: 0xffffff });

  let snow = new THREE.Points(geometry, material);
  return snow;
}

export function generateWind() {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    
    for (let i = 0; i < 10000; i++) {
        vertices.push(
            Math.random() * 200 - 100,
            Math.random() * 200 - 100,
            Math.random() * 200 - 100
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    let material = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.05
    });
    
    let wind = new THREE.LineSegments(geometry, material);
    return wind;
}
