const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');
const body = document.body;
const transitionOverlay = document.querySelector('.transition-overlay');

// --- Canvas Setup ---
let width, height;
let particles = [];
let animationFrame;

// Effect Configurations
const effects = {
    winter: {
        particleCount: 150,
        colors: ['rgba(255, 255, 255, 0.8)', 'rgba(230, 240, 255, 0.6)'],
        speedBase: 1,
        speedVar: 1.5,
        sizeBase: 1,
        sizeVar: 3,
        wind: 0,
        mode: 'snow'
    },
    classic: {
        particleCount: 100,
        colors: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.5)'],
        speedBase: 0.5,
        speedVar: 1,
        sizeBase: 2,
        sizeVar: 4,
        wind: 0.2,
        mode: 'fluff'
    },
    warm: {
        particleCount: 80,
        colors: ['rgba(255, 215, 0, 0.8)', 'rgba(255, 140, 0, 0.6)', 'rgba(255, 255, 255, 0.4)'],
        speedBase: 0.2,
        speedVar: 0.5,
        sizeBase: 2,
        sizeVar: 3,
        wind: 0,
        mode: 'bokeh'
    }
};

let currentEffectConfig = effects.winter;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset(true);
    }

    reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -10;
        this.size = currentEffectConfig.sizeBase + Math.random() * currentEffectConfig.sizeVar;
        this.speedY = currentEffectConfig.speedBase + Math.random() * currentEffectConfig.speedVar;
        this.speedX = (Math.random() - 0.5) * 0.5 + currentEffectConfig.wind;
        this.color = currentEffectConfig.colors[Math.floor(Math.random() * currentEffectConfig.colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5;
        this.angle += this.spin;

        if (this.y > height) {
            this.reset();
        }
        if (this.x > width || this.x < 0) {
            this.x = (this.x + width) % width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (currentEffectConfig.mode === 'bokeh') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (currentEffectConfig.mode === 'fluff') {
            ctx.shadowBlur = 5;
            ctx.shadowColor = "white";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < currentEffectConfig.particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    animationFrame = requestAnimationFrame(animate);
}

// --- Interaction Logic ---

const bgVideo = document.getElementById('bgVideo');
let currentMode = 'image'; // image or video
let currentBg = 'winter';

// Video Map
const videoSources = {
    winter: 'winter video.mp4',
    classic: 'classic video.mp4',
    warm: 'warm video.mp4'
};

function switchBg(bgName) {
    currentBg = bgName;

    // Transition
    transitionOverlay.classList.add('active');

    setTimeout(() => {
        body.setAttribute('data-bg', bgName);

        // Update Video Source if needed
        if (currentMode === 'video') {
            updateVideoSource(bgName);
        }

        // Update Buttons UI
        document.querySelectorAll('[data-set-bg]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-set-bg') === bgName);
        });

        setTimeout(() => {
            transitionOverlay.classList.remove('active');
        }, 300);
    }, 300);
}

function updateVideoSource(theme) {
    const src = videoSources[theme];
    if (src) {
        if (bgVideo.getAttribute('src') !== src) {
            bgVideo.src = src;
            bgVideo.style.opacity = 1; // Show video
            bgVideo.play().catch(e => console.log('Autoplay blocked', e));
        }
    } else {
        // No video for this theme (Cartoon), hide video so image shows
        bgVideo.style.opacity = 0;
        bgVideo.pause();
    }
}

function switchMotion(mode) {
    currentMode = mode;

    if (mode === 'video') {
        body.classList.add('video-mode');
        bgVideo.classList.add('active');
        updateVideoSource(currentBg);
    } else {
        body.classList.remove('video-mode');
        bgVideo.classList.remove('active');
        bgVideo.pause();
    }

    // Update Buttons UI
    document.querySelectorAll('[data-set-motion]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-motion') === mode);
    });
}

function switchEffect(effectName) {
    if (!effects[effectName]) return;
    currentEffectConfig = effects[effectName];

    // Reset particles instantly for new effect
    initParticles();

    // Update Buttons UI
    document.querySelectorAll('[data-set-effect]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-effect') === effectName);
    });
}

