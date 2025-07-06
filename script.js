document.addEventListener('DOMContentLoaded', () => {
    
    // --- GLOBAL VARIABLES ---
    let particleSystem = null;
    let babylonConfig = null;
    let defaultBabylonConfig = null;
    let lenis = null;
    // Store data globally for easy access
    window.portfolioData = {};
    window.projectDetails = {};

    // --- INITIALIZATION ---
    async function init() {
        try {
            startPreloaderAnimation();
            await loadSettingsAndData();
            
            setupTheme();
            setupNavigation();
            setupSmoothScroll();
            setupSettingsPanel();
            
            populateData(window.portfolioData);
            
            setupSkillInteraction();
            setupScrollAnimations();
            setupContactFeatures(window.portfolioData.contact.email);
            setupWorksModal();
            
            managePreloaderHiding();

        } catch (error) {
            console.error('Error initializing page:', error);
            document.body.innerHTML = `<div style="color: white; text-align: center; padding-top: 20vh; font-size: 1.5rem;">Failed to load portfolio data. Please check console for errors.</div>`;
        }
    }

    // === NEW FILE LOGIC: Load both JSON files in parallel ===
    async function loadSettingsAndData() {
        try {
            const [mainResponse, projectsResponse] = await Promise.all([
                fetch('setting.json'),
                fetch('projects.json')
            ]);

            const [mainData, projectsData] = await Promise.all([
                mainResponse.json(),
                projectsResponse.json()
            ]);

            window.portfolioData = mainData;
            window.projectDetails = projectsData;
            
            defaultBabylonConfig = { ...mainData.backgroundScene };
            const customSettings = JSON.parse(localStorage.getItem('customBabylonSettings'));
            babylonConfig = { ...defaultBabylonConfig, ...customSettings };

        } catch (error) {
            console.error("Failed to load settings files:", error);
            throw error; // Propagate error to stop initialization
        }
    }

    // --- WORKS MODAL (UPDATED) ---
    function setupWorksModal() {
        const worksContainer = document.getElementById('works-list');
        const modalOverlay = document.getElementById('modal-overlay');
        const modalWindow = document.getElementById('modal-window');
        const closeBtn = document.getElementById('modal-close-btn');

        const modal = {
            title: document.getElementById('modal-title'),
            image: document.getElementById('modal-image'),
            description: document.getElementById('modal-description'),
            tags: document.getElementById('modal-tags'),
            link: document.getElementById('modal-link')
        };

        const openModal = (projectId) => {
            const projectBase = window.portfolioData.works.items.find(p => p.id === projectId);
            const projectDetail = window.projectDetails[projectId];

            if (!projectBase || !projectDetail) {
                console.error(`Data for project ID "${projectId}" not found.`);
                return;
            }

            modal.title.textContent = projectBase.title;
            modal.link.href = projectBase.url;
            modal.image.src = projectDetail.modalImage;
            modal.description.textContent = projectDetail.modalDescription;
            modal.tags.innerHTML = projectDetail.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('');
            
            if (lenis) lenis.stop();
            gsap.timeline()
                .set(modalOverlay, { autoAlpha: 1 })
                .fromTo(modalWindow, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
        };

        const closeModal = () => {
            gsap.timeline({ onComplete: () => { if (lenis) lenis.start(); } })
                .to(modalWindow, { autoAlpha: 0, scale: 0.95, duration: 0.3, ease: 'power3.in' })
                .set(modalOverlay, { autoAlpha: 0 });
        };

        worksContainer.addEventListener('click', (e) => {
            if (e.target.closest('.work-link')) {
                return;
            }
            const workItem = e.target.closest('.work-item');
            if (!workItem) return;
            
            const projectId = workItem.dataset.id;
            if (projectId) {
                openModal(projectId);
            }
        });

        closeBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // --- DATA POPULATION (UPDATED) ---
    function populateData(data) {
        document.getElementById('site-title').textContent = `${data.name}'s Portfolio`;
        document.getElementById('header-icon').src = data.myIcon;
        document.getElementById('header-name').textContent = data.name;
        document.getElementById('footer-name').textContent = data.name;
        document.getElementById('hero-title').textContent = data.hero.title;
        document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
        document.getElementById('about-title').textContent = data.about.title;
        document.getElementById('about-description').textContent = data.about.description;
        document.getElementById('skills-title').textContent = data.skills.title;
        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = data.skills.items.map(skill => `<div class="skill-item"><i class="${skill.icon}"></i><span>${skill.name}</span></div>`).join('');
        
        document.getElementById('works-title').textContent = data.works.title;
        const worksList = document.getElementById('works-list');
        worksList.innerHTML = data.works.items.map(work => `
            <div class="work-item" data-id="${work.id}">
                <div class="work-item-content">
                    <h3>${work.title}</h3>
                    <p>${work.description}</p>
                </div>
                <a href="${work.url}" class="work-link" target="_blank" rel="noopener noreferrer">
                    View Project <i class="fas fa-arrow-right"></i>
                </a>
            </div>`).join('');
            
        document.getElementById('contact-title').textContent = data.contact.title;
        const socialLinks = document.getElementById('social-links');
        socialLinks.innerHTML = data.contact.social.map(social => `<a href="${social.url}" target="_blank" rel="noopener noreferrer" title="${social.name}"><i class="${social.icon}"></i></a>`).join('');
    }

    // --- All other functions remain the same ---
    function startPreloaderAnimation() { const preloaderName = new SplitType('.preloader-name', { types: 'chars' }); gsap.timeline().from(preloaderName.chars, { yPercent: 100, stagger: 0.1, duration: 0.7, ease: 'power3.out', onComplete: () => { gsap.to(preloaderName.chars, { y: -5, scale: 1.03, duration: 1.5, stagger: { each: 0.1, from: "center", yoyo: true, repeat: -1 }, ease: 'sine.inOut' }); } }); }
    function managePreloaderHiding() { const minDisplayTime = 1500; const loadPromise = new Promise(resolve => { if (document.readyState === 'complete') { resolve(); } else { window.addEventListener('load', resolve, { once: true }); } }); const timePromise = new Promise(resolve => setTimeout(resolve, minDisplayTime)); Promise.all([loadPromise, timePromise]).then(hidePreloader); }
    function hidePreloader() { const chars = document.querySelectorAll('.preloader-name .char'); gsap.killTweensOf(chars); gsap.timeline().to(chars, { yPercent: -110, stagger: { each: 0.05, from: "start" }, duration: 0.5, ease: 'power3.in' }).to('#preloader', { opacity: 0, duration: 0.5, onComplete: () => { document.getElementById('preloader').style.display = 'none'; startIntroAnimations(); } }, "-=0.2"); }
    function startIntroAnimations() { initBabylonJS(babylonConfig); const introTl = gsap.timeline(); introTl.to(['#cursor-glow', '#bg-canvas'], { autoAlpha: 1, duration: 0.5 }); introTl.fromTo('header', { y: '-100%' }, { y: '0%', autoAlpha: 1, duration: 1, ease: 'power3.out' }, "-=0.2"); const heroTitle = new SplitType('#hero-title', { types: 'words, chars' }); introTl.from(heroTitle.chars, { y: '100%', autoAlpha: 0, stagger: 0.03, duration: 1, ease: 'power3.out', onComplete: () => { gsap.set('#hero-title', { clearProps: 'color' }); } }, "-=0.8"); introTl.from(['#hero-subtitle', '.scroll-down-btn'], { autoAlpha: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.2 }, "-=0.8"); introTl.to(['footer', '#settings-panel'], { autoAlpha: 1, duration: 0.5 }, "<"); gsap.to('main', { autoAlpha: 1, duration: 0.01 }); }
    function setupScrollAnimations() { gsap.utils.toArray('.content-section').forEach(section => { const title = section.querySelector('.section-title'); const content = section.querySelectorAll('p, .skills-container, .works-container, .email-container, .social-links'); if (title) { gsap.from(title, { autoAlpha: 0, y: 50, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' } }); } if (content) { gsap.from(content, { autoAlpha: 0, y: 50, duration: 0.8, ease: 'power3.out', stagger: 0.2, scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none none' } }); } }); ScrollTrigger.batch(".work-item, .skill-item", { interval: 0.1, batchMax: 3, onEnter: batch => gsap.from(batch, { autoAlpha: 0, y: 40, stagger: { each: 0.1, grid: [1, 3] }, overwrite: true }), }); }
    function setupSettingsPanel() { const panel = document.getElementById('settings-panel'); const openBtn = document.getElementById('settings-toggle'); const closeBtn = document.getElementById('close-settings-btn'); const resetBtn = document.getElementById('reset-settings-btn'); openBtn.addEventListener('click', () => { panel.classList.add('active'); if (lenis) lenis.stop(); }); closeBtn.addEventListener('click', () => { panel.classList.remove('active'); if (lenis) lenis.start(); }); const colorPicker1 = document.getElementById('color1-picker'); const colorPicker2 = document.getElementById('color2-picker'); colorPicker1.color = babylonConfig.color1; colorPicker2.color = babylonConfig.color2; colorPicker1.addEventListener('color-changed', e => updateSetting('color1', e.detail.value)); colorPicker2.addEventListener('color-changed', e => updateSetting('color2', e.detail.value)); const particleSlider = document.getElementById('particle-count-slider'); const emitSlider = document.getElementById('emit-rate-slider'); const particleValue = document.getElementById('particle-count-value'); const emitValue = document.getElementById('emit-rate-value'); noUiSlider.create(particleSlider, { start: [babylonConfig.particleCount], connect: 'lower', range: { 'min': 500, 'max': 10000 }, step: 100, }); noUiSlider.create(emitSlider, { start: [babylonConfig.emitRate], connect: 'lower', range: { 'min': 100, 'max': 3000 }, step: 50, }); particleSlider.noUiSlider.on('update', (values, handle) => { particleValue.textContent = parseInt(values[handle]); }); particleSlider.noUiSlider.on('change', (values, handle) => { updateSetting('particleCount', parseInt(values[handle]), true); }); emitSlider.noUiSlider.on('update', (values, handle) => { emitValue.textContent = parseInt(values[handle]); }); emitSlider.noUiSlider.on('change', (values, handle) => { updateSetting('emitRate', parseInt(values[handle])); }); resetBtn.addEventListener('click', () => { localStorage.removeItem('customBabylonSettings'); location.reload(); }); }
    let debounceTimer; function updateSetting(key, value, debounce = false) { babylonConfig[key] = value; const customSettings = JSON.parse(localStorage.getItem('customBabylonSettings')) || {}; customSettings[key] = value; localStorage.setItem('customBabylonSettings', JSON.stringify(customSettings)); if (debounce) { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => initBabylonJS(babylonConfig), 500); } else { updateBabylonJS(); } }
    function setupTheme() { const themeToggle = document.getElementById('theme-toggle'); const themeIcon = themeToggle.querySelector('i'); const applyTheme = (theme) => { document.body.classList.toggle('light-theme', theme === 'light'); themeIcon.classList.toggle('fa-sun', theme === 'light'); themeIcon.classList.toggle('fa-moon', theme !== 'light'); updateBabylonJS(); }; const savedTheme = localStorage.getItem('theme') || 'dark'; applyTheme(savedTheme); themeToggle.addEventListener('click', () => { const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light'; localStorage.setItem('theme', newTheme); applyTheme(newTheme); }); }
    let babylonEngine = null; function initBabylonJS(config) { if (babylonEngine) babylonEngine.dispose(); const canvas = document.getElementById('bg-canvas'); babylonEngine = new BABYLON.Engine(canvas, true); const scene = createScene(config); babylonEngine.runRenderLoop(() => scene.render()); window.addEventListener('resize', () => babylonEngine.resize()); }
    function createScene(config) { const scene = new BABYLON.Scene(babylonEngine); scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 15, BABYLON.Vector3.Zero(), scene); particleSystem = new BABYLON.ParticleSystem("particles", config.particleCount, scene); particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene); const isLight = document.body.classList.contains('light-theme'); const color1 = isLight ? (config.lightThemeColor1 || config.color1) : config.color1; const color2 = isLight ? (config.lightThemeColor2 || config.color2) : config.color2; particleSystem.color1 = BABYLON.Color4.FromHexString(color1 + 'FF'); particleSystem.color2 = BABYLON.Color4.FromHexString(color2 + 'FF'); particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0); particleSystem.emitter = new BABYLON.Vector3(0, 0, 0); particleSystem.minEmitBox = new BABYLON.Vector3(-10, -10, -10); particleSystem.maxEmitBox = new BABYLON.Vector3(10, 10, 10); particleSystem.minSize = 0.05; particleSystem.maxSize = 0.2; particleSystem.minLifeTime = 2; particleSystem.maxLifeTime = 5; particleSystem.emitRate = config.emitRate; particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE; particleSystem.gravity = new BABYLON.Vector3(0, 0, 0); particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1); particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1); particleSystem.minAngularSpeed = -1; particleSystem.maxAngularSpeed = 1; particleSystem.minEmitPower = 0.5; particleSystem.maxEmitPower = 1.5; particleSystem.updateSpeed = 0.01; particleSystem.start(); window.addEventListener('scroll', () => { const scrollRatio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight); gsap.to(camera, { alpha: -Math.PI / 2 + (scrollRatio * 0.5), beta: Math.PI / 2 - (scrollRatio * 0.3), radius: 15 - (scrollRatio * 5), duration: 1, ease: 'power2.out' }); }); return scene; }
    function updateBabylonJS() { if (!particleSystem || !babylonConfig) return; const isLight = document.body.classList.contains('light-theme'); const color1Hex = isLight ? (babylonConfig.lightThemeColor1 || babylonConfig.color1) : babylonConfig.color1; const color2Hex = isLight ? (config.lightThemeColor2 || babylonConfig.color2) : babylonConfig.color2; const color1 = new BABYLON.Color3.FromHexString(color1Hex); const color2 = new BABYLON.Color3.FromHexString(color2Hex); gsap.to(particleSystem.color1, { r: color1.r, g: color1.g, b: color1.b, duration: 0.5 }); gsap.to(particleSystem.color2, { r: color2.r, g: color2.g, b: color2.b, duration: 0.5 }); particleSystem.emitRate = babylonConfig.emitRate; }
    function setupCursor() { const cursorGlow = document.getElementById('cursor-glow'); if (window.matchMedia("(pointer: fine)").matches) { window.addEventListener('mousemove', e => { gsap.to(cursorGlow, { duration: 0.9, x: e.clientX, y: e.clientY, ease: "power3.out" }); }); } }
    function setupNavigation() { const menuToggle = document.getElementById('menu-toggle'); const navbar = document.querySelector('.navbar'); menuToggle.addEventListener('click', () => { menuToggle.classList.toggle('active'); navbar.classList.toggle('active'); }); document.querySelectorAll('.navbar a').forEach(link => { link.addEventListener('click', () => { menuToggle.classList.remove('active'); navbar.classList.remove('active'); }); }); }
    function setupSmoothScroll() { lenis = new Lenis(); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((time) => { lenis.raf(time * 1000); }); gsap.ticker.lagSmoothing(0); }
    function setupContactFeatures(email) { const contactEmailLink = document.getElementById('contact-email'); contactEmailLink.textContent = email; contactEmailLink.href = `mailto:${email}`; const copyBtn = document.getElementById('copy-email-btn'); const successMsg = document.getElementById('copy-success-msg'); copyBtn.addEventListener('click', () => { navigator.clipboard.writeText(email).then(() => { successMsg.classList.add('show'); setTimeout(() => { successMsg.classList.remove('show'); }, 2000); }).catch(err => console.error('Failed to copy email: ', err)); }); }
    function setupSkillInteraction() { const skillItems = document.querySelectorAll('.skill-item'); skillItems.forEach(item => { item.addEventListener('click', () => { if (gsap.isTweening(item)) return; gsap.fromTo(item, { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' }); }); }); }

    // --- START THE APP ---
    init();
});