import * as THREE from "three";

// generate birds
export function generateBirds() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const numBirds = 100;
    for (let i = 0; i < numBirds; i++) {
        vertices.push(
            Math.random() * 500 - 100,
            Math.random() * 500 - 100,
            Math.random() * 500 - 100
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.9 });
    const birds = new THREE.Points(geometry, material);
    return birds;
}

export function disturb() {
    
}