import Lenis from 'lenis';
import gsap from 'gsap';
import { generateItinerary } from './api.js';
import { saveTripAndItinerary } from './db.js';

// ── Smooth scroll & cursor ──
new Lenis({ autoRaf: true, duration: 1.2 });

const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
});
(function loop() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (cursorRing) cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
  requestAnimationFrame(loop);
})();

// ── Read URL params ──
const p           = new URLSearchParams(window.location.search);
const destination = p.get('dest')    || 'Unknown';
const startDate   = p.get('start')   || '';
const endDate     = p.get('end')     || '';
const numDays     = parseInt(p.get('days')   || '3');
const numPeople   = parseInt(p.get('people') || '1');

let savedItems = [];   // flat list for Supabase insert
let currentData = {}; // live data for edit operations

// ── Populate hero header immediately ──
document.getElementById('results-title').innerText = destination.toUpperCase();
document.getElementById('results-meta').innerHTML = `
  <span>${numDays} DAY${numDays > 1 ? 'S' : ''}</span>
  <span>·</span>
  <span>${numPeople} TRAVELER${numPeople > 1 ? 'S' : ''}</span>
  ${startDate ? `<span>·</span><span>${startDate} → ${endDate}</span>` : ''}
`;

// ── Render a section of cards ──
function renderSection(containerId, items, badge, color) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = '';

  if (!items || items.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted); font-size:13px; font-family:'DM Mono',monospace;">None available</p>`;
    return;
  }

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'result-card glass-panel';
    card.dataset.id = item.id || `${containerId}-${i}`;  // temp ID for editing
    card.innerHTML = `
      <div class="result-card-badge" style="color:${color}">${badge}</div>
      <div class="result-card-name">${item.name}</div>
      <div class="result-card-desc">${item.description}</div>
    `;
    grid.appendChild(card);
    gsap.from(card, { y: 40, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out', clearProps: 'all' });
  });
}

// ── Load & display itinerary ──
async function loadItinerary() {
  try {
    const data = await generateItinerary(destination, numDays, numPeople);

    if (!data || data.error) {
      document.getElementById('loading-state').innerHTML = `
        <p style="color:#ef4444; font-family:'DM Mono',monospace;">Error: ${data?.error || 'Could not generate.'}</p>
        <a href="/" class="btn-primary" style="margin-top:16px; display:inline-block;">← Try Again</a>
      `;
      return;
    }

    currentData  = data;
    savedItems   = [...(data.places || []), ...(data.stays || []), ...(data.restaurants || [])];

    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('results-grid').classList.remove('hidden');
    document.getElementById('save-bar').classList.remove('hidden');

    renderSection('places-grid',      data.places,      'Must-See Spot',   '#f5a623');
    renderSection('stays-grid',       data.stays,       'Premium Stay',    '#60a5fa');
    renderSection('restaurants-grid', data.restaurants, 'Top Restaurant',  '#34d399');

    gsap.from('.results-header',  { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.result-section',  { y: 20, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', delay: 0.3, clearProps: 'all' });

  } catch (err) {
    document.getElementById('loading-state').innerHTML = `
      <p style="color:#ef4444; font-family:'DM Mono',monospace;">${err.message}</p>
      <a href="/" style="color:var(--accent); margin-top:16px; font-family:'DM Mono',monospace; display:block;">← Go Back</a>
    `;
  }
}

loadItinerary();

// ── SAVE (Confirm) Trip ──
document.getElementById('save-trip-btn').addEventListener('click', async () => {
  const btn = document.getElementById('save-trip-btn');
  btn.innerHTML = 'SAVING...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  try {
    await saveTripAndItinerary(destination, startDate, endDate, numDays, savedItems);
    btn.innerHTML    = '✓ SAVED! VIEW IN PROFILE';
    btn.style.background = '#16a34a';
    btn.style.opacity    = '1';
    btn.disabled = false;
    btn.onclick = () => { window.location.href = '/profile.html'; };
  } catch (err) {
    btn.innerHTML = 'SAVE TO MY TRIPS ✦';
    btn.style.opacity = '1';
    btn.disabled = false;
    if (err.message.includes('signed in')) {
      alert('Please sign in to save your trip.');
      window.location.href = '/auth.html';
    } else {
      alert('Save failed: ' + err.message);
    }
  }
});
