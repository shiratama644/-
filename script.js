// (The top part of the script is unchanged)
document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.getElementById('cursor-dot');
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', e => { gsap.to(cursorDot, { duration: 0.2, x: e.clientX, y: e.clientY }); gsap.to(cursorGlow, { duration: 0.7, x: e.clientX, y: e.clientY }); });
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) { body.classList.add(savedTheme); if (savedTheme === 'light-theme') { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); } }
    themeToggle.addEventListener('click', () => { body.classList.toggle('light-theme'); if (body.classList.contains('light-theme')) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); localStorage.setItem('theme', 'light-theme'); } else { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); localStorage.removeItem('theme'); } });
    fetch('setting.json').then(response => response.json()).then(data => { initThreeJS(data.backgroundScene); populateData(data); initContentAnimations(); setupContactFeatures(data.contact.email); }).catch(error => { console.error('Error loading or processing settings:', error); document.body.innerHTML = `<div style="color: white; text-align: center; padding-top: 20%;"><h1>Error</h1><p>Could not load site content. Please check the console for details.</p></div>`; });
});

/**
 * Populates the page with data from the JSON file.
 * @param {object} data - The full data object from setting.json.
 */
function populateData(data) {
    // --- Icon and Name ---
    const headerIcon = document.getElementById('header-icon');
    if (data.myIcon && headerIcon) {
        headerIcon.src = data.myIcon;
        headerIcon.alt = `${data.name}'s icon`;
    } else if (headerIcon) {
        headerIcon.style.display = 'none'; // Hide if no icon is specified
    }
    document.getElementById('header-name').textContent = data.name;

    // (The rest of the data population is the same)
    document.getElementById('site-title').textContent = `${data.name}'s Portfolio`;
    document.getElementById('footer-name').textContent = data.name;
    document.getElementById('hero-title').textContent = data.hero.title;
    document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
    document.getElementById('about-title').textContent = data.about.title;
    document.getElementById('about-description').textContent = data.about.description;
    const skillsList = document.getElementById('skills-list');
    document.getElementById('skills-title').textContent = data.skills.title;
    skillsList.innerHTML = '';
    data.skills.items.forEach(skill => { const skillElement = document.createElement('div'); skillElement.className = 'skill-item'; skillElement.innerHTML = `<i class="${skill.icon}"></i><span>${skill.name}</span>`; skillsList.appendChild(skillElement); });
    const worksList = document.getElementById('works-list');
    document.getElementById('works-title').textContent = data.works.title;
    worksList.innerHTML = '';
    data.works.items.forEach(work => { const workElement = document.createElement('div'); workElement.className = 'work-item'; workElement.innerHTML = `<h3>${work.title}</h3><p>${work.description}</p><a href="${work.url}" class="work-link" target="_blank">View Project <i class="fas fa-arrow-right"></i></a>`; worksList.appendChild(workElement); });
    document.getElementById('contact-title').textContent = data.contact.title;
    const socialLinks = document.getElementById('social-links');
    socialLinks.innerHTML = '';
    data.contact.social.forEach(social => { const socialLink = document.createElement('a'); socialLink.href = social.url; socialLink.target = '_blank'; socialLink.title = social.name; socialLink.innerHTML = `<i class="${social.icon}"></i>`; socialLinks.appendChild(socialLink); });
}

