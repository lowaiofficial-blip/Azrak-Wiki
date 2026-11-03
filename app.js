/* ==================== FIREBASE BAĞLANTISI ==================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBym3ag-_6YzR7ENLq5EeUxngEMPMrzPVI",
  authDomain: "azrak-wiki.firebaseapp.com",
  projectId: "azrak-wiki",
  storageBucket: "azrak-wiki.firebasestorage.app",
  messagingSenderId: "913732114424",
  appId: "1:913732114424:web:4101fb8eced7db20b5280d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ==================== KARAKTER VERİLERİ ==================== */
const CHARACTERS = [
  {
    id: 'cc-goku-universal-blue',
    groupId: 'cc-goku',
    name: 'CC Goku',
    form: 'Super Saiyan Blue: Universe Tree Power',
    title: '',
    image: 'https://i.imgur.com/qG5bznM.jpeg',
    stats: {
      'Unvan': 'Saiyan Savaşçısı',
      'Form': 'Super Saiyan Blue: Universe Tree Power',
      'Tür': 'Saiyan',
      'Enerji Kaynağı': 'Universe Tree enerjisi (Fu\'dan emilerek özümsenmiş)',
      'Evren': 'Super Dragon Ball Heroes'
    },
    description: 'Super Dragon Ball Heroes\'ta Goku\'nun Universe Tree\'nin gücünü Fu\'dan alıp Super Saiyan Blue formu aracılığıyla özümsemesiyle ortaya çıkan form.',
    abilities: [
      'Universe Tree\'den emilen tanrısal enerjiyi Super Saiyan Blue aracılığıyla kanalize etme',
      'Fu\'nun planlarını durdurabilecek düzeyde güç artışı',
      'Multiversal ölçekte enerji erişimi'
    ],
    weaknesses: [
      'Formun kalıcılığı veya sürdürülebilirliği hakkında doğrulanmış bilgi bulunamadı',
      'Enerji maliyeti veya tükenme koşulları hakkında doğrulanmış bilgi bulunamadı'
    ]
  },
  {
    id: 'azrak',
    groupId: 'azrak',
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
    description: 'Azrak, insan, Saiyan veya melek olmayan eşsiz bir kozmik varlıktır. The Dark Emperor unvanıyla anılır.',
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
      'LAST FRAME durumunda savunma ciddi şekilde düşer'
    ]
  }
];

/* ==================== KARŞILAŞTIRMA ==================== */
const COMPARISONS = [
  {
    id: 'cc-goku-universal-blue-vs-azrak',
    leftId: 'cc-goku-universal-blue',
    rightId: 'azrak',
    label: 'CC GOKU (SSB: UNIVERSE TREE POWER) VS AZRAK'
  }
];

/* ==================== DURUM ==================== */
let currentUser = null;
let currentVoteData = { goku: 0, azrak: 0 };
let hasVoted = false;
let isVoting = false;
let voteUnsubscribe = null;

/* ==================== YARDIMCILAR ==================== */
function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id);
}

