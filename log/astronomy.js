import * as THREE from "three";

function generateSun() {
}

function generateMoon() {
}

function generateStars() {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    for (let i = 0; i < 100; i++) {
        vertices.push(
        Math.random() * 500 - 100,
        Math.random() * 500 - 100,
        Math.random() * 500 - 100
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ size: Math.random() * 0.5, color: 0x87CEEB, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(geometry, material);
    return stars;
}