// --- Initialization ---

window.addEventListener('resize', () => {
    resize();
    initParticles();
});

// Event Listeners for Background Buttons
document.querySelectorAll('[data-set-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
        const bg = btn.getAttribute('data-set-bg');
        switchBg(bg);
    });
});

// Event Listeners for Effect Buttons
document.querySelectorAll('[data-set-effect]').forEach(btn => {
    btn.addEventListener('click', () => {
        const effect = btn.getAttribute('data-set-effect');
        switchEffect(effect);
    });
});

// Event Listeners for Motion Buttons
document.querySelectorAll('[data-set-motion]').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-set-motion');
        switchMotion(mode);
    });
});

// --- Christmas Lights ---
const lightsContainer = document.getElementById('christmasLights');
const lightsContainerBottom = document.getElementById('christmasLightsBottom');

function initLights() {
    lightsContainer.innerHTML = '';
    lightsContainerBottom.innerHTML = '';

    const count = Math.ceil(window.innerWidth / 40);

    // Create lights for Top
    for (let i = 0; i < count; i++) {
        const bulb = document.createElement('div');
        bulb.className = 'light-bulb';
        bulb.innerHTML = '<div class="socket"></div><div class="bulb"></div>';
        lightsContainer.appendChild(bulb);
    }

    // Create lights for Bottom (Clone doesn't work well with loop references, so just recreate)
    for (let i = 0; i < count; i++) {
        const bulb = document.createElement('div');
        bulb.className = 'light-bulb';
        bulb.innerHTML = '<div class="socket"></div><div class="bulb"></div>';
        lightsContainerBottom.appendChild(bulb);
    }
}

function toggleLights(state) {
    if (state === 'on') {
        lightsContainer.classList.add('active');
        lightsContainerBottom.classList.add('active');
    } else {
        lightsContainer.classList.remove('active');
        lightsContainerBottom.classList.remove('active');
    }

    // Update buttons
    document.querySelectorAll('[data-set-lights]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-set-lights') === state);
    });
}

// Event Listeners for Lights Buttons
document.querySelectorAll('[data-set-lights]').forEach(btn => {
    btn.addEventListener('click', () => {
        const state = btn.getAttribute('data-set-lights');
        toggleLights(state);
    });
});

// Initialize Lights on load
initLights();
window.addEventListener('resize', initLights);

// Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const themeControls = document.querySelector('.theme-controls');

menuToggle.addEventListener('click', () => {
    themeControls.classList.toggle('hidden');
    // Optional: Rotate icon or change opacity to indicate state
    menuToggle.style.opacity = themeControls.classList.contains('hidden') ? '0.5' : '1';
});

// Start
resize();
initParticles();
animate();

// Defaults
body.setAttribute('data-bg', 'winter');
document.querySelector('[data-set-bg="winter"]').classList.add('active');
document.querySelector('[data-set-effect="winter"]').classList.add('active');

// ========================================
// EXTRA FX EFFECTS (Toggle-able)
// ========================================

// Effect Containers
const fxContainers = {
    stars: document.getElementById('effectStars'),
    confetti: document.getElementById('effectConfetti'),
    embers: document.getElementById('effectEmbers'),
    colorshift: document.getElementById('effectColorshift'),
    frost: document.getElementById('effectFrost')
};

// --- Stars Effect ---
function initStars() {
    fxContainers.stars.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.bottom = Math.random() * 30 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (3 + Math.random() * 3) + 's';
        fxContainers.stars.appendChild(star);
    }
}

// --- Confetti Effect ---
function initConfetti() {
    fxContainers.confetti.innerHTML = '';
    const colors = ['#ff3366', '#33ff66', '#ffcc00', '#3399ff', '#ff66cc', '#66ffcc'];
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 5 + 's';
        piece.style.animationDuration = (4 + Math.random() * 3) + 's';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        fxContainers.confetti.appendChild(piece);
    }
}

// --- Embers Effect ---
function initEmbers() {
    fxContainers.embers.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const ember = document.createElement('div');
        ember.className = 'ember';
        ember.style.left = (40 + Math.random() * 20) + '%'; // Center bottom area
        ember.style.bottom = '0';
        ember.style.animationDelay = Math.random() * 3 + 's';
        ember.style.animationDuration = (2 + Math.random() * 2) + 's';
        const emberColors = ['#ff6600', '#ff9900', '#ffcc00'];
        ember.style.background = emberColors[Math.floor(Math.random() * emberColors.length)];
        fxContainers.embers.appendChild(ember);
    }
}

// ColorShift and Frost are pure CSS (no JS particles needed)

// --- Toggle FX Function ---
function toggleFX(fxName) {
    const container = fxContainers[fxName];
    if (!container) return;

    const isActive = container.classList.toggle('active');

    // Initialize particles if needed
    if (isActive) {
        if (fxName === 'stars' && container.children.length === 0) initStars();
        if (fxName === 'confetti' && container.children.length === 0) initConfetti();
        if (fxName === 'embers' && container.children.length === 0) initEmbers();
    }

    // Update button state
    const btn = document.querySelector(`[data-toggle-fx="${fxName}"]`);
    if (btn) btn.classList.toggle('active', isActive);
}

// --- Event Listeners for FX Buttons ---
document.querySelectorAll('[data-toggle-fx]').forEach(btn => {
    btn.addEventListener('click', () => {
        const fx = btn.getAttribute('data-toggle-fx');
        toggleFX(fx);
    });
});

// Initialize all particle-based FX (lazy on toggle, but pre-create for quick response)
initStars();
initConfetti();
initEmbers();

// ========================================
// TEXT EFFECTS (Toggleable)
// ========================================

const greetingText = document.querySelector('.greeting-text');
const subGreeting = document.querySelector('.sub-greeting');

// Map effect names to CSS classes
const textEffectClasses = {
    shimmer: 'shimmer',
    rainbow: 'rainbow',
    glow: 'glow-pulse',
    bulb: 'bulb'
};

// Helper: Split text into spans for per-character effects
function splitTextWordsToSpans(element) {
    if (element.querySelector('span.char')) return; // Already split

    // Split text content into characters, preserving logic
    const text = element.innerText;
    const chars = text.split('').map(char => {
        // If space, keep it as space but maybe wrap? Just raw text node for space is safer for spacing
        return char === ' ' ? ' ' : `<span class="char">${char}</span>`;
    }).join('');

    element.innerHTML = chars;
}

function toggleTextEffect(effectName) {
    const className = textEffectClasses[effectName];
    if (!className) return;

    // Special handling for bulb: Needs split text
    if (effectName === 'bulb') {
        splitTextWordsToSpans(greetingText);
        splitTextWordsToSpans(subGreeting);
    }

    // Toggle class on both text elements
    const isActive = greetingText.classList.toggle(className);
    subGreeting.classList.toggle(className);

    // Update button state
    const btn = document.querySelector(`[data-toggle-text="${effectName}"]`);
    if (btn) btn.classList.toggle('active', isActive);
}

// Event Listeners for Text Effect Buttons
document.querySelectorAll('[data-toggle-text]').forEach(btn => {
    btn.addEventListener('click', () => {
        const effect = btn.getAttribute('data-toggle-text');
        toggleTextEffect(effect);
    });
});

// Blink Speed Slider Logic
const speedSlider = document.getElementById('blinkSpeed');
if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
        // Invert value so up is faster (shorter duration) or logical?
        // Slider max 3 (slow), min 0.1 (fast).
        // Let's make UP = Faster. So high value = low duration.
        // Input: min 0.1, max 3. 
        // We want UI: Up = Fast. 
        // Standard range vertical: Top is Max. 
        // So Max (3) should be Fast (0.1s)? Or logic map?

        // Let's just map directly for now: Value = Duration (Seconds)
        // User moves slider.
        const duration = e.target.value + 's';
        document.documentElement.style.setProperty('--blink-speed', duration);
    });

    // Set initial
    document.documentElement.style.setProperty('--blink-speed', speedSlider.value + 's');
}
