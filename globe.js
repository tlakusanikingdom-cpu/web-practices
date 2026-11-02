/* ======================================================
   ECOTECH SOLUTIONS - HIGH-TECH 3D HOLOGRAM GLOBE
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 30, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.minDistance = 120;
    controls.maxDistance = 300;

    const sphereRadius = 65;

    // 2. Futuristic Core & Glow Atmosphere
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x020a18,
        transparent: true,
        opacity: 0.95
    });
    const coreGlobe = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 32, 32), coreMat);
    scene.add(coreGlobe);

    // Wireframe Grid Overlay
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x004477,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireGlobe = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius + 0.2, 36, 18), wireMat);
    scene.add(wireGlobe);

    // Outer Hologram Atmosphere Halo
    const atmosphereGeo = new THREE.SphereGeometry(sphereRadius + 4, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // 3. World Continents Particle Density
    const particleCount = 2000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -(radius * Math.sin(phi) * Math.cos(theta)),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Generate procedural land dots concentrating around major continents & South Africa
    let pIdx = 0;
    for (let i = 0; i < particleCount; i++) {
        let lat = (Math.random() - 0.5) * 160;
        let lon = (Math.random() - 0.5) * 360;

        // Give extra particle density to Africa & South Africa
        if (Math.random() > 0.4) {
            lat = -35 + Math.random() * 45; // Africa Latitudes
            lon = 10 + Math.random() * 40;  // Africa Longitudes
        }

        const pos = latLonToVector3(lat, lon, sphereRadius + 0.8);
        particlePositions[pIdx++] = pos.x;
        particlePositions[pIdx++] = pos.y;
        particlePositions[pIdx++] = pos.z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x00e5ff,
        size: 1.2,
        transparent: true,
        opacity: 0.65
    });
    const landParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(landParticles);

    // 4. South African Branch Locations with Beacons & Spikes
    const saLocations = [
        { name: "JHB (HQ)", lat: -26.2041, lon: 28.0473, color: 0x7dff70, hq: true },
        { name: "Pretoria", lat: -25.7479, lon: 28.2293, color: 0x00e5ff, hq: false },
        { name: "Durban", lat: -29.8587, lon: 31.0218, color: 0x00e5ff, hq: false },
        { name: "Cape Town", lat: -33.9249, lon: 18.4241, color: 0x00e5ff, hq: false }
    ];

    const pulsingRings = [];

    saLocations.forEach(loc => {
        const pos = latLonToVector3(loc.lat, loc.lon, sphereRadius);

        // Marker Point
        const markerGeo = new THREE.SphereGeometry(loc.hq ? 2.5 : 1.8, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: loc.color });
        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.copy(pos);
        scene.add(markerMesh);

        // Vertical Holographic Light Beam Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            pos,
            pos.clone().multiplyScalar(1.15)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: loc.color, transparent: true, opacity: 0.8 });
        const beamLine = new THREE.Line(lineGeo, lineMat);
        scene.add(beamLine);

        // Pulsing Ring Effect
        const ringGeo = new THREE.RingGeometry(2, 4, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: loc.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos.clone().multiplyScalar(1.02));
        ringMesh.lookAt(0, 0, 0);
        scene.add(ringMesh);
        pulsingRings.push(ringMesh);
    });

    // Camera initial position focused on South Africa
    const saCenter = latLonToVector3(-29, 25, 200);
    camera.position.copy(saCenter);

    // 5. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate land particles slowly
        landParticles.rotation.y += 0.0005;

        // Pulse beacon rings
        const time = Date.now() * 0.003;
        pulsingRings.forEach((ring, idx) => {
            const scale = 1 + Math.sin(time + idx) * 0.3;
            ring.scale.set(scale, scale, scale);
        });

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});