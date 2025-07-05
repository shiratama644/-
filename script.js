document.addEventListener('DOMContentLoaded', () => {
    
    // --- GLOBAL VARIABLES ---
    let particleSystem = null;
    let babylonConfig = null;
    let defaultBabylonConfig = null;
    let lenis = null; // Make lenis accessible globally

    // --- INITIALIZATION ---
    async function init() {
        try {
            startPreloaderIntro();
            await loadSettingsAndData();
            
            setupCursor();
            setupTheme();
            setupNavigation();
            setupSmoothScroll();
            setupSettingsPanel();
            
            populateData(window.portfolioData);
            
            setupSkillInteraction();
            setupScrollAnimations();
            setupContactFeatures(window.portfolioData.contact.email);
            
            waitForLoad();

        } catch (error) {
            console.error('Error initializing page:', error);
            document.body.innerHTML = `<div style="color: white; text-align: center; padding-top: 20vh; font-size: 1.5rem;">Failed to load portfolio data. Please check console for errors.</div>`;
        }
    }

    // --- SETTINGS PANEL (UPDATED FOR SCROLL LOCK) ---
    function setupSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        const openBtn = document.getElementById('settings-toggle');
        const closeBtn = document.getElementById('close-settings-btn');
        const resetBtn = document.getElementById('reset-settings-btn');

        openBtn.addEventListener('click', () => {
            panel.classList.add('active');
            if (lenis) lenis.stop(); // Stop background scroll
        });
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
            if (lenis) lenis.start(); // Resume background scroll
        });

        // The rest of the function remains the same
        const colorPicker1 = document.getElementById('color1-picker');
        const colorPicker2 = document.getElementById('color2-picker');
        colorPicker1.color = babylonConfig.color1;
        colorPicker2.color = babylonConfig.color2;
        colorPicker1.addEventListener('color-changed', e => updateSetting('color1', e.detail.value));
        colorPicker2.addEventListener('color-changed', e => updateSetting('color2', e.detail.value));
        const particleSlider = document.getElementById('particle-count-slider');
        const emitSlider = document.getElementById('emit-rate-slider');
        const particleValue = document.getElementById('particle-count-value');
        const emitValue = document.getElementById('emit-rate-value');
        noUiSlider.create(particleSlider, { start: [babylonConfig.particleCount], connect: 'lower', range: { 'min': 500, 'max': 10000 }, step: 100, });
        noUiSlider.create(emitSlider, { start: [babylonConfig.emitRate], connect: 'lower', range: { 'min': 100, 'max': 3000 }, step: 50, });
        particleSlider.noUiSlider.on('update', (values, handle) => { particleValue.textContent = parseInt(values[handle]); });
        particleSlider.noUiSlider.on('change', (values, handle) => { updateSetting('particleCount', parseInt(values[handle]), true); });
        emitSlider.noUiSlider.on('update', (values, handle) => { emitValue.textContent = parseInt(values[handle]); });
        emitSlider.noUiSlider.on('change', (values, handle) => { updateSetting('emitRate', parseInt(values[handle])); });
        resetBtn.addEventListener('click', () => { localStorage.removeItem('customBabylonSettings'); location.reload(); });
    }

    // --- SMOOTH SCROLL (UPDATED) ---
    function setupSmoothScroll() {
        lenis = new Lenis(); // Assign to global variable
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // --- All other functions remain the same ---
    // (Copy-paste the rest of the functions from the previous response here)
    function startPreloaderIntro() { const preloaderName = new SplitType('.preloader-name', { types: 'chars' }); gsap.from(preloaderName.chars, { yPercent: 100, stagger: 0.1, duration: 0.7, ease: 'power3.out' }); }
    function waitForLoad() { if (document.readyState === 'complete') { hidePreloader(); } else { window.addEventListener('load', hidePreloader); } }
    function hidePreloader() { const preloaderName = SplitType.revert('.preloader-name'); const preloaderTimeline = gsap.timeline(); preloaderTimeline.to('.preloader-name .char', { yPercent: -110, stagger: 0.05, duration: 0.5, ease: 'power3.in' }).to('#preloader', { opacity: 0, duration: 0.5, onComplete: () => { document.getElementById('preloader').style.display = 'none'; showMainContent(); } }, "-=0.2"); }
    function showMainContent() { const elementsToShow = ['#cursor-glow', '#bg-canvas', 'header', 'main', 'footer', '#settings-panel']; initBabylonJS(babylonConfig); gsap.to(elementsToShow.map(sel => document.querySelector(sel)), { opacity: 1, visibility: 'visible', duration: 0.5, stagger: 0.1, onComplete: startIntroAnimations }); }
    function startIntroAnimations() { gsap.from('header', { y: '-100%', duration: 1, ease: 'power3.out' }); const heroTitle = new SplitType('#hero-title', { types: 'words, chars' }); gsap.from(heroTitle.chars, { y: '100%', opacity: 0, stagger: 0.03, duration: 1, ease: 'power3.out', delay: 0.2 }); gsap.from(['#hero-subtitle', '.scroll-down-btn'], { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.7, stagger: 0.2 }); }
    function setupScrollAnimations() { gsap.utils.toArray('.content-section').forEach(section => { const title = section.querySelector('.section-title'); const content = section.querySelectorAll('p, .skills-container, .works-container, .email-container, .social-links'); if (title) { gsap.from(title, { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' } }); } if (content) { gsap.from(content, { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out', stagger: 0.2, scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' } }); } }); ScrollTrigger.batch(".work-item, .skill-item", { interval: 0.1, batchMax: 3, onEnter: batch => gsap.from(batch, { opacity: 0, y: 40, stagger: { each: 0.1, grid: [1, 3] }, overwrite: true }), }); }
    async function loadSettingsAndData() { const response = await fetch('setting.json'); const data = await response.json(); window.portfolioData = data; defaultBabylonConfig = { ...data.backgroundScene }; const customSettings = JSON.parse(localStorage.getItem('customBabylonSettings')); babylonConfig = { ...defaultBabylonConfig, ...customSettings }; }
    let debounceTimer; function updateSetting(key, value, debounce = false) { babylonConfig[key] = value; const customSettings = JSON.parse(localStorage.getItem('customBabylonSettings')) || {}; customSettings[key] = value; localStorage.setItem('customBabylonSettings', JSON.stringify(customSettings)); if (debounce) { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => initBabylonJS(babylonConfig), 500); } else { updateBabylonJS(); } }
    function setupTheme() { const themeToggle = document.getElementById('theme-toggle'); const themeIcon = themeToggle.querySelector('i'); const applyTheme = (theme) => { document.body.classList.toggle('light-theme', theme === 'light'); themeIcon.classList.toggle('fa-sun', theme === 'light'); themeIcon.classList.toggle('fa-moon', theme !== 'light'); updateBabylonJS(); }; const savedTheme = localStorage.getItem('theme') || 'dark'; applyTheme(savedTheme); themeToggle.addEventListener('click', () => { const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light'; localStorage.setItem('theme', newTheme); applyTheme(newTheme); }); }
    let babylonEngine = null; function initBabylonJS(config) { if (babylonEngine) babylonEngine.dispose(); const canvas = document.getElementById('bg-canvas'); babylonEngine = new BABYLON.Engine(canvas, true); const scene = createScene(config); babylonEngine.runRenderLoop(() => scene.render()); window.addEventListener('resize', () => babylonEngine.resize()); }
    function createScene(config) { const scene = new BABYLON.Scene(babylonEngine); scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 15, BABYLON.Vector3.Zero(), scene); particleSystem = new BABYLON.ParticleSystem("particles", config.particleCount, scene); particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene); const isLight = document.body.classList.contains('light-theme'); const color1 = isLight ? (config.lightThemeColor1 || config.color1) : config.color1; const color2 = isLight ? (config.lightThemeColor2 || config.color2) : config.color2; particleSystem.color1 = BABYLON.Color4.FromHexString(color1 + 'FF'); particleSystem.color2 = BABYLON.Color4.FromHexString(color2 + 'FF'); particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0); particleSystem.emitter = new BABYLON.Vector3(0, 0, 0); particleSystem.minEmitBox = new BABYLON.Vector3(-10, -10, -10); particleSystem.maxEmitBox = new BABYLON.Vector3(10, 10, 10); particleSystem.minSize = 0.05; particleSystem.maxSize = 0.2; particleSystem.minLifeTime = 2; particleSystem.maxLifeTime = 5; particleSystem.emitRate = config.emitRate; particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE; particleSystem.gravity = new BABYLON.Vector3(0, 0, 0); particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1); particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1); particleSystem.minAngularSpeed = -1; particleSystem.maxAngularSpeed = 1; particleSystem.minEmitPower = 0.5; particleSystem.maxEmitPower = 1.5; particleSystem.updateSpeed = 0.01; particleSystem.start(); window.addEventListener('scroll', () => { const scrollRatio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight); gsap.to(camera, { alpha: -Math.PI / 2 + (scrollRatio * 0.5), beta: Math.PI / 2 - (scrollRatio * 0.3), radius: 15 - (scrollRatio * 5), duration: 1, ease: 'power2.out' }); }); return scene; }
    function updateBabylonJS() { if (!particleSystem || !babylonConfig) return; const isLight = document.body.classList.contains('light-theme'); const color1Hex = isLight ? (babylonConfig.lightThemeColor1 || babylonConfig.color1) : babylonConfig.color1; const color2Hex = isLight ? (babylonConfig.lightThemeColor2 || babylonConfig.color2) : babylonConfig.color2; const color1 = new BABYLON.Color3.FromHexString(color1Hex); const color2 = new BABYLON.Color3.FromHexString(color2Hex); gsap.to(particleSystem.color1, { r: color1.r, g: color1.g, b: color1.b, duration: 0.5 }); gsap.to(particleSystem.color2, { r: color2.r, g: color2.g, b: color2.b, duration: 0.5 }); particleSystem.emitRate = babylonConfig.emitRate; }
    function setupCursor() { const cursorGlow = document.getElementById('cursor-glow'); if (window.matchMedia("(pointer: fine)").matches) { window.addEventListener('mousemove', e => { gsap.to(cursorGlow, { duration: 0.9, x: e.clientX, y: e.clientY, ease: "power3.out" }); }); } }
    function setupNavigation() { const menuToggle = document.getElementById('menu-toggle'); const navbar = document.querySelector('.navbar'); menuToggle.addEventListener('click', () => { menuToggle.classList.toggle('active'); navbar.classList.toggle('active'); }); document.querySelectorAll('.navbar a').forEach(link => { link.addEventListener('click', () => { menuToggle.classList.remove('active'); navbar.classList.remove('active'); }); }); }
    function populateData(data) { document.getElementById('site-title').textContent = `${data.name}'s Portfolio`; document.getElementById('header-icon').src = data.myIcon; document.getElementById('header-name').textContent = data.name; document.getElementById('footer-name').textContent = data.name; document.getElementById('hero-title').textContent = data.hero.title; document.getElementById('hero-subtitle').textContent = data.hero.subtitle; document.getElementById('about-title').textContent = data.about.title; document.getElementById('about-description').textContent = data.about.description; document.getElementById('skills-title').textContent = data.skills.title; const skillsList = document.getElementById('skills-list'); skillsList.innerHTML = data.skills.items.map(skill => `<div class="skill-item"><i class="${skill.icon}"></i><span>${skill.name}</span></div>`).join(''); document.getElementById('works-title').textContent = data.works.title; const worksList = document.getElementById('works-list'); worksList.innerHTML = data.works.items.map(work => `<div class="work-item"><div class="work-item-content"><h3>${work.title}</h3><p>${work.description}</p></div><a href="${work.url}" class="work-link" target="_blank" rel="noopener noreferrer">View Project <i class="fas fa-arrow-right"></i></a></div>`).join(''); document.getElementById('contact-title').textContent = data.contact.title; const socialLinks = document.getElementById('social-links'); socialLinks.innerHTML = data.contact.social.map(social => `<a href="${social.url}" target="_blank" rel="noopener noreferrer" title="${social.name}"><i class="${social.icon}"></i></a>`).join(''); }
    function setupContactFeatures(email) { const contactEmailLink = document.getElementById('contact-email'); contactEmailLink.textContent = email; contactEmailLink.href = `mailto:${email}`; const copyBtn = document.getElementById('copy-email-btn'); const successMsg = document.getElementById('copy-success-msg'); copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(email).then(() => { successMsg.classList.add('show'); setTimeout(() => successMsg.classList.remove('show'), 2000); }).catch(err => console.error('Failed to copy email: ', err)); }); }
    function setupSkillInteraction() { const skillItems = document.querySelectorAll('.skill-item'); skillItems.forEach(item => { item.addEventListener('click', () => { if (gsap.isTweening(item)) return; gsap.fromTo(item, { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' }); }); }); }

    // --- START THE APP ---
    init();
});