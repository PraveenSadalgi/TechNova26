const WEATHER_CONFIGS = {
  SOLAR: {
    accent:'#F5A623', bg:'#0a0a0a', bg2:'#111111', text:'#f0ece4', muted:'#666',
    density: 40, speed: 0.5,
    label:'☀ 22°C · Sunny', badge:'SOLAR',
  },
  RAIN: {
    accent:'#4A90D9', bg:'#080c10', bg2:'#0d1117', text:'#d1dce5', muted:'#708090',
    density: 150, speed: 1.2,
    label:'🌧 11°C · Rainy', badge:'RAIN',
  },
  FROST: {
    accent:'#C8E6F5', bg:'#08090c', bg2:'#0f1115', text:'#e6f1f7', muted:'#8a9ba8',
    density: 100, speed: 0.8,
    label:'❄ -2°C · Snowy', badge:'FROST',
  },
  MIST: {
    accent:'#8A9BA8', bg:'#090a0b', bg2:'#121416', text:'#ced4d9', muted:'#707a82',
    density: 50, speed: 0.4,
    label:'🌫 14°C · Cloudy', badge:'MIST',
  },
  STORM: {
    accent:'#9B59B6', bg:'#0a0810', bg2:'#14111d', text:'#e5d8f0', muted:'#8e7aa3',
    density: 200, speed: 2.0,
    label:'⚡ 8°C · Thunder', badge:'STORM',
  },
};

let currentWeather = 'SOLAR';
let particles = [];
let canvas, ctx, animId;
let mouse = { x: -200, y: -200 };
let flashTimer = 0;

// ===================== CANVAS & PARTICLES =====================
function initWeather() {
  canvas = document.getElementById('weatherCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  
  initParticles();
  animate();
  
  // UI Events
  const pill = document.getElementById('weatherPill');
  const switcher = document.getElementById('weatherSwitcher');
  if (pill && switcher) {
    pill.addEventListener('click', (e) => {
        e.stopPropagation();
        switcher.classList.toggle('open');
    });
    document.addEventListener('click', () => switcher.classList.remove('open'));
    
    document.querySelectorAll('.weather-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
            const state = opt.dataset.state;
            if (state) setWeather(state);
        });
    });
  }

  // Initial Theme
  setWeather('SOLAR', true);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles() {
  particles = [];
  const cfg = WEATHER_CONFIGS[currentWeather];
  for (let i = 0; i < cfg.density; i++) particles.push(createParticle(cfg));
}

function createParticle(cfg) {
  const w = canvas.width, h = canvas.height;
  const p = { x: Math.random() * w, y: Math.random() * h, opacity: Math.random() * 0.5 + 0.1 };
  const s = cfg.speed;

  switch(currentWeather) {
    case 'SOLAR':
      p.type = 'ray'; p.x = w * 0.7 + Math.random() * w * 0.4; p.y = -20;
      p.vx = -(Math.random() * 0.3 + 0.1) * s; p.vy = (Math.random() * 0.5 + 0.3) * s;
      p.len = Math.random() * 80 + 30; p.angle = Math.PI * 0.15 + Math.random() * 0.2;
      p.opacity = Math.random() * 0.12 + 0.03;
      break;
    case 'RAIN':
      p.type = 'drop'; p.x = Math.random() * w; p.y = Math.random() * h;
      p.vx = -0.5 * s; p.vy = (Math.random() * 8 + 6) * s;
      p.len = Math.random() * 12 + 8; p.opacity = Math.random() * 0.4 + 0.1;
      break;
    case 'FROST':
      p.type = 'flake'; p.x = Math.random() * w; p.y = Math.random() * h;
      p.vx = Math.sin(p.y * 0.01) * 0.3 * s; p.vy = (Math.random() * 0.8 + 0.3) * s;
      p.r = Math.random() * 2 + 1; p.drift = Math.random() * Math.PI * 2;
      p.opacity = Math.random() * 0.6 + 0.2;
      break;
    case 'MIST':
      p.type = 'wisp'; p.x = Math.random() * w; p.y = Math.random() * h;
      p.vx = (Math.random() * 0.4 + 0.1) * s; p.vy = (Math.random() - 0.5) * 0.1 * s;
      p.w = Math.random() * 200 + 100; p.h = Math.random() * 20 + 10;
      p.opacity = Math.random() * 0.06 + 0.01;
      break;
    case 'STORM':
      p.type = 'spark'; p.x = Math.random() * w; p.y = Math.random() * h;
      p.vx = (Math.random() - 0.5) * 3 * s; p.vy = (Math.random() * 10 + 4) * s;
      p.len = Math.random() * 6 + 2; p.opacity = Math.random() * 0.5 + 0.2;
      break;
  }
  return p;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return {r,g,b};
}

function animate() {
  animId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cfg = WEATHER_CONFIGS[currentWeather];
  const col = hexToRgb(cfg.accent);

  if (currentWeather === 'STORM') {
    flashTimer--;
    if (flashTimer <= 0) flashTimer = Math.random() * 300 + 100;
    if (flashTimer < 3) {
      ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},0.04)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  particles.forEach(p => {
    const dx = p.x - mouse.x, dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      const force = (80 - dist) / 80;
      p.x += (dx / dist) * force * 2;
      p.y += (dy / dist) * force * 2;
    }

    ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${p.opacity})`;
    ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${p.opacity})`;
    
    switch(p.type) {
      case 'ray':
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.angle) * p.len, p.y + Math.sin(p.angle) * p.len);
        ctx.stroke(); p.x += p.vx; p.y += p.vy;
        if (p.y > canvas.height + 50) { Object.assign(p, createParticle(cfg)); p.y = -20; }
        break;
      case 'drop':
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + p.len);
        ctx.stroke(); p.x += p.vx; p.y += p.vy;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
        break;
      case 'flake':
        p.drift += 0.02; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill(); p.x += Math.sin(p.drift) * 0.5 + p.vx; p.y += p.vy;
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
        break;
      case 'wisp':
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.w, p.h, 0, 0, Math.PI * 2);
        ctx.fill(); p.x += p.vx;
        if (p.x > canvas.width + p.w) { p.x = -p.w; p.y = Math.random() * canvas.height; }
        break;
      case 'spark':
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx, p.y + p.len);
        ctx.stroke(); p.x += p.vx; p.y += p.vy;
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
        break;
    }
  });
}

// ===================== THEME ENGINE =====================
function setWeather(state, immediate = false) {
  const overlay = document.getElementById('themeOverlay');
  if (overlay && !immediate) overlay.classList.add('active');
  
  const apply = () => {
    currentWeather = state;
    const cfg = WEATHER_CONFIGS[state];
    
    // UI Tokens
    document.documentElement.style.setProperty('--accent', cfg.accent);
    document.documentElement.style.setProperty('--accent-dim', `rgba(${hexToRgb(cfg.accent).r},${hexToRgb(cfg.accent).g},${hexToRgb(cfg.accent).b},0.15)`);
    document.documentElement.style.setProperty('--bg-dark', cfg.bg);
    
    // Update Pill
    const lb = document.getElementById('weatherLabel');
    const bd = document.getElementById('weatherBadge');
    if (lb) lb.textContent = cfg.label;
    if (bd) bd.textContent = cfg.badge;
    
    initParticles();
    if (overlay) overlay.classList.remove('active');
  };

  if (immediate) apply();
  else setTimeout(apply, 1200);
}

window.addEventListener('load', initWeather);