// (initThreeJS, setupContactFeatures, and initContentAnimations functions are unchanged from the previous, corrected version)
function initThreeJS(config) { if (!config) { console.error("backgroundScene configuration is missing in setting.json"); return; } const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000); const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg-canvas'), alpha: true }); renderer.setPixelRatio(window.devicePixelRatio); renderer.setSize(window.innerWidth, window.innerHeight); camera.position.z = 10; const orbitingObjects = []; const starVertices = []; for (let i = 0; i < (config.starCount || 5000); i++) { starVertices.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000); } const starGeometry = new THREE.BufferGeometry(); starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3)); const starMaterial = new THREE.PointsMaterial({ color: 0x555555, size: 0.7 }); const stars = new THREE.Points(starGeometry, starMaterial); scene.add(stars); const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); scene.add(ambientLight); const lightConfig = config.light || { color: "#FFFFFF", intensity: 1 }; const pointLight = new THREE.PointLight(new THREE.Color(lightConfig.color), lightConfig.intensity, 100); pointLight.position.set(0, 0, 5); scene.add(pointLight); if (config.objects && Array.isArray(config.objects)) { config.objects.forEach(objConfig => { let geometry; switch (objConfig.shape) { case 'Torus': geometry = new THREE.TorusGeometry(objConfig.size, objConfig.size * 0.4, 16, 100); break; case 'Sphere': geometry = new THREE.SphereGeometry(objConfig.size, 32, 32); break; case 'Box': geometry = new THREE.BoxGeometry(objConfig.size, objConfig.size, objConfig.size); break; default: geometry = new THREE.IcosahedronGeometry(objConfig.size, 1); break; } const pivot = new THREE.Object3D(); let mainObject; const style = objConfig.style || { type: 'solid', color: '#FFFFFF' }; switch (style.type) { case 'solid': const solidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.color), roughness: 0.5, metalness: 0.5 }); mainObject = new THREE.Mesh(geometry, solidMat); break; case 'wireframe': const wireMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(style.wireframeColor || style.color), wireframe: true }); mainObject = new THREE.Mesh(geometry, wireMat); break; case 'dual': const group = new THREE.Object3D(); const solidPart = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: new THREE.Color(style.color), roughness: 0.5, metalness: 0.5 })); const wirePart = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color(style.wireframeColor), wireframe: true })); wirePart.scale.setScalar(1.01); group.add(solidPart); group.add(wirePart); mainObject = group; break; default: const fallbackMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.color || '#FFFFFF'), roughness: 0.5, metalness: 0.5 }); mainObject = new THREE.Mesh(geometry, fallbackMat); break; } mainObject.position.x = objConfig.distance; pivot.add(mainObject); pivot.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0); scene.add(pivot); orbitingObjects.push({ pivot, speed: objConfig.speed, mesh: mainObject }); }); } const mouse = new THREE.Vector2(); document.addEventListener('mousemove', (event) => { mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; }); const clock = new THREE.Clock(); function animate() { requestAnimationFrame(animate); const elapsedTime = clock.getElapsedTime(); orbitingObjects.forEach(obj => { obj.pivot.rotation.y += obj.speed; obj.mesh.rotation.x += 0.01; obj.mesh.rotation.y += 0.01; }); const lightTargetX = mouse.x * 10; const lightTargetY = mouse.y * 10; pointLight.position.x += (lightTargetX - pointLight.position.x) * 0.05; pointLight.position.y += (lightTargetY - pointLight.position.y) * 0.05; camera.lookAt(scene.position); renderer.render(scene, camera); } animate(); window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); }); }
function setupContactFeatures(email) { const contactEmailLink = document.getElementById('contact-email'); contactEmailLink.textContent = email; contactEmailLink.href = `mailto:${email}`; const copyBtn = document.getElementById('copy-email-btn'); const successMsg = document.getElementById('copy-success-msg'); copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(email).then(() => { successMsg.classList.add('show'); setTimeout(() => { successMsg.classList.remove('show'); }, 2000); }).catch(err => { console.error('Failed to copy email: ', err); }); }); }
function initContentAnimations() { gsap.registerPlugin(ScrollTrigger); gsap.from('header', { y: '-100%', duration: 0.8, ease: 'power3.out', delay: 0.5 }); gsap.from('.hero-content > *', { y: 30, opacity: 0, stagger: 0.2, duration: 1, ease: 'power3.out', delay: 1 }); gsap.utils.toArray('.content-section').forEach(section => { gsap.to(section, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' } }); }); ScrollTrigger.batch(".skill-item, .work-item", { interval: 0.1, batchMax: 3, onEnter: batch => gsap.from(batch, { opacity: 0, y: 40, stagger: { each: 0.15, grid: [1, 3] }, overwrite: true }), }); }