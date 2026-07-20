// ===== EDIT MODE GATE =====
// Edit button only visible when URL contains ?edit (e.g. yoursite.com/?edit)
// Visitors never see it.
(function () {
  const editToggle = document.getElementById('editToggle');
  if (!editToggle) return;
  if (new URLSearchParams(window.location.search).has('edit')) {
    editToggle.style.display = '';
  } else {
    editToggle.style.display = 'none';
  }
})();

// ===== HEADER SCROLL =====
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== MOBILE MENU =====
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.querySelector('.hamburger');
  if (menu.classList.contains('open') && !menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ===== SMOOTH SCROLL for nav links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = document.getElementById('header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== FAQ ACCORDION =====
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ===== RISK INTERACTIVE SELECTOR =====
function selectRisk(btn, targetId) {
  document.querySelectorAll('.rnav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.risk-detail').forEach(d => d.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(targetId);
  if (panel) panel.classList.add('active');
}

// ===== EDIT MODE — IMAGE UPLOAD =====
let currentEditKey = null;

// Attach click handlers to all editable images
document.querySelectorAll('.editable-image').forEach(el => {
  el.addEventListener('click', (e) => {
    if (!document.body.classList.contains('edit-mode')) return;
    // Let dedicated upload buttons handle their own click (sv-vis-upload, hup-btn, etc.)
    if (e.target.closest('.sv-vis-upload') || e.target.closest('.hup-btn') || e.target.tagName === 'INPUT') return;
    e.preventDefault();
    e.stopPropagation();
    currentEditKey = el.dataset.key;
    document.getElementById('imageUploadInput').click();
  });
});

function compressImage(file, cb) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var MAX = 1200;
      var w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentEditKey) return;
  event.target.value = '';
  compressImage(file, function(dataUrl) {
    try { localStorage.setItem('xpand_img_' + currentEditKey, dataUrl); } catch(err) { alert('Almacenamiento lleno — elimina algunas imágenes primero.'); return; }
    applyImage(currentEditKey, dataUrl);
  });
}

function handleMachImgUpload(input, key) {
  var file = input.files[0];
  if (!file) return;
  input.value = '';
  compressImage(file, function(dataUrl) {
    try { localStorage.setItem('xpand_img_' + key, dataUrl); } catch(err) { alert('Almacenamiento lleno — elimina algunas imágenes primero.'); return; }
    applyImage(key, dataUrl);
  });
}

function applyImage(key, dataUrl) {
  const imgEl = document.getElementById('img_' + key);
  const placeholder = document.getElementById('placeholder_' + key);

  if (imgEl && !key.startsWith('sv_img_')) {
    imgEl.src = dataUrl;
    imgEl.style.display = 'block';

    if (key === 'logo_img' || key === 'logo_footer') {
      imgEl.style.width = 'auto';
      imgEl.style.height = '40px';
      imgEl.style.objectFit = 'contain';
    } else if (key.startsWith('client_')) {
      imgEl.style.width = '100%';
      imgEl.style.height = '100%';
      imgEl.style.objectFit = 'contain';
    } else {
      imgEl.style.width = '100%';
      imgEl.style.height = '100%';
      imgEl.style.objectFit = 'cover';
    }
  }
  if (placeholder) {
    placeholder.style.display = 'none';
  }

  // For service panel keys, also apply as CSS background (the visible layer)
  if (key.startsWith('sv_img_')) {
    applySvPanelBg(key, dataUrl);
  }

  if (key === 'hero_bg') {
    const heroImg = document.getElementById('img_hero_bg');
    heroImg.style.position = 'absolute';
    heroImg.style.inset = '0';
    heroImg.style.width = '100%';
    heroImg.style.height = '100%';
    heroImg.style.objectFit = 'cover';
    heroImg.style.zIndex = '0';
  }
}

// Hero slide upload handler
window.handleHeroSlide = function(input, idx) {
  const file = input.files[0];
  if (!file) return;
  const key = idx === 0 ? 'hero_bg' : 'hero_slide_' + idx;
  const vidEl = document.getElementById('video_' + key) || document.getElementById('video_hero_' + (idx === 0 ? 'bg' : 'slide_' + idx));
  const imgEl = document.getElementById('img_' + key);
  const ph = document.getElementById('placeholder_' + key);

  if (file.type.startsWith('video/')) {
    const url = URL.createObjectURL(file);
    if (vidEl) { vidEl.src = url; vidEl.style.display = 'block'; }
    if (imgEl) imgEl.style.display = 'none';
    if (ph) ph.style.display = 'none';
  } else {
    compressImage(file, function(dataUrl) {
      if (vidEl) { vidEl.src = ''; vidEl.style.display = 'none'; }
      if (imgEl) { imgEl.src = dataUrl; imgEl.style.display = 'block'; }
      if (ph) ph.style.display = 'none';
      try { localStorage.setItem('xpand_img_' + key, dataUrl); } catch(err) {}
    });
  }
};

// Hero slideshow controller
(function() {
  var current = 0;
  var total = 3;
  var timer = null;

  window.goToHeroSlide = function(idx) {
    document.querySelectorAll('.hero-slide').forEach(function(s, i) {
      s.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('.hero-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === idx);
    });
    current = idx;
  };

  function hasContent(idx) {
    var key = idx === 0 ? 'hero_bg' : 'hero_slide_' + idx;
    var vid = document.getElementById('video_' + key) || document.getElementById('video_hero_' + (idx === 0 ? 'bg' : 'slide_' + idx));
    var img = document.getElementById('img_' + key);
    var vidHas = vid && vid.src && vid.src !== window.location.href && vid.style.display !== 'none';
    var imgHas = img && img.src && img.src.length > 10 && img.style.display !== 'none';
    return vidHas || imgHas;
  }

  function advance() {
    var next = (current + 1) % total;
    for (var i = 0; i < total; i++) {
      if (hasContent(next)) { goToHeroSlide(next); return; }
      next = (next + 1) % total;
    }
  }

  timer = setInterval(advance, 6000);
})();

// Load saved images from localStorage on page load
// Falls back to img/{key}.jpg (for Netlify-hosted version)
function loadSavedImages() {
  const keys = [
    'hero_bg', 'world_map', 'about_img', 'success_img', 'machinery_img',
    'excavadora_img', 'montacargas_img', 'mining_comm_img', 'cnc_hero',
    'logo_img', 'logo_footer',
    'ops_img_1','ops_img_2','ops_img_3','ops_img_4','ops_img_5',
    'ops_img_6','ops_img_7','ops_img_8','ops_img_9','ops_img_10',
    'client_1','client_2','client_3','client_4',
    'client_5','client_6','client_7','client_8',
    'client_9','client_10','client_11','client_12',
    'client_13','client_14','client_15',
    'testimonial_1_photo','testimonial_2_photo',
    'sv_img_0','sv_img_1','sv_img_2','sv_img_3','sv_img_4','sv_img_5','sv_img_6',
    'audit_img',
    'hero_slide_1','hero_slide_2',
    'mc_brand_1','mc_brand_2','mc_brand_3','mc_brand_4',
    'exc_brand_1','exc_brand_2','exc_brand_3','exc_brand_4'
  ];
  keys.forEach(function(key) {
    var saved = localStorage.getItem('xpand_img_' + key);
    if (saved) {
      applyImage(key, saved);
    } else {
      // Try static img/ file (Netlify: partners see images without localStorage)
      var t = new Image();
      t.onload = function() { applyImage(key, 'img/' + key + '.jpg'); };
      t.src = 'img/' + key + '.jpg';
    }
  });
}

// Download all saved images as files → put in img/ folder → redeploy to Netlify
function exportAllImages() {
  var downloads = [];
  for (var i = 0; i < localStorage.length; i++) {
    var storageKey = localStorage.key(i);
    var filename = null;
    if (storageKey.startsWith('xpand_img_')) {
      filename = storageKey.replace('xpand_img_', '') + '.jpg';
    } else if (storageKey === 'tienda_hero_bg') {
      filename = 'tienda_hero_bg.jpg';
    }
    if (filename) downloads.push({ data: localStorage.getItem(storageKey), filename: filename });
  }
  if (downloads.length === 0) { alert('No hay imágenes guardadas en este navegador.'); return; }
  downloads.forEach(function(d, idx) {
    setTimeout(function() {
      var a = document.createElement('a');
      a.href = d.data; a.download = d.filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }, idx * 400);
  });
  alert(downloads.length + ' imagen(es) exportando...\n\n1. Crea una carpeta "img" dentro del proyecto\n2. Mueve todos los archivos descargados ahí\n3. Re-sube el proyecto completo a Netlify');
}

// ===== ANIMATE ON SCROLL =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add animation classes
document.querySelectorAll('.service-card, .step, .client-slot, .testimonial, .diff-item, .stat-item').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  // Mark visible elements
  document.querySelectorAll('.service-card, .step, .client-slot, .testimonial, .diff-item, .stat-item').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    }
  });
  loadSavedImages();

  // Inject edit + export FAB on sub-pages (montacargas, excavadoras, etc.)
  if (!document.getElementById('editToggle') && !document.getElementById('tHeader')) {
    var fab = document.createElement('div');
    fab.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px;align-items:flex-end;';
    fab.innerHTML =
      '<button id="subExportBtn" onclick="exportAllImages()" style="display:none;background:#D98B00;color:#fff;border:none;padding:9px 16px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.25);">📥 Exportar imágenes</button>' +
      '<button id="subEditToggle" onclick="document.body.classList.toggle(\'edit-mode\');var e=document.body.classList.contains(\'edit-mode\');this.textContent=e?\'✅ Salir de edición\':\'✏️ Editar imágenes\';document.getElementById(\'subExportBtn\').style.display=e?\'block\':\'none\';" style="background:#062A78;color:#fff;border:none;padding:9px 16px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.25);">✏️ Editar imágenes</button>';
    document.body.appendChild(fab);
  }

  // Start services slider auto-advance
  startSvAuto();
  var svSection = document.getElementById('servicios');
  if (svSection) {
    svSection.addEventListener('mouseenter', stopSvAuto);
    svSection.addEventListener('mouseleave', startSvAuto);
    svSection.addEventListener('click', function() { stopSvAuto(); startSvAuto(); });
  }

  // Restore previously revealed extra leader slots
  var extraCount = parseInt(localStorage.getItem('xpand_extra_clients') || '0');
  if (extraCount > 0) {
    var extras = document.querySelectorAll('.leader-slot--extra');
    var revealed = 0;
    extras.forEach(function(slot) {
      if (revealed < extraCount) {
        slot.style.display = '';
        var key = slot.dataset.key;
        slot.addEventListener('click', (function(k) {
          return function(e) {
            if (!document.body.classList.contains('edit-mode')) return;
            if (e.target.closest('.sv-vis-upload') || e.target.tagName === 'INPUT') return;
            e.preventDefault(); e.stopPropagation();
            currentEditKey = k;
            document.getElementById('imageUploadInput').click();
          };
        })(key));
        revealed++;
      }
    });
    if (window.leadersInit) window.leadersInit();
  }
});

