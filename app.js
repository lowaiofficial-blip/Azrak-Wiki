/* ==================== KARAKTER VERİLERİ ==================== */
/*
  YENİ KARAKTER EKLEMEK İÇİN:
  Sadece aşağıdaki CHARACTERS dizisine yeni bir nesne ekleyin.
  Profil kartı, VS karşılaştırma ve detay sayfası otomatik güncellenir.
*/
const CHARACTERS = [
  {
    id: 'cc-goku',
    name: 'CC Goku',
    form: 'Base Form',
    title: '',
    image: 'https://i.imgur.com/Xldtwhn.png',
    stats: {
      'Unvan': 'Saiyan Savaşçısı',
      'Form': 'Base Form',
      'Tür': 'Saiyan',
      'Enerji Kaynağı': 'Ki',
      'Evren': 'Dragon Ball Heroes / CC'
    },
    description: 'CC Goku, Dragon Ball Heroes evreninden gelen Saiyan savaşçısıdır. Base formunda dahi büyük bir savaş deneyimine ve potansiyele sahiptir. Azrak ile karşılaştırmada temel formdaki güç seviyesi esas alınır.',
    abilities: [
      'Ki kontrolü ve enerji patlamaları',
      'Yüksek hız ve refleksler',
      'Dövüş sanatları ustalığı',
      'Dönüşüm potansiyeli (Base Form dışında)'
    ],
    weaknesses: [
      'Bu karşılaştırmada Base Form ile sınırlıdır',
      'Kozmik/zaman güçlerine erişimi yoktur',
      'Boyutlar arası manipülasyon yeteneği bulunmaz'
    ]
  },
  {
    id: 'azrak',
    name: 'Azrak',
    form: '',
    title: 'The Dark Emperor',
    image: 'https://i.imgur.com/0RNZdBn.jpeg',
    stats: {
      'Unvan': 'The Dark Emperor',
      'Tür': 'Eşsiz Kozmik Varlık',
      'Enerji Kaynağı': 'Kozmik Enerji',
      'Silah': 'THE BROKEN TIMELINE / PHOENIX-A',
      'Ortak Unvan': 'ZARVEX LOST WORLD – THE TWO GUARDIANS'
    },
    description: 'Azrak, insan, Saiyan veya melek olmayan eşsiz bir kozmik varlıktır. Zaman ve boyutlarla bağlantılı güçleriyle tanınır. The Dark Emperor unvanıyla anılır. Super Janemba ile çok eski zamanlardan beri tanışır.',
    abilities: [
      'Zaman çizgilerini bükme (THE BROKEN TIMELINE)',
      'Boyut geçitleri açma',
      'Zarvex Lost World erişimi (50x güç artışı)',
      'PHOENIX-A (TON 618 seviyesinde kütleçekim bükme)',
      'ZERO FRAME COUNTER (glitch tabanlı karşı hamle)',
      'FINAL SIGNAL ile Super Janemba çağırma'
    ],
    weaknesses: [
      'PHOENIX-A kullanımı enerjinin %90\'ını tüketir',
      'ZERO FRAME COUNTER aşırı kullanımı enerjiyi %5\'e düşürür',
      'LAST FRAME durumunda savunma ciddi şekilde düşer',
      'THE BROKEN TIMELINE yok edilebilir'
    ]
  }
];

/* ==================== KARŞILAŞTIRMALAR ==================== */
/*
  YENİ KARŞILAŞTIRMA EKLEMEK İÇİN:
  COMPARISONS dizisine { id, leftId, rightId } ekleyin.
  Karakterler CHARACTERS dizisinde id ile bulunmalıdır.
*/
const COMPARISONS = [
  {
    id: 'cc-goku-vs-azrak',
    leftId: 'cc-goku',
    rightId: 'azrak',
    label: 'CC GOKU (BASE FORM) VS AZRAK'
  }
];

/* ==================== YARDIMCILAR ==================== */
function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id);
}

/* ==================== PROFİL KARTLARI ==================== */
function renderProfileCards() {
  const grid = document.getElementById('profileGrid');
  if (!grid) return;
  grid.innerHTML = '';

  CHARACTERS.forEach(char => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.dataset.charId = char.id;

    card.innerHTML = `
      <div class="profile-card-img-wrap">
        <img src="${char.image}" alt="${char.name}" loading="lazy">
      </div>
      <div class="profile-card-body">
        ${char.form ? `<span class="profile-card-form">${char.form}</span>` : ''}
        <div class="profile-card-name">${char.name}</div>
        ${char.title ? `<div class="profile-card-title">${char.title}</div>` : ''}
        <span class="profile-card-btn">Profili Görüntüle →</span>
      </div>
    `;

    card.addEventListener('click', (e) => {
      // Görsele tıklama lightbox yerine profili açar
      openProfileModal(char.id);
    });

    grid.appendChild(card);
  });
}