/* ==================== TOAST ==================== */
function showToast(msg, isError = false) {
  const toast = document.getElementById('voteToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ==================== OYLAMA UI ==================== */
function renderVoteResults() {
  const total = (currentVoteData.goku || 0) + (currentVoteData.azrak || 0);
  const gokuPct = total > 0 ? Math.round((currentVoteData.goku / total) * 100) : 0;
  const azrakPct = total > 0 ? Math.round((currentVoteData.azrak / total) * 100) : 0;

  const container = document.getElementById('voteResults');
  if (!container) return;

  container.innerHTML = `
    <div class="vote-stats">
      <div class="vote-stat-row">
        <span class="vote-stat-name">CC Goku</span>
        <span class="vote-stat-count">${currentVoteData.goku || 0} oy</span>
      </div>
      <div class="vote-bar-track"><div class="vote-bar-fill goku-fill" style="width:${gokuPct}%"></div></div>
      <div class="vote-stat-row">
        <span class="vote-stat-name">Azrak</span>
        <span class="vote-stat-count">${currentVoteData.azrak || 0} oy</span>
      </div>
      <div class="vote-bar-track"><div class="vote-bar-fill azrak-fill" style="width:${azrakPct}%"></div></div>
      <div class="vote-total">Toplam: ${total} oy</div>
    </div>
  `;
}

function updateVoteButtons() {
  const btnGoku = document.getElementById('voteGokuBtn');
  const btnAzrak = document.getElementById('voteAzrakBtn');
  if (!btnGoku || !btnAzrak) return;

  if (isVoting) {
    btnGoku.disabled = true;
    btnAzrak.disabled = true;
    return;
  }

  if (hasVoted) {
    btnGoku.disabled = true;
    btnAzrak.disabled = true;
    btnGoku.textContent = 'Oy Verildi ✓';
    btnAzrak.textContent = 'Oy Verildi ✓';
    btnGoku.classList.remove('loading');
    btnAzrak.classList.remove('loading');
  } else {
    btnGoku.disabled = false;
    btnAzrak.disabled = false;
    btnGoku.textContent = 'CC Goku\'ya Oy Ver';
    btnAzrak.textContent = 'Azrak\'a Oy Ver';
    btnGoku.classList.remove('loading');
    btnAzrak.classList.remove('loading');
  }
}

/* ==================== OY KONTROLÜ ==================== */
async function checkIfVoted() {
  if (!currentUser) return;
  try {
    const q = query(
      collection(db, 'voteRecords'),
      where('comparisonId', '==', COMPARISONS[0].id),
      where('userId', '==', currentUser.uid)
    );
    const snapshot = await getDocs(q);
    hasVoted = !snapshot.empty;
    updateVoteButtons();
  } catch (e) {
    console.error('Oy durumu kontrol edilemedi:', e);
  }
}

/* ==================== OY VERME ==================== */
async function castVote(characterId) {
  if (!currentUser || hasVoted || isVoting) return;

  isVoting = true;
  const btnGoku = document.getElementById('voteGokuBtn');
  const btnAzrak = document.getElementById('voteAzrakBtn');

  // Hangi butona basıldıysa onu loading yap, diğerini devre dışı bırak
  const activeBtn = characterId === 'cc-goku-universal-blue' ? btnGoku : btnAzrak;
  const otherBtn = characterId === 'cc-goku-universal-blue' ? btnAzrak : btnGoku;

  if (activeBtn) {
    activeBtn.disabled = true;
    activeBtn.classList.add('loading');
    activeBtn.textContent = 'Oy veriliyor...';
  }
  if (otherBtn) {
    otherBtn.disabled = true;
  }

  const comparisonId = COMPARISONS[0].id;
  const voteDocRef = doc(db, 'votes', comparisonId);
  const voteRecordRef = doc(db, 'voteRecords', `${comparisonId}_${currentUser.uid}`);
  const field = characterId === 'cc-goku-universal-blue' ? 'goku' : 'azrak';

  try {
    await runTransaction(db, async (transaction) => {
      const voteDoc = await transaction.get(voteDocRef);
      const recordDoc = await transaction.get(voteRecordRef);

      if (recordDoc.exists()) {
        throw new Error('Bu karşılaştırmada zaten oy kullandınız.');
      }

      const current = voteDoc.exists() ? voteDoc.data() : { goku: 0, azrak: 0 };
      const newData = { ...current, [field]: (current[field] || 0) + 1 };

      if (voteDoc.exists()) {
        transaction.update(voteDocRef, newData);
      } else {
        transaction.set(voteDocRef, newData);
      }

      transaction.set(voteRecordRef, {
        comparisonId: comparisonId,
        userId: currentUser.uid,
        choice: field,
        createdAt: new Date()
      });
    });

    hasVoted = true;
    showToast('Oy verildi!');
  } catch (error) {
    console.error('Oy verme hatası:', error);
    showToast(error.message || 'Oy verme başarısız oldu.', true);
    // Başarısızsa oy verilmiş gibi gösterme
    hasVoted = false;
  } finally {
    isVoting = false;
    updateVoteButtons();
  }
}

/* ==================== OYLAMA BAŞLAT ==================== */
function initVoting() {
  const comparisonId = COMPARISONS[0].id;
  const voteDocRef = doc(db, 'votes', comparisonId);

  if (voteUnsubscribe) voteUnsubscribe();
  voteUnsubscribe = onSnapshot(voteDocRef, (snapshot) => {
    if (snapshot.exists()) {
      currentVoteData = snapshot.data();
    } else {
      currentVoteData = { goku: 0, azrak: 0 };
    }
    renderVoteResults();
  });

  checkIfVoted();

  // Buton dinleyicileri
  const btnGoku = document.getElementById('voteGokuBtn');
  const btnAzrak = document.getElementById('voteAzrakBtn');
  if (btnGoku) btnGoku.onclick = () => castVote('cc-goku-universal-blue');
  if (btnAzrak) btnAzrak.onclick = () => castVote('azrak');
}

/* ==================== AUTH ==================== */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    initVoting();
  }
});