// Handle visible class
document.addEventListener('scroll', () => {}, { passive: true });

// CSS class for visible
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// Trigger on load
window.addEventListener('load', loadSavedImages);

// ===== OPS GALLERY — COVERFLOW CAROUSEL =====
(function() {
  const stage = document.getElementById('opsStage');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.ops-slot-card'));
  const total = cards.length;
  const captionEl = document.getElementById('opsActiveCaption');
  const captionKeys = cards.map(c => c.dataset.captionKey);

  let activeIdx = 0;
  let autoTimer = null;

  // --- Positioning ---
  const CARD_W   = parseInt(getComputedStyle(cards[0]).width) || 410;
  const SPACING  = Math.round(CARD_W * 0.73); // tight coverflow overlap
  const SCALE_D  = 0.82;          // scale per step

  function positionAll(animate) {
    cards.forEach((card, i) => {
      // Normalise offset to [-floor(total/2), floor(total/2)]
      let off = i - activeIdx;
      if (off >  total / 2) off -= total;
      if (off < -total / 2) off += total;

      const abs     = Math.abs(off);
      const scale   = Math.pow(SCALE_D, abs);
      const tx      = off * SPACING;
      const opacity = Math.max(0, 1 - abs * 0.2);
      const z       = 20 - abs;
      const visible = abs <= 4;

      if (animate) card.classList.add('animated');
      else         card.classList.remove('animated');

      card.style.transform   = `translateX(calc(-50% + ${tx}px)) translateY(-50%) scale(${scale})`;
      card.style.opacity     = visible ? opacity : 0;
      card.style.zIndex      = z;
      card.style.pointerEvents = visible ? 'auto' : 'none';
      card.classList.toggle('active', off === 0);
    });
  }

  // --- In-card captions ---
  function loadCardCaptions() {
    cards.forEach((card, i) => {
      const capEl = card.querySelector('.ops-card-caption');
      if (!capEl) return;
      const key   = captionKeys[i];
      const saved = key ? localStorage.getItem('xpand_cap_' + key) : null;
      capEl.textContent = (saved !== null && saved !== '') ? saved : (card.dataset.caption || '');
    });
  }

  // Save on edit + block click-through
  cards.forEach((card, i) => {
    const capEl = card.querySelector('.ops-card-caption');
    if (!capEl) return;
    capEl.addEventListener('input', () => {
      const key = captionKeys[i];
      if (key) localStorage.setItem('xpand_cap_' + key, capEl.textContent.trim());
    });
    capEl.addEventListener('click', e => e.stopPropagation());
  });

  // Keep stub so toggleEditMode's _opsCoverflowRefreshCaption call is harmless
  function refreshCaption() {}

  // --- Advance ---
  function go(idx, userTriggered) {
    activeIdx = ((idx % total) + total) % total;
    positionAll(true);
    refreshCaption();
    if (userTriggered) { stopAuto(); setTimeout(startAuto, 5000); }
  }

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => go(activeIdx + 1, false), 2200);
  }
  function stopAuto() { clearInterval(autoTimer); autoTimer = null; }

  // --- Clicks ---
  cards.forEach((card, i) => {
    card.addEventListener('click', e => {
      if (document.body.classList.contains('edit-mode')) return;
      go(i, true);
    });
  });

  document.getElementById('opsStripPrev')?.addEventListener('click', () => go(activeIdx - 1, true));
  document.getElementById('opsStripNext')?.addEventListener('click', () => go(activeIdx + 1, true));

  // Hover pause
  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', startAuto);

  // --- Touch / drag on stage ---
  let dragStartX = 0, dragging = false;
  stage.addEventListener('touchstart',  e => { dragStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  stage.addEventListener('touchend',    e => {
    const d = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) go(d > 0 ? activeIdx + 1 : activeIdx - 1, false);
    setTimeout(startAuto, 4000);
  }, { passive: true });

  stage.addEventListener('mousedown',   e => { dragging = true; dragStartX = e.clientX; stopAuto(); });
  window.addEventListener('mouseup',    e => {
    if (!dragging) return;
    const d = dragStartX - e.clientX;
    if (Math.abs(d) > 50) go(d > 0 ? activeIdx + 1 : activeIdx - 1, false);
    dragging = false;
    setTimeout(startAuto, 4000);
  });

  // --- Caption editing (edit mode) ---
  if (captionEl) {
    captionEl.addEventListener('input', () => {
      const key = captionKeys[activeIdx];
      if (key) localStorage.setItem('xpand_cap_' + key, captionEl.textContent.trim());
    });
  }

  // --- Init ---
  function init() {
    positionAll(false);
    loadCardCaptions();
    setTimeout(() => startAuto(), 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Expose for toggleEditMode to call
  window._opsCoverflowRefreshCaption = refreshCaption;
})();

// ===== COLLAPSIBLE SECTIONS =====
function toggleSection(bodyId, headerEl) {
  var body = document.getElementById(bodyId);
  if (!body) return;
  var isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  var header = headerEl || body.previousElementSibling;
  if (header) {
    header.classList.toggle('open', !isOpen);
  }
}

// ===== EDIT MODE toggle =====
function toggleEditMode() {
  document.body.classList.toggle('edit-mode');
  const isEdit = document.body.classList.contains('edit-mode');
  // Make all in-card captions editable
  document.querySelectorAll('.ops-card-caption').forEach(el => {
    el.contentEditable = isEdit ? 'true' : 'false';
  });
  const hintEl = document.getElementById('opsCaptionHint');
  if (hintEl) hintEl.textContent = isEdit ? 'Haz clic en la descripción de la imagen activa para editarla' : '';
}

// ===== OFFICE MAP SELECTOR =====
function selectOffice(btn, pinId) {
  document.querySelectorAll('.osel-card').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.osel-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.imap-pin').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pin = document.getElementById(pinId);
  if (pin) pin.classList.add('active');
}

// ===== COUNTRY TABS =====
function selectCountryTab(btn, panelId) {
  document.querySelectorAll('.ctab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ctab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

// ===== SAVINGS CALCULATOR =====
let calcCountry = 'ecuador';

// Relative weights per category — how the total savings splits across channels
const categoryRates = {
  machinery:     { neg: 0.52, qc: 0.30, log: 0.18 },
  consumer:      { neg: 0.56, qc: 0.33, log: 0.11 },
  electronics:   { neg: 0.44, qc: 0.40, log: 0.16 },
  textile:       { neg: 0.56, qc: 0.32, log: 0.12 },
  construction:  { neg: 0.48, qc: 0.29, log: 0.23 },
};

const countryBonus = { ecuador: 1.18, peru: 1.08, colombia: 1.0 };

// Total savings % scales with order volume: 8% at the low end, 20% at the high end
const CALC_MIN_FOB = 10000;
const CALC_MAX_FOB = 500000;
const CALC_MIN_PCT = 0.08;
const CALC_MAX_PCT = 0.20;

function formatUSD(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function updateCalc() {
  const fob = parseInt(document.getElementById('calcSlider').value);
  const category = document.getElementById('calcCategory').value;
  const rates = categoryRates[category];
  const bonus = countryBonus[calcCountry];

  const t = (fob - CALC_MIN_FOB) / (CALC_MAX_FOB - CALC_MIN_FOB);
  const basePct = CALC_MIN_PCT + (CALC_MAX_PCT - CALC_MIN_PCT) * Math.min(Math.max(t, 0), 1);
  const totalPct = basePct * bonus;

  const negSav = fob * totalPct * rates.neg;
  const qcSav  = fob * totalPct * rates.qc;
  const logSav = fob * totalPct * rates.log;
  const total  = negSav + qcSav + logSav;
  const maxSav = CALC_MAX_FOB * CALC_MAX_PCT * countryBonus.ecuador;

  document.getElementById('calcFobVal').textContent = fob.toLocaleString('en-US');
  document.getElementById('savNeg').textContent = formatUSD(negSav);
  document.getElementById('savQc').textContent  = formatUSD(qcSav);
  document.getElementById('savLog').textContent = formatUSD(logSav);
  document.getElementById('savTotal').textContent = formatUSD(total);

  document.getElementById('barNeg').style.width = Math.round((negSav / maxSav) * 100) + '%';
  document.getElementById('barQc').style.width  = Math.round((qcSav  / maxSav) * 100) + '%';
  document.getElementById('barLog').style.width = Math.round((logSav / maxSav) * 100) + '%';
}

function setCalcCountry(btn, country) {
  document.querySelectorAll('.calc-country-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  calcCountry = country;
  updateCalc();
}

// Init calculator on load
document.addEventListener('DOMContentLoaded', updateCalc);

// ===== PROJECTS CAROUSEL =====
(function() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const cardWidth = 320; // card width + gap
  let autoTimer;
  let isDown = false;
  let startX, scrollLeft;

  function scrollBy(amount) {
    track.scrollBy({ left: amount, behavior: 'smooth' });
  }

  // Auto-scroll
  function startAuto() {
    autoTimer = setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollBy(cardWidth);
      }
    }, 3200);
  }

  function stopAuto() { clearInterval(autoTimer); }

  startAuto();
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Buttons
  document.getElementById('carouselPrev')?.addEventListener('click', () => { stopAuto(); scrollBy(-cardWidth); startAuto(); });
  document.getElementById('carouselNext')?.addEventListener('click', () => { stopAuto(); scrollBy(cardWidth); startAuto(); });

  // Drag to scroll
  track.addEventListener('mousedown', (e) => { isDown = true; track.classList.add('grabbing'); startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; stopAuto(); });
  track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('grabbing'); startAuto(); });
  track.addEventListener('mouseup', () => { isDown = false; track.classList.remove('grabbing'); startAuto(); });
  track.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - track.offsetLeft; track.scrollLeft = scrollLeft - (x - startX) * 1.5; });

  // Touch support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAuto(); });
  track.addEventListener('touchend', (e) => { const diff = touchStartX - e.changedTouches[0].clientX; if (Math.abs(diff) > 30) scrollBy(diff > 0 ? cardWidth : -cardWidth); startAuto(); });
})();

