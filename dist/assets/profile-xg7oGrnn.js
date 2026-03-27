import{s as d,g}from"./db-cpSSuCWQ.js";let m=[],u="all",r=null;document.addEventListener("DOMContentLoaded",async()=>{const{data:{user:t}}=await d.auth.getUser();if(!t){window.location.href="/auth.html";return}const{data:n}=await d.from("profiles").select("full_name").eq("id",t.id).single(),i=(n==null?void 0:n.full_name)||t.email.split("@")[0];document.getElementById("user-name").innerText=i,document.getElementById("user-email").innerText=t.email,document.getElementById("user-avatar").innerText=i.charAt(0).toUpperCase(),await y(),document.getElementById("logout-btn").addEventListener("click",async e=>{e.preventDefault(),await d.auth.signOut(),window.location.href="/auth.html"}),document.querySelectorAll(".filter-list li").forEach(e=>{e.addEventListener("click",a=>{document.querySelectorAll(".filter-list li").forEach(s=>s.classList.remove("active")),a.target.classList.add("active"),u=a.target.dataset.filter,o()})}),document.getElementById("close-modal").addEventListener("click",()=>{document.getElementById("itinerary-modal").classList.add("hidden")}),document.getElementById("status-select").addEventListener("change",async e=>{if(!r)return;const a=e.target.value,{error:s}=await d.from("trips").update({status:a}).eq("id",r.id);s||(r.status=a,o())}),document.getElementById("delete-trip-btn").addEventListener("click",async()=>{if(!r||!confirm("Are you sure you want to delete this trip forever?"))return;const{error:e}=await d.from("trips").delete().eq("id",r.id);e?alert("Failed to delete trip."):(document.getElementById("itinerary-modal").classList.add("hidden"),await y())})});async function y(){const{data:t,error:n}=await d.from("trips").select("*, itinerary_items(*)").order("created_at",{ascending:!1});if(n){console.error(n);return}m=t||[],o()}function o(){const t=document.getElementById("trips-list"),n=document.getElementById("empty-state");t.innerHTML="";const i=u==="all"?m:m.filter(e=>e.status===u);i.length===0?n.classList.remove("hidden"):(n.classList.add("hidden"),i.forEach(e=>{const a=document.createElement("div");a.className="trip-card glass-panel",a.innerHTML=`
        <div class="trip-status status-${e.status}">${e.status}</div>
        <div class="trip-dest">${e.destination}</div>
        <div class="trip-dates">${e.num_days} Days Trip</div>
        <div class="trip-meta">${e.itinerary_items.length} Places Planned</div>
      `,a.addEventListener("click",()=>E(e)),t.appendChild(a)}),g.from(".trip-card",{y:20,opacity:0,duration:.5,stagger:.05,clearProps:"all"}))}function E(t){r=t,document.getElementById("modal-title").innerText=`${t.destination} Itinerary`,document.getElementById("status-select").value=t.status;const n=document.getElementById("modal-items");n.innerHTML="",t.itinerary_items.forEach(i=>{const e=document.createElement("div");e.className="modal-item-card",e.innerHTML=`
      <div class="item-actions">
        <button class="icon-btn edit-icon" title="Edit">✎</button>
        <button class="icon-btn delete-icon" title="Delete">✕</button>
      </div>
      <div class="modal-item-cat">${i.category.replace("_"," ")}</div>
      
      <div class="item-display">
        <div class="modal-item-name">${i.name}</div>
        <div class="modal-item-desc">${i.description}</div>
      </div>
      
      <div class="item-edit hidden">
        <input type="text" class="edit-input" value="${i.name.replace(/"/g,"&quot;")}">
        <textarea class="edit-textarea">${i.description}</textarea>
        <div style="display:flex; gap:8px;">
          <button class="save-edit-btn btn-primary" style="padding: 6px 12px; font-size: 10px; margin-top: 8px;">Save</button>
          <button class="cancel-edit-btn btn-danger" style="padding: 6px 12px; margin-top: 8px;">Cancel</button>
        </div>
      </div>
    `;const a=e.querySelector(".item-display"),s=e.querySelector(".item-edit"),v=e.querySelector(".modal-item-name"),p=e.querySelector(".modal-item-desc");e.querySelector(".edit-icon").addEventListener("click",()=>{a.classList.add("hidden"),s.classList.remove("hidden")}),e.querySelector(".cancel-edit-btn").addEventListener("click",()=>{s.classList.add("hidden"),a.classList.remove("hidden")}),e.querySelector(".save-edit-btn").addEventListener("click",async()=>{e.querySelector(".save-edit-btn").innerText="...";const l=e.querySelector(".edit-input").value,c=e.querySelector(".edit-textarea").value,{error:f}=await d.from("itinerary_items").update({name:l,description:c}).eq("id",i.id);f?alert("Failed to update item."):(i.name=l,i.description=c,v.innerText=l,p.innerText=c,s.classList.add("hidden"),a.classList.remove("hidden")),e.querySelector(".save-edit-btn").innerText="Save"}),e.querySelector(".delete-icon").addEventListener("click",async()=>{if(!confirm("Remove this item from the itinerary?"))return;const{error:l}=await d.from("itinerary_items").delete().eq("id",i.id);l?alert("Failed to delete item."):(e.remove(),t.itinerary_items=t.itinerary_items.filter(c=>c.id!==i.id),o())}),n.appendChild(e)}),document.getElementById("itinerary-modal").classList.remove("hidden")}