signInAnonymously(auth).catch((error) => {
  console.error('Anonim oturum açma başarısız:', error);
  showToast('Oturum açma başarısız. Oylama devre dışı.', true);
});

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
        <img src="${char.image}" alt="${char.name}${char.form ? ' – ' + char.form : ''}" loading="lazy">
      </div>
      <div class="profile-card-body">
        ${char.form ? `<span class="profile-card-form">${char.form}</span>` : ''}
        <div class="profile-card-name">${char.name}</div>
        ${char.title ? `<div class="profile-card-title">${char.title}</div>` : ''}
        <span class="profile-card-btn">Profili Görüntüle →</span>
      </div>
    `;
    card.addEventListener('click', () => openProfileModal(char.id));
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
        </div>
        <div class="vs-center"><span class="vs-badge">VS</span></div>
        <div class="vs-fighter" data-char-id="${right.id}">
          <div class="vs-fighter-img-wrap">
            <img src="${right.image}" alt="${right.name}" loading="lazy">
          </div>
          <div class="vs-fighter-name">${right.name}</div>
          ${right.title ? `<div class="vs-fighter-title">${right.title}</div>` : ''}
        </div>
      </div>
      <div class="vote-section">
        <div id="voteResults"></div>
        <div class="vote-buttons">
          <button class="vote-btn" id="voteGokuBtn">CC Goku'ya Oy Ver</button>
          <button class="vote-btn" id="voteAzrakBtn">Azrak'a Oy Ver</button>
        </div>
      </div>
      <div class="vs-actions">
        <a href="javascript:void(0)" class="vs-btn" data-char-id="${left.id}">${left.name} Profilini Aç</a>
        <a href="javascript:void(0)" class="vs-btn" data-char-id="${right.id}">${right.name} Profilini Aç</a>
      </div>
    `;

    box.querySelectorAll('.vs-fighter').forEach(f => {
      f.addEventListener('click', () => openProfileModal(f.dataset.charId));
    });
    box.querySelectorAll('.vs-btn').forEach(b => {
      b.addEventListener('click', () => openProfileModal(b.dataset.charId));
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
    <div class="profile-detail-section"><h4>İstatistikler</h4>${statsHTML}</div>
    ${abilitiesHTML ? `<div class="profile-detail-section"><h4>Güçler & Yetenekler</h4><ul>${abilitiesHTML}</ul></div>` : ''}
    ${weaknessesHTML ? `<div class="profile-detail-section"><h4>Zayıflıklar</h4><ul>${weaknessesHTML}</ul></div>` : ''}
  `;

  profileModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
  profileModal.classList.remove('active');
  document.body.style.overflow = '';
  profileModalInner.innerHTML = '';
}

profileModalClose.addEventListener('click', closeProfileModal);
profileModal.addEventListener('click', (e) => { if (e.target === profileModal) closeProfileModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && profileModal.classList.contains('active')) closeProfileModal(); });

/* ==================== MOBİL MENÜ ==================== */
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => { if (window.innerWidth <= 768) mainNav.classList.remove('open'); });
});
window.addEventListener('resize', () => { if (window.innerWidth > 768) mainNav.classList.remove('open'); });

/* ==================== LIGHTBOX ==================== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('img').forEach(img => {
  if (img.id === 'lightboxImg') return;
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
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox(); });

/* ==================== SMOOTH SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ==================== BAŞLAT ==================== */
document.addEventListener('DOMContentLoaded', () => {
  renderProfileCards();
  renderComparisons();
});