// ===== CLIENTS CAROUSEL =====
(function() {
  const track = document.getElementById('clientsTrack');
  const viewport = track && track.parentElement;
  if (!track || !viewport) return;

  const VISIBLE = 5;
  let current = 0;

  function getSlotWidth() {
    const slot = track.querySelector('.client-slot');
    if (!slot) return 0;
    const gap = 16;
    return slot.offsetWidth + gap;
  }

  function totalSlots() { return track.querySelectorAll('.client-slot').length; }

  function clamp(v) { return Math.max(0, Math.min(v, totalSlots() - VISIBLE)); }

  function goTo(idx) {
    current = clamp(idx);
    track.style.transform = `translateX(-${current * getSlotWidth()}px)`;
  }

  document.getElementById('clientsPrev')?.addEventListener('click', () => goTo(current - 1));
  document.getElementById('clientsNext')?.addEventListener('click', () => goTo(current + 1));

  let autoTimer = setInterval(() => {
    goTo(current + 1 > totalSlots() - VISIBLE ? 0 : current + 1);
  }, 3500);

  viewport.addEventListener('mouseenter', () => clearInterval(autoTimer));
  viewport.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => {
      goTo(current + 1 > totalSlots() - VISIBLE ? 0 : current + 1);
    }, 3500);
  });
})();

