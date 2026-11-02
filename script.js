/* ======================================================
   ECOTECH SOLUTIONS - CLEAN COMMAND-CENTER 3D GLOBE
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 180);

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
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 100;
    controls.maxDistance = 250;

    const radius = 60;

    // 2. Solid Inner Globe & Wireframe Grid
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x020d1a });
    const coreGlobe = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), coreMat);
    scene.add(coreGlobe);

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const wireGlobe = new THREE.Mesh(new THREE.SphereGeometry(radius + 0.5, 24, 24), wireMat);
    scene.add(wireGlobe);

    // Outer Atmosphere Glow Ring
    const atmosMat = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(radius + 6, 32, 32), atmosMat);
    scene.add(atmosphere);

    // 3. Coordinate Helper (Lat/Lon to 3D Vector)
    function getPosition(lat, lon, r) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -(r * Math.sin(phi) * Math.cos(theta)),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    // 4. South African Locations & Branch Markers
    const locations = [
        { name: "Johannesburg HQ", lat: -26.2041, lon: 28.0473, color: 0x7dff70, size: 2.5 },
        { name: "Pretoria", lat: -25.7479, lon: 28.2293, color: 0x00e5ff, size: 1.8 },
        { name: "Durban", lat: -29.8587, lon: 31.0218, color: 0x00e5ff, size: 1.8 },
        { name: "Cape Town", lat: -33.9249, lon: 18.4241, color: 0x00e5ff, size: 1.8 }
    ];

    const rings = [];

    locations.forEach(loc => {
        const pos = getPosition(loc.lat, loc.lon, radius);

        // Marker Pin
        const pinGeo = new THREE.SphereGeometry(loc.size, 16, 16);
        const pinMat = new THREE.MeshBasicMaterial({ color: loc.color });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.copy(pos);
        scene.add(pin);

        // Signal Beam Line pointing outward
        const outerPos = getPosition(loc.lat, loc.lon, radius + 12);
        const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, outerPos]);
        const lineMat = new THREE.LineBasicMaterial({ color: loc.color, transparent: true, opacity: 0.8 });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);

        // Pulsing Ring Beacon
        const ringGeo = new THREE.RingGeometry(loc.size * 1.5, loc.size * 3, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: loc.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(outerPos);
        ring.lookAt(camera.position);
        scene.add(ring);
        rings.push(ring);
    });

    // Automatically rotate camera to face South Africa on load
    const saFocus = getPosition(-29, 25, 180);
    camera.position.copy(saFocus);

    // 5. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Pulsing animation for location rings
        const time = Date.now() * 0.003;
        rings.forEach((ring, index) => {
            const scale = 1 + Math.sin(time + index) * 0.4;
            ring.scale.set(scale, scale, scale);
        });

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Responsive Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
/* ======================================================
   ECOTECH SOLUTIONS - FORM INTERACTIVITY & VALIDATION
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default page reload

            // Basic validation check
            const inputs = form.querySelectorAll('input, textarea, select');
            let isValid = true;

            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4d4d'; // Red error outline
                } else {
                    input.style.borderColor = 'rgba(80, 170, 255, 0.25)';
                }
            });

            if (!isValid) {
                alert('Please fill in all required fields before submitting.');
                return;
            }

            // Create futuristic success feedback popup banner
            const existingBanner = form.querySelector('.success-banner');
            if (existingBanner) existingBanner.remove();

            const successBanner = document.createElement('div');
            successBanner.className = 'success-banner';
            successBanner.innerHTML = `
                <div style="background: rgba(10, 35, 20, 0.95); border: 1px solid #7dff70; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center; box-shadow: 0 0 20px rgba(125,255,112,0.3);">
                    <h3 style="color: #7dff70; margin-bottom: 8px; font-size: 16px;">TRANSMISSION SUCCESSFUL</h3>
                    <p style="color: #dce9ef; font-size: 13px; margin: 0;">Thank you! Your message/inquiry has been received by EcoTech Solutions. We will contact you shortly.</p>
                </div>
            `;
            
            form.appendChild(successBanner);
            form.reset(); // Clear form fields

            // Automatically remove success message after 6 seconds
            setTimeout(() => {
                successBanner.style.opacity = '0';
                setTimeout(() => successBanner.remove(), 500);
            }, 6000);
        });
    });
});