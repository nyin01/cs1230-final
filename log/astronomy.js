import * as THREE from "three";

export function generateSun() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    // const texture = new THREE.TextureLoader().load('textures/sun_texture.jpg');
    const material = new THREE.MeshBasicMaterial({color: 0xffda46,  transparent: true, opacity: 0.9 });
    const sun = new THREE.Mesh(geometry, material);
    sun.position.set(100, 100, -50);
    return sun;
}

export function generateMoon() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xa5a5c2,  transparent: true, opacity: 0.9 });
    const moon = new THREE.Mesh(geometry, material);
    moon.position.set(-50, 50, -20);
    return moon;
}

export function generateStars() {
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    const numStars = 1000;
    for (let i = 0; i < numStars; i++) {
        vertices.push(
        Math.random() * 500,
        Math.random() * 500,
        Math.random() * 500
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ size: Math.random(), color: 0xffffff, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(geometry, material);
    // for each star, set a random twinkle speed
    stars.geometry.attributes.position.randomTwinkleSpeed = [];
    for (let i = 0; i < numStars; i++) {
        stars.geometry.attributes.position.randomTwinkleSpeed.push(Math.random());
    }
    return stars;
}