// ===== LANGUAGE SWITCHER =====
function toggleLangDropdown(e) {
  e && e.stopPropagation();
  const sw = document.getElementById('langSwitcher');
  sw && sw.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const sw = document.getElementById('langSwitcher');
  if (sw && !sw.contains(e.target)) sw.classList.remove('open');
});

function setLang(code) {
  const labels = { es: 'ES', en: 'EN', zh: '中文' };
  const el = document.getElementById('langCurrent');
  if (el) el.textContent = labels[code] || code.toUpperCase();
  const sw = document.getElementById('langSwitcher');
  if (sw) sw.classList.remove('open');
}

// ===== SERVICES TAB =====
// ===== SERVICES SLIDER =====
var currentSvPanel = 0;
var svAutoTimer = null;

function selectSvTab(btn, idx) {
  var viewport = document.getElementById('svPanelsViewport');
  var track = document.getElementById('svPanelsTrack');
  if (!track || !viewport) return;
  var panels = track.querySelectorAll('.sv-panel');
  idx = Math.max(0, Math.min(idx, panels.length - 1));
  currentSvPanel = idx;
  track.style.transform = 'translateX(-' + (idx * viewport.offsetWidth) + 'px)';
  document.querySelectorAll('.sv-tab-btn').forEach(function(b, i) { b.classList.toggle('active', i === idx); });
  document.querySelectorAll('.sv-dot').forEach(function(d, i) { d.classList.toggle('active', i === idx); });
}

