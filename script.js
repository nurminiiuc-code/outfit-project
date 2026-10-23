const STORAGE_KEY = "outfitOrbitData_v1";
const categoryNames = ["Tops", "Bottoms", "Shoes", "Accessories"];
const demoItems = [
  {id:"demo1",name:"Ivory Knit Top",category:"Tops",note:"Neutral · Everyday",image:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"},
  {id:"demo2",name:"Classic White Shirt",category:"Tops",note:"Minimal · Smart",image:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80"},
  {id:"demo3",name:"Denim Jeans",category:"Bottoms",note:"Blue · Casual",image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"},
  {id:"demo4",name:"Tailored Trousers",category:"Bottoms",note:"Classic · Smart",image:"https://images.unsplash.com/photo-1506629905607-d9c297d1b8a9?auto=format&fit=crop&w=600&q=80"},
  {id:"demo5",name:"Everyday Sneakers",category:"Shoes",note:"White · Comfortable",image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"},
  {id:"demo6",name:"Crossbody Bag",category:"Accessories",note:"Brown · Essential",image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"},
  {id:"demo7",name:"Soft Cardigan",category:"Tops",note:"Cream · Cozy",image:"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80"},
  {id:"demo8",name:"Gold Hoop Earrings",category:"Accessories",note:"Gold · Minimal",image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"}
];
const fallbackImages = {
  Tops:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80",
  Bottoms:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
  Shoes:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  Accessories:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"
};
let state = loadState();
let activeCategory = "All";
let selectedPieces = {Tops:null,Bottoms:null,Shoes:null,Accessories:null};
let toastTimer;
function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved && Array.isArray(saved.items) && Array.isArray(saved.outfits)) return saved;
  } catch(e) {}
  return {items:demoItems.map(x=>({...x})), outfits:[]};
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); updateStats(); }
function escapeHTML(value){return String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function imageFor(item){return item.image || fallbackImages[item.category] || fallbackImages.Tops;}
function showToast(message){
  const toast=document.getElementById("toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2400);
}
function updateStats(){
  document.getElementById("statItems").textContent=state.items.length;
  document.getElementById("statOutfits").textContent=state.outfits.length;
  document.getElementById("statFavorites").textContent=state.outfits.filter(o=>o.favorite).length;
}
function renderWardrobe(){
  const grid=document.getElementById("wardrobeGrid");
  const search=document.getElementById("searchInput").value.trim().toLowerCase();
  const filtered=state.items.filter(item=>(activeCategory==="All"||item.category===activeCategory) && (item.name.toLowerCase().includes(search)||item.note.toLowerCase().includes(search)));
  grid.innerHTML=filtered.map(item=>`
    <article class="clothing-card">
      <div class="clothing-image"><img src="${escapeHTML(imageFor(item))}" alt="${escapeHTML(item.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImages[item.category]}'"><span class="category-tag">${escapeHTML(item.category)}</span><button class="delete-item" data-delete="${escapeHTML(item.id)}" title="Delete item" aria-label="Delete ${escapeHTML(item.name)}">×</button></div>
      <div class="clothing-info"><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.note||"Ready to style")}</p><div class="card-actions"><button class="small-btn" data-pick="${escapeHTML(item.id)}">＋ Style this</button></div></div>
    </article>`).join("");
  document.getElementById("emptyWardrobe").classList.toggle("hidden", filtered.length>0);
  grid.classList.toggle("hidden", filtered.length===0);
}
function renderPicker(){
  const root=document.getElementById("pickerCategories");
  root.innerHTML=categoryNames.map(category=>{
    const items=state.items.filter(i=>i.category===category);
    return `<div class="picker-category"><div class="picker-category-head"><strong>${category}</strong><span>${selectedPieces[category]?"1 selected":"Choose one"}</span></div>
    ${items.length?`<div class="picker-items">${items.map(item=>`<button class="picker-item ${selectedPieces[category]===item.id?"chosen":""}" data-select-piece="${escapeHTML(item.id)}"><img src="${escapeHTML(imageFor(item))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImages[category]}'"><span>${escapeHTML(item.name)}</span></button>`).join("")}</div>`:`<p class="picker-empty">No ${category.toLowerCase()} yet — add one to your wardrobe.</p>`}</div>`;
  }).join("");
  renderPreview();
}
function renderPreview(){
  const chosen=categoryNames.map(cat=>state.items.find(i=>i.id===selectedPieces[cat])).filter(Boolean);
  const root=document.getElementById("outfitPreview");
  if(!chosen.length){root.innerHTML=`<div class="slot-placeholder"><span>✧</span><p>Your next favorite look starts here.</p><small>Select pieces from your wardrobe below.</small></div>`;return;}
  root.innerHTML=chosen.map(item=>`<div class="preview-piece"><img src="${escapeHTML(imageFor(item))}" alt="${escapeHTML(item.name)}" onerror="this.onerror=null;this.src='${fallbackImages[item.category]}'"><span>${escapeHTML(item.name)}</span></div>`).join("");
}
function renderOutfits(){
  const root=document.getElementById("savedOutfitsGrid");
  const empty=document.getElementById("emptyOutfits");
  empty.classList.toggle("hidden",state.outfits.length>0);
  root.innerHTML=state.outfits.map(outfit=>{
    const pieces=outfit.items.map(id=>state.items.find(i=>i.id===id)||outfit.snapshots?.find(i=>i.id===id)).filter(Boolean);
    return `<article class="saved-card"><div class="saved-card-head"><h3>${escapeHTML(outfit.name)}</h3><button class="favorite-btn" data-favorite="${escapeHTML(outfit.id)}" aria-label="Toggle favorite">${outfit.favorite?"♥":"♡"}</button></div><div class="saved-thumbs">${pieces.map(item=>`<div class="saved-thumb"><img src="${escapeHTML(imageFor(item))}" alt="${escapeHTML(item.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImages[item.category]}'"></div>`).join("")}</div><div class="saved-card-foot"><span>${pieces.length} pieces · ${outfit.favorite?"Favorite":"Saved look"}</span><div><button data-reload-outfit="${escapeHTML(outfit.id)}">Edit look</button> · <button class="remove-outfit" data-remove-outfit="${escapeHTML(outfit.id)}" aria-label="Delete outfit">Delete</button></div></div></article>`;
  }).join("");
}
function renderAll(){renderWardrobe();renderPicker();renderOutfits();updateStats();}
function openModal(){document.getElementById("addModal").classList.remove("hidden");setTimeout(()=>document.getElementById("clothingName").focus(),30);}
function closeModal(){document.getElementById("addModal").classList.add("hidden");}
function pickItem(id,scrollToStudio=false){
  const item=state.items.find(i=>i.id===id);if(!item)return;
  selectedPieces[item.category]=selectedPieces[item.category]===id?null:id;
  renderPicker();
  if(scrollToStudio)document.getElementById("outfits").scrollIntoView({behavior:"smooth"});
}
function randomOutfit(){
  let count=0;
  categoryNames.forEach(category=>{
    const items=state.items.filter(i=>i.category===category);
    selectedPieces[category]=items.length?items[Math.floor(Math.random()*items.length)].id:null;
    if(items.length)count++;
  });
  renderPicker();
  if(count===0){showToast("Add some clothes first to create an outfit.");return;}
  document.getElementById("outfits").scrollIntoView({behavior:"smooth"});
  showToast("A fresh look, picked just for you ✨");
}
document.getElementById("openAddBtn").addEventListener("click",openModal);
document.getElementById("emptyAddBtn").addEventListener("click",openModal);
document.getElementById("closeModalBtn").addEventListener("click",closeModal);
document.querySelector("[data-close-modal]").addEventListener("click",closeModal);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
document.getElementById("addClothingForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("clothingName").value.trim();
  const category=document.getElementById("clothingCategory").value;
  const image=document.getElementById("clothingImage").value.trim();
  const note=document.getElementById("clothingNote").value.trim();
  if(!name){showToast("Please enter a clothing name.");return;}
  const item={id:"item_"+Date.now()+"_"+Math.random().toString(16).slice(2,6),name,category,image:image||fallbackImages[category],note};
  state.items.unshift(item);persist();renderAll();e.target.reset();closeModal();showToast("Added to your wardrobe ✨");
});
document.getElementById("categoryFilters").addEventListener("click",e=>{
  const btn=e.target.closest("[data-category]");if(!btn)return;
  activeCategory=btn.dataset.category;
  document.querySelectorAll(".filter-pill").forEach(b=>b.classList.toggle("selected",b===btn));
  renderWardrobe();
});
document.getElementById("searchInput").addEventListener("input",renderWardrobe);
document.getElementById("wardrobeGrid").addEventListener("click",e=>{
  const del=e.target.closest("[data-delete]");
  if(del){
    const id=del.dataset.delete;const item=state.items.find(i=>i.id===id);
    if(!item)return;
    if(!confirm(`Remove "${item.name}" from your wardrobe?`))return;
    state.items=state.items.filter(i=>i.id!==id);
    categoryNames.forEach(c=>{if(selectedPieces[c]===id)selectedPieces[c]=null;});
    state.outfits.forEach(o=>{o.items=o.items.filter(x=>x!==id);});
    state.outfits=state.outfits.filter(o=>o.items.length>0);
    persist();renderAll();showToast("Piece removed.");return;
  }
  const pick=e.target.closest("[data-pick]");if(pick)pickItem(pick.dataset.pick,true);
});
document.getElementById("pickerCategories").addEventListener("click",e=>{
  const btn=e.target.closest("[data-select-piece]");if(btn)pickItem(btn.dataset.selectPiece);
});
document.getElementById("randomBtn").addEventListener("click",randomOutfit);
document.getElementById("randomTopBtn").addEventListener("click",randomOutfit);
document.getElementById("saveOutfitBtn").addEventListener("click",()=>{
  const pieces=categoryNames.map(c=>selectedPieces[c]).filter(Boolean);
  if(!pieces.length){showToast("Choose at least one clothing piece first.");return;}
  const name=document.getElementById("outfitName").value.trim()||`My look ${state.outfits.length+1}`;
  const snapshots=pieces.map(id=>state.items.find(i=>i.id===id)).filter(Boolean).map(i=>({...i}));
  state.outfits.unshift({id:"outfit_"+Date.now(),name,items:pieces,snapshots,favorite:false,createdAt:new Date().toISOString()});
  persist();renderOutfits();document.getElementById("outfitName").value="";showToast("Outfit saved to your collection ♡");
});
document.getElementById("savedOutfitsGrid").addEventListener("click",e=>{
  const fav=e.target.closest("[data-favorite]");
  if(fav){const outfit=state.outfits.find(o=>o.id===fav.dataset.favorite);if(outfit){outfit.favorite=!outfit.favorite;persist();renderOutfits();showToast(outfit.favorite?"Added to favorites ♥":"Removed from favorites");}return;}
  const remove=e.target.closest("[data-remove-outfit]");
  if(remove){state.outfits=state.outfits.filter(o=>o.id!==remove.dataset.removeOutfit);persist();renderOutfits();showToast("Saved outfit deleted.");return;}
  const edit=e.target.closest("[data-reload-outfit]");
  if(edit){const outfit=state.outfits.find(o=>o.id===edit.dataset.reloadOutfit);if(!outfit)return;selectedPieces={Tops:null,Bottoms:null,Shoes:null,Accessories:null};outfit.items.forEach(id=>{const item=state.items.find(i=>i.id===id);if(item)selectedPieces[item.category]=id;});document.getElementById("outfitName").value=outfit.name;renderPicker();document.getElementById("outfits").scrollIntoView({behavior:"smooth"});showToast("Look loaded into the studio.");}
});
renderAll();
