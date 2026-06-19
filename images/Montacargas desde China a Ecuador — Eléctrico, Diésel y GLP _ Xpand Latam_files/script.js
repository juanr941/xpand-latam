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

// ===== CONTACT FORM =====
function submitForm(e) {
  e.preventDefault();
  document.querySelector('.contact-form').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}

// ===== EDIT MODE — IMAGE UPLOAD =====
let currentEditKey = null;

function toggleEditMode() {
  document.body.classList.toggle('edit-mode');
}

// Attach click handlers to all editable images
document.querySelectorAll('.editable-image').forEach(el => {
  el.addEventListener('click', () => {
    if (!document.body.classList.contains('edit-mode')) return;
    currentEditKey = el.dataset.key;
    document.getElementById('imageUploadInput').click();
  });
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentEditKey) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;

    // Store in localStorage so it persists
    localStorage.setItem('xpand_img_' + currentEditKey, dataUrl);

    // Apply the image
    applyImage(currentEditKey, dataUrl);
  };
  reader.readAsDataURL(file);

  // Reset input
  event.target.value = '';
}

function applyImage(key, dataUrl) {
  const imgEl = document.getElementById('img_' + key);
  const placeholder = document.getElementById('placeholder_' + key);

  if (imgEl) {
    imgEl.src = dataUrl;
    imgEl.style.display = 'block';

    // Logo images: contain, auto size — not full-cover
    if (key === 'logo_img' || key === 'logo_footer') {
      imgEl.style.width = 'auto';
      imgEl.style.height = '40px';
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

  if (key === 'hero_bg') {
    const heroImg = document.getElementById('img_hero_bg');
    heroImg.style.position = 'absolute';
    heroImg.style.inset = '0';
    heroImg.style.zIndex = '0';
  }
}

// Load saved images from localStorage on page load
function loadSavedImages() {
  const keys = [
    'hero_bg', 'about_img', 'machinery_img',
    'excavadora_img', 'montacargas_img',
    'logo_img', 'logo_footer',
    'client_1','client_2','client_3','client_4',
    'client_5','client_6','client_7','client_8',
    'testimonial_1_photo','testimonial_2_photo'
  ];
  keys.forEach(key => {
    const saved = localStorage.getItem('xpand_img_' + key);
    if (saved) applyImage(key, saved);
  });
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
});

// Handle visible class
document.addEventListener('scroll', () => {}, { passive: true });

// CSS class for visible
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// Trigger on load
window.addEventListener('load', loadSavedImages);