function svNext() {
  var total = document.querySelectorAll('.sv-panel').length;
  selectSvTab(null, (currentSvPanel + 1) % total);
}

function svPrev() {
  var total = document.querySelectorAll('.sv-panel').length;
  selectSvTab(null, (currentSvPanel - 1 + total) % total);
}

function startSvAuto() {
  stopSvAuto();
  svAutoTimer = setInterval(svNext, 5500);
}

function stopSvAuto() {
  if (svAutoTimer) { clearInterval(svAutoTimer); svAutoTimer = null; }
}

window.addEventListener('resize', function() {
  var viewport = document.getElementById('svPanelsViewport');
  var track = document.getElementById('svPanelsTrack');
  if (!track || !viewport) return;
  var prev = track.style.transition;
  track.style.transition = 'none';
  track.style.transform = 'translateX(-' + (currentSvPanel * viewport.offsetWidth) + 'px)';
  setTimeout(function() { track.style.transition = prev; }, 50);
});

// Apply media (image or video) to a service panel visual background
function applySvPanelBg(key, dataUrl) {
  var idx = parseInt(key.replace('sv_img_', ''));
  var panelId = 'svt-' + idx;
  var panel = document.getElementById(panelId);
  if (!panel) return;
  var visual = panel.querySelector('.sv-panel-visual');
  if (!visual) return;
  // Show image without overlay — the panel's own class (sv-vis-blue etc.) is overridden
  visual.style.backgroundImage = 'url(' + dataUrl + ')';
  visual.style.backgroundSize = 'cover';
  visual.style.backgroundPosition = 'center';
  visual.style.backgroundRepeat = 'no-repeat';
}

