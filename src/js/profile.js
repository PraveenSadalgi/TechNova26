import { supabase } from './db.js';
import gsap from 'gsap';

let allTrips = [];
let activeFilter = 'all';
let currentEditingTrip = null;

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    window.location.href = '/auth.html';
    return;
  }

  // Fetch Full Name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const name = profile?.full_name || user.email.split('@')[0];
  document.getElementById('user-name').innerText = name;
  document.getElementById('user-email').innerText = user.email;
  document.getElementById('user-avatar').innerText = name.charAt(0).toUpperCase();

  // Load Trips
  await loadTrips();

  // Handle Logout
  document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = '/auth.html';
  });

  // Handle Filters
  document.querySelectorAll('.filter-list li').forEach(li => {
    li.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-list li').forEach(el => el.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.dataset.filter;
      renderTrips();
    });
  });

  // Modal Handlers
  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('itinerary-modal').classList.add('hidden');
  });
  
  document.getElementById('status-select').addEventListener('change', async (e) => {
    if (!currentEditingTrip) return;
    const newStatus = e.target.value;
    
    const { error } = await supabase
      .from('trips')
      .update({ status: newStatus })
      .eq('id', currentEditingTrip.id);
      
    if (!error) {
      currentEditingTrip.status = newStatus;
      renderTrips();
    }
  });

  document.getElementById('delete-trip-btn').addEventListener('click', async () => {
    if (!currentEditingTrip || !confirm("Are you sure you want to delete this trip forever?")) return;
    
    // Deleting trip cascades to items
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', currentEditingTrip.id);
      
    if (!error) {
      document.getElementById('itinerary-modal').classList.add('hidden');
      await loadTrips();
    } else {
      alert("Failed to delete trip.");
    }
  });
});

async function loadTrips() {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*, itinerary_items(*)')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(error);
    return;
  }
  
  allTrips = trips || [];
  renderTrips();
}

function renderTrips() {
  const container = document.getElementById('trips-list');
  const emptyState = document.getElementById('empty-state');
  container.innerHTML = '';
  
  const filtered = activeFilter === 'all' 
    ? allTrips 
    : allTrips.filter(t => t.status === activeFilter);
    
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    
    filtered.forEach(trip => {
      const el = document.createElement('div');
      el.className = 'trip-card glass-panel';
      el.innerHTML = `
        <div class="trip-status status-${trip.status}">${trip.status}</div>
        <div class="trip-dest">${trip.destination}</div>
        <div class="trip-dates">${trip.num_days} Days Trip</div>
        <div class="trip-meta">${trip.itinerary_items.length} Places Planned</div>
      `;
      el.addEventListener('click', () => openTripModal(trip));
      container.appendChild(el);
    });
    
    gsap.from('.trip-card', { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, clearProps: 'all' });
  }
}

function openTripModal(trip) {
  currentEditingTrip = trip;
  document.getElementById('modal-title').innerText = `${trip.destination} Itinerary`;
  document.getElementById('status-select').value = trip.status;
  
  const itemsContainer = document.getElementById('modal-items');
  itemsContainer.innerHTML = '';
  
  trip.itinerary_items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'modal-item-card';
    el.innerHTML = `
      <div class="item-actions">
        <button class="icon-btn edit-icon" title="Edit">✎</button>
        <button class="icon-btn delete-icon" title="Delete">✕</button>
      </div>
      <div class="modal-item-cat">${item.category.replace('_', ' ')}</div>
      
      <div class="item-display">
        <div class="modal-item-name">${item.name}</div>
        <div class="modal-item-desc">${item.description}</div>
      </div>
      
      <div class="item-edit hidden">
        <input type="text" class="edit-input" value="${item.name.replace(/"/g, '&quot;')}">
        <textarea class="edit-textarea">${item.description}</textarea>
        <div style="display:flex; gap:8px;">
          <button class="save-edit-btn btn-primary" style="padding: 6px 12px; font-size: 10px; margin-top: 8px;">Save</button>
          <button class="cancel-edit-btn btn-danger" style="padding: 6px 12px; margin-top: 8px;">Cancel</button>
        </div>
      </div>
    `;
    
    // Actions logic
    const displayMode = el.querySelector('.item-display');
    const editMode = el.querySelector('.item-edit');
    const nameEl = el.querySelector('.modal-item-name');
    const descEl = el.querySelector('.modal-item-desc');
    
    // Toggle edit
    el.querySelector('.edit-icon').addEventListener('click', () => {
      displayMode.classList.add('hidden');
      editMode.classList.remove('hidden');
    });
    
    // Cancel edit
    el.querySelector('.cancel-edit-btn').addEventListener('click', () => {
      editMode.classList.add('hidden');
      displayMode.classList.remove('hidden');
    });
    
    // Save edit
    el.querySelector('.save-edit-btn').addEventListener('click', async () => {
      el.querySelector('.save-edit-btn').innerText = '...';
      const newName = el.querySelector('.edit-input').value;
      const newDesc = el.querySelector('.edit-textarea').value;
      
      const { error } = await supabase
        .from('itinerary_items')
        .update({ name: newName, description: newDesc })
        .eq('id', item.id);
        
      if (!error) {
        item.name = newName;
        item.description = newDesc;
        nameEl.innerText = newName;
        descEl.innerText = newDesc;
        editMode.classList.add('hidden');
        displayMode.classList.remove('hidden');
      } else {
        alert("Failed to update item.");
      }
      el.querySelector('.save-edit-btn').innerText = 'Save';
    });

    // Delete item
    el.querySelector('.delete-icon').addEventListener('click', async () => {
      if (!confirm("Remove this item from the itinerary?")) return;
      
      const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', item.id);
        
      if (!error) {
        el.remove();
        trip.itinerary_items = trip.itinerary_items.filter(i => i.id !== item.id);
        // Refresh the outer cards (Places count) without jumping the modal
        renderTrips(); 
      } else {
        alert("Failed to delete item.");
      }
    });

    itemsContainer.appendChild(el);
  });
  
  document.getElementById('itinerary-modal').classList.remove('hidden');
}