/* ==================== VS KARŞILAŞTIRMA ==================== */
function renderComparisons() {
  const wrapper = document.getElementById('vsWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  COMPARISONS.forEach(comp => {
    const left = getCharacter(comp.leftId);
    const right = getCharacter(comp.rightId);
    if (!left || !right) return;

    const box = document.createElement('div');
    box.className = 'vs-box';

    box.innerHTML = `
      <div class="vs-header">${comp.label}</div>
      <div class="vs-arena">
        <div class="vs-fighter" data-char-id="${left.id}">
          <div class="vs-fighter-img-wrap">
            <img src="${left.image}" alt="${left.name}" loading="lazy">
          </div>
          <div class="vs-fighter-name">${left.name}</div>
          ${left.form ? `<div class="vs-fighter-form">${left.form}</div>` : ''}
          ${left.title ? `<div class="vs-fighter-title">${left.title}</div>` : ''}
        </div>
        <div class="vs-center">
          <span class="vs-badge">VS</span>
        </div>
        <div class="vs-fighter" data-char-id="${right.id}">
          <div class="vs-fighter-img-wrap">
            <img src="${right.image}" alt="${right.name}" loading="lazy">
          </div>
          <div class="vs-fighter-name">${right.name}</div>
          ${right.form ? `<div class="vs-fighter-form">${right.form}</div>` : ''}
          ${right.title ? `<div class="vs-fighter-title">${right.title}</div>` : ''}
        </div>
      </div>
      <div class="vs-actions">
        <a href="javascript:void(0)" class="vs-btn" data-char-id="${left.id}">${left.name} Profilini Aç</a>
        <a href="javascript:void(0)" class="vs-btn" data-char-id="${right.id}">${right.name} Profilini Aç</a>
      </div>
    `;

    // Fighter tıklama
    box.querySelectorAll('.vs-fighter').forEach(f => {
      f.addEventListener('click', () => {
        openProfileModal(f.dataset.charId);
      });
    });

    // Buton tıklama
    box.querySelectorAll('.vs-btn').forEach(b => {
      b.addEventListener('click', () => {
        openProfileModal(b.dataset.charId);
      });
    });

    wrapper.appendChild(box);
  });
}

/* ==================== PROFİL MODAL ==================== */
const profileModal = document.getElementById('profileModal');
const profileModalInner = document.getElementById('profileModalInner');
const profileModalClose = document.getElementById('profileModalClose');

function openProfileModal(charId) {
  const char = getCharacter(charId);
  if (!char) return;

  const statsHTML = Object.entries(char.stats).map(([k, v]) => `
    <div class="profile-stat-row">
      <span class="profile-stat-label">${k}</span>
      <span class="profile-stat-value">${v}</span>
    </div>
  `).join('');

  const abilitiesHTML = (char.abilities || []).map(a => `<li>${a}</li>`).join('');
  const weaknessesHTML = (char.weaknesses || []).map(w => `<li>${w}</li>`).join('');

  profileModalInner.innerHTML = `
    <div class="profile-detail-header">
      <img src="${char.image}" alt="${char.name}" class="profile-detail-img">
      <div>
        <h2 class="profile-detail-name">${char.name}</h2>
        ${char.form ? `<span class="profile-detail-form">${char.form}</span>` : ''}
        ${char.title ? `<div class="profile-detail-title">${char.title}</div>` : ''}
        <div class="profile-detail-desc">${char.description || ''}</div>
      </div>
    </div>

    <div class="profile-detail-section">
      <h4>İstatistikler</h4>
      ${statsHTML}
    </div>

    ${abilitiesHTML ? `
    <div class="profile-detail-section">
      <h4>Güçler & Yetenekler</h4>
      <ul>${abilitiesHTML}</ul>
    </div>` : ''}

    ${weaknessesHTML ? `
    <div class="profile-detail-section">
      <h4>Zayıflıklar</h4>
      <ul>${weaknessesHTML}</ul>
    </div>` : ''}
  `;

  profileModal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Modal içindeki görsele tıklanınca lightbox DEĞİL, hiçbir şey yapma
  const modalImg = profileModalInner.querySelector('.profile-detail-img');
  if (modalImg) {
    modalImg.style.cursor = 'default';
  }
}

function closeProfileModal() {
  profileModal.classList.remove('active');
  document.body.style.overflow = '';
  profileModalInner.innerHTML = '';
}

profileModalClose.addEventListener('click', closeProfileModal);

profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) {
    closeProfileModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && profileModal.classList.contains('active')) {
    closeProfileModal();
  }
});

/* ==================== MOBİL MENÜ ==================== */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      mainNav.classList.remove('open');
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    mainNav.classList.remove('open');
  }
});

/* ==================== LIGHTBOX (Görsel Büyütme) ==================== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('img').forEach(img => {
  if (img.id === 'lightboxImg') return;
  // Profil kartları ve VS görselleri tıklanınca modal açılır, lightbox açılmasın
  if (img.closest('.profile-card') || img.closest('.vs-fighter') || img.closest('.profile-modal')) return;

  img.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});

/* ==================== SMOOTH SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ==================== BAŞLAT ==================== */
document.addEventListener('DOMContentLoaded', () => {
  renderProfileCards();
  renderComparisons();
});
