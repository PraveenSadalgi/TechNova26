import Lenis from 'lenis';
import gsap from 'gsap';
import { generateItinerary } from './api.js';
import { saveTripAndItinerary, supabase } from './db.js';

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const OWM_KEY = 'fb6fc4f3a607658587c8c344dc10ab7d';

// ─────────────────────────────────────────────────────────────
// Smooth scroll
// ─────────────────────────────────────────────────────────────
const lenis = new Lenis({ autoRaf: true, duration: 1.2 });

// ─────────────────────────────────────────────────────────────
// Custom Cursor
// ─────────────────────────────────────────────────────────────
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = -100, mouseY = -100;
let ringX  = -100, ringY  = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
});
function animateCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (cursorRing) cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

// ─────────────────────────────────────────────────────────────
// GSAP Entrance Animations
// ─────────────────────────────────────────────────────────────
function initAnimations() {
  const tl = gsap.timeline();
  tl.from('.navbar',      { y: -100, opacity: 0, duration: 1,   ease: 'power3.out' })
    .from('.hero-eyebrow', { y: 20,   opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .from('.hero-title',   { y: 40,   opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .from('.hero-sub',     { y: 20,   opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .from('.trip-form',    { y: 30,   opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
}

// ─────────────────────────────────────────────────────────────
// Auth-aware Navbar
// ─────────────────────────────────────────────────────────────
async function syncNavAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  const signinLi  = document.getElementById('nav-signin-li');
  const profileLi = document.getElementById('nav-profile-li');
  if (!session) return;

  if (signinLi)  signinLi.classList.add('hidden');
  if (profileLi) profileLi.classList.remove('hidden');

  const user     = session.user;
  const email    = user.email || '';
  const name     = user.user_metadata?.full_name || email;
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const initialsEl = document.getElementById('nav-avatar-initials');
  const emailEl    = document.getElementById('nav-dropdown-email');
  if (initialsEl) initialsEl.textContent = initials || '?';
  if (emailEl)    emailEl.textContent    = email;

  const avatarBtn = document.getElementById('nav-avatar-btn');
  const dropdown  = document.getElementById('nav-dropdown');
  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }
  const signoutBtn = document.getElementById('nav-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Weather: map OWM condition id → state
// ─────────────────────────────────────────────────────────────
function owmIdToState(id) {
  if (!id) return 'SOLAR';
  if (id >= 200 && id < 300) return 'STORM';
  if (id >= 300 && id < 600) return 'RAIN';
  if (id >= 600 && id < 700) return 'FROST';
  if (id >= 700 && id < 800) return 'MIST';
  return 'SOLAR';
}

const WEATHER_META = {
  SOLAR: { icon: '☀️', label: 'Sunny',   col: '#F5A623' },
  RAIN:  { icon: '🌧️', label: 'Rainy',   col: '#4A90D9' },
  FROST: { icon: '❄️', label: 'Snowy',   col: '#C8E6F5' },
  MIST:  { icon: '🌫️', label: 'Cloudy',  col: '#8A9BA8' },
  STORM: { icon: '⚡', label: 'Stormy',  col: '#9B59B6' },
};

// Fetch weather by city name and display weather pill
let weatherFetchTimer = null;
// Mock Weather Logic (Always works, no API needed)
async function fetchCityWeather(city) {
  if (!city || city.length < 2) {
    hideWeatherPill();
    return;
  }

  // Simulated atmospheric processing
  const states = ['SOLAR', 'RAIN', 'FROST', 'MIST', 'STORM'];
  // Semi-deterministic state based on city name length
  const state = states[city.length % states.length];
  const temp  = 15 + (city.length % 15);
  const meta  = WEATHER_META[state];
  const desc  = meta.label.toLowerCase() + ' conditions';

  showWeatherPill(meta, temp, desc, city);
}

function showWeatherPill(meta, temp, desc, cityName) {
  let pill = document.getElementById('city-weather-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'city-weather-pill';
    pill.className = 'city-weather-pill';
    // Insert after destination-group
    const destGroup = document.querySelector('.destination-group');
    destGroup.parentNode.insertBefore(pill, destGroup.nextSibling);
  }
  pill.innerHTML = `
    <span class="cwp-icon">${meta.icon}</span>
    <span class="cwp-city">${cityName}</span>
    <span class="cwp-sep">·</span>
    <span class="cwp-temp" style="color:${meta.col}">${temp}°C</span>
    <span class="cwp-sep">·</span>
    <span class="cwp-desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</span>
    <span class="cwp-badge" style="background:${meta.col}22; color:${meta.col}; border-color:${meta.col}55">${meta.label}</span>
  `;
  pill.classList.add('visible');
  gsap.fromTo(pill, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
}

function hideWeatherPill() {
  const pill = document.getElementById('city-weather-pill');
  if (pill) {
    gsap.to(pill, { opacity: 0, y: -6, duration: 0.25, onComplete: () => pill.classList.remove('visible') });
  }
}

// ─────────────────────────────────────────────────────────────
// Date Validation Utilities
// ─────────────────────────────────────────────────────────────
function validateDates(startVal, endVal) {
  // Both must be present
  if (!startVal || !endVal) return { ok: false, msg: 'Please select both a start and end date.' };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time for fair comparison

  const start = new Date(startVal);
  const end   = new Date(endVal);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { ok: false, msg: 'One or both dates are invalid. Please re-enter them.' };
  }
  if (start < today) {
    return { ok: false, msg: '⚠ Start date is in the past. Please choose today or a future date.' };
  }
  if (end < today) {
    return { ok: false, msg: '⚠ End date is in the past. Please choose a future end date.' };
  }
  if (end < start) {
    return { ok: false, msg: '⚠ End date cannot be before the start date.' };
  }
  if (end.getTime() === start.getTime()) {
    return { ok: false, msg: '⚠ Start and end dates cannot be the same day. Pick at least a one-day trip.' };
  }
  return { ok: true };
}

// Show/hide inline date error
function showDateError(msg) {
  let errEl = document.getElementById('date-error-msg');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = 'date-error-msg';
    errEl.className = 'date-error-msg';
    const datesRow = document.querySelector('.dates-row');
    datesRow.parentNode.insertBefore(errEl, datesRow.nextSibling);
  }
  errEl.textContent = msg;
  errEl.classList.add('visible');
  gsap.fromTo(errEl, { x: -6 }, { x: 0, duration: 0.3, ease: 'power2.out' });

  // Highlight date inputs red
  document.getElementById('startDate').classList.add('input-error');
  document.getElementById('endDate').classList.add('input-error');
}

function clearDateError() {
  const errEl = document.getElementById('date-error-msg');
  if (errEl) errEl.classList.remove('visible');
  document.getElementById('startDate').classList.remove('input-error');
  document.getElementById('endDate').classList.remove('input-error');
}

// ─────────────────────────────────────────────────────────────
// DOMContentLoaded
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  syncNavAuth();

  // ── Mobile Menu ──
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // ── Set date min to today ──
  const todayStr = new Date().toISOString().split('T')[0];
  const startInput = document.getElementById('startDate');
  const endInput   = document.getElementById('endDate');
  startInput.setAttribute('min', todayStr);
  endInput.setAttribute('min', todayStr);

  // When start date changes, update end's min
  startInput.addEventListener('change', () => {
    if (startInput.value) endInput.setAttribute('min', startInput.value);
    clearDateError();
  });
  endInput.addEventListener('change', clearDateError);

  // ── City input → live weather fetch ──
  const destInput = document.getElementById('destination');
  destInput.addEventListener('input', () => {
    clearTimeout(weatherFetchTimer);
    const city = destInput.value.trim();
    if (city.length >= 3) {
      weatherFetchTimer = setTimeout(() => fetchCityWeather(city), 600);
    } else {
      hideWeatherPill();
    }
  });

  // ── Featured Cards ──
  document.querySelectorAll('.featured-card').forEach(card => {
    card.addEventListener('click', () => {
      const dest = card.dataset.dest;

      // Prefill destination & trigger weather
      if (destInput) {
        destInput.value = dest;
        fetchCityWeather(dest);
      }

      const today   = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 4);
      const fmt = (d) => d.toISOString().split('T')[0];

      const params = new URLSearchParams({ dest, start: fmt(today), end: fmt(endDate), days: 4, people: 2 });
      window.location.href = `/results.html?${params.toString()}`;
    });
  });

  // ── Location button ──
  const locBtn = document.getElementById('use-location-btn');
  if (locBtn) {
    locBtn.addEventListener('click', () => {
      if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
      locBtn.style.opacity = '0.5';
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          locBtn.style.opacity = '1';
          // Reverse geocode via OWM
          try {
            const res  = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&units=metric&appid=${OWM_KEY}`
            );
            const data = await res.json();
            const city = data.name || `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
            destInput.value = city;
            const state = owmIdToState(data?.weather?.[0]?.id);
            const temp  = Math.round(data?.main?.temp ?? 0);
            const desc  = data?.weather?.[0]?.description || '';
            showWeatherPill(WEATHER_META[state], temp, desc, city);
          } catch {
            destInput.value = `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
          }
        },
        () => { locBtn.style.opacity = '1'; alert('Location permission denied or unavailable.'); }
      );
    });
  }

  // ── Trip Generator Form Submission ──
  const form = document.getElementById('trip-planner-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const dest   = document.getElementById('destination').value.trim();
      const sDate  = document.getElementById('startDate').value;
      const eDate  = document.getElementById('endDate').value;
      const people = document.getElementById('numPeople').value || 1;

      if (!dest) { alert('Please enter a destination!'); return; }

      // ── DATE VALIDATION ──
      const dateCheck = validateDates(sDate, eDate);
      if (!dateCheck.ok) {
        showDateError(dateCheck.msg);
        document.getElementById('startDate').focus();
        return;
      }
      clearDateError();

      const start = new Date(sDate);
      const end   = new Date(eDate);
      const days  = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

      const btn = document.getElementById('lets-go-btn');
      btn.innerHTML = `PLANNING YOUR TRIP...`;
      btn.style.opacity       = '0.7';
      btn.style.pointerEvents = 'none';

      const params = new URLSearchParams({ dest, start: sDate, end: eDate, days, people });
      window.location.href = `/results.html?${params.toString()}`;
    });
  }
});
