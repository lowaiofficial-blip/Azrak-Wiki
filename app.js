/* ==================== MOBİL MENÜ ==================== */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

// Menü linkine tıklanınca menüyü kapat (mobil)
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      mainNav.classList.remove('open');
    }
  });
});

// Ekran yeniden boyutlandığında menü açıksa kapat (geniş ekrana geçiş)
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    mainNav.classList.remove('open');
  }
});

/* ==================== LIGHTBOX (Görsel Büyütme) ==================== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

// Tüm görsellere tıklama ekle
document.querySelectorAll('img').forEach(img => {
  // Lightbox içindeki görsele tekrar tıklama ekleme
  if (img.id === 'lightboxImg') return;

  img.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

// Kapatma
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);

// Arka plana tıklayınca kapat
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// ESC tuşuyla kapat
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});

/* ==================== SMOOTH SCROLL (CSS yeterli, JS yedek) ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