// Service panel media upload (image or video)
function applySvPanelMedia(input, key) {
  var file = input.files[0];
  if (!file) return;
  if (file.type.startsWith('video/')) {
    var url = URL.createObjectURL(file);
    var idx = parseInt(key.replace('sv_img_', ''));
    var panelId = 'svt-' + idx;
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var visual = panel.querySelector('.sv-panel-visual');
    if (!visual) return;
    // For video: create a video element as background
    var existing = visual.querySelector('.sv-bg-video');
    if (existing) existing.remove();
    var vid = document.createElement('video');
    vid.className = 'sv-bg-video';
    vid.src = url; vid.autoplay = true; vid.muted = true; vid.loop = true; vid.playsInline = true;
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0.5;';
    visual.insertBefore(vid, visual.firstChild);
  } else {
    compressImage(file, function(dataUrl) {
      applySvPanelBg(key, dataUrl);
      try { localStorage.setItem('xpand_img_' + key, dataUrl); } catch(err) {}
    });
  }
}

// ===== LEADERS CAROUSEL =====
(function() {
  const track = document.getElementById('leadersTrack');
  const viewport = document.getElementById('leadersViewport');
  if (!track || !viewport) return;
  const GAP = 16;
  let current = 0;
  let autoTimer = null;
  let stepPx = 0;

  function visibleCount() {
    const vw = viewport.offsetWidth;
    if (vw < 480) return 2;
    if (vw < 768) return 3;
    if (vw < 1100) return 4;
    if (vw < 1400) return 5;
    return 6;
  }

  function init() {
    const vc = visibleCount();
    const vw = viewport.offsetWidth;
    const slotW = Math.floor((vw - GAP * (vc - 1)) / vc);
    track.querySelectorAll('.leader-slot').forEach(function(slot) {
      slot.style.width = slotW + 'px';
      slot.style.minWidth = slotW + 'px';
    });
    stepPx = slotW + GAP;
    goTo(current);
  }

  function totalSlots() { return track.querySelectorAll('.leader-slot').length; }

  function goTo(idx) {
    const max = Math.max(0, totalSlots() - visibleCount());
    current = Math.max(0, Math.min(idx, max));
    track.style.transform = 'translateX(-' + (current * stepPx) + 'px)';
  }

  function startAuto() {
    autoTimer = setInterval(function() {
      const max = totalSlots() - visibleCount();
      goTo(current >= max ? 0 : current + 1);
    }, 3200);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  document.getElementById('leadersPrev')?.addEventListener('click', function() { goTo(current - 1); resetAuto(); });
  document.getElementById('leadersNext')?.addEventListener('click', function() { goTo(current + 1); resetAuto(); });
  window.addEventListener('resize', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  startAuto();

  // Expose init for external callers (add-slot button)
  window.leadersInit = init;
})();

// Add a new company slot to the leaders carousel (edit mode)
window.leadersAddSlot = function() {
  var extras = document.querySelectorAll('.leader-slot--extra');
  var revealed = false;
  for (var i = 0; i < extras.length; i++) {
    if (extras[i].style.display === 'none') {
      extras[i].style.display = '';
      // Wire up edit-mode click on the newly revealed slot
      var key = extras[i].dataset.key;
      extras[i].addEventListener('click', (function(k, el) {
        return function(e) {
          if (!document.body.classList.contains('edit-mode')) return;
          if (e.target.closest('.sv-vis-upload') || e.target.tagName === 'INPUT') return;
          e.preventDefault(); e.stopPropagation();
          currentEditKey = k;
          document.getElementById('imageUploadInput').click();
        };
      })(key, extras[i]));
      // Save which slots are revealed
      var shown = parseInt(localStorage.getItem('xpand_extra_clients') || '0');
      localStorage.setItem('xpand_extra_clients', shown + 1);
      revealed = true;
      break;
    }
  }
  if (!revealed) alert('Ya se mostraron todos los espacios disponibles.');
  if (window.leadersInit) window.leadersInit();
};

// ===== MAQUINARIA / DISTRIBUIDORES SLIDER =====
(function() {
  const track = document.getElementById('machTrack');
  const viewport = document.getElementById('machViewport');
  if (!track || !viewport) return;
  const GAP = 24;
  let current = 0;
  let stepPx = 0;

  function visibleCount() {
    const vw = viewport.offsetWidth;
    if (vw <= 600) return 1;
    if (vw <= 960) return 2;
    return 3;
  }

  function init() {
    const vc = visibleCount();
    const vw = viewport.offsetWidth;
    const cardW = Math.floor((vw - GAP * (vc - 1)) / vc);
    track.querySelectorAll('.mach-card').forEach(function(card) {
      card.style.width = cardW + 'px';
      card.style.minWidth = cardW + 'px';
      card.style.maxWidth = cardW + 'px';
      card.style.flexBasis = cardW + 'px';
    });
    stepPx = cardW + GAP;
    goTo(current);
  }

  function totalCards() { return track.querySelectorAll('.mach-card').length; }

  function goTo(idx) {
    const max = Math.max(0, totalCards() - visibleCount());
    current = Math.max(0, Math.min(idx, max));
    track.style.transform = 'translateX(-' + (current * stepPx) + 'px)';
  }

  document.getElementById('machPrev')?.addEventListener('click', function() { goTo(current - 1); });
  document.getElementById('machNext')?.addEventListener('click', function() { goTo(current + 1); });
  window.addEventListener('resize', init);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
