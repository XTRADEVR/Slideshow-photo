import { THEME, injectStyles, getBackgroundStyle } from './style.js';

const DEFAULT_PHOTOS = [
  { id: 'def-1', name: 'Architectural Silence', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85' },
  { id: 'def-2', name: 'Golden Mirage', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1800&q=85' },
  { id: 'def-3', name: 'Emerald Mist', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1800&q=85' },
  { id: 'def-4', name: 'Cyberpunk Tokyo', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1800&q=85' },
  { id: 'def-5', name: 'Nordic Coast', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1800&q=85' }
];

const DB_NAME = 'AuraFrameStandaloneDB';
const STORE_NAME = 'user_photos';

function openPhotoDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve(null);
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function savePhotoToDB(item) {
  const db = await openPhotoDB();
  if (!db) return;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(item);
}

async function loadPhotosFromDB() {
  const db = await openPhotoDB();
  if (!db) return [];
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const results = req.result || [];
      const photos = results.map((r) => ({
        id: r.id,
        name: r.name,
        url: r.blob ? URL.createObjectURL(r.blob) : r.url,
        isCustom: true
      }));
      resolve(photos);
    };
    req.onerror = () => resolve([]);
  });
}

let audioCtx = null;
let isAudioMuted = true;
function playChime() {
  if (isAudioMuted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = [432, 540, 648][Math.floor(Math.random() * 3)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.8);
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', async () => {
  injectStyles();

  let photos = [...DEFAULT_PHOTOS];
  let currentIndex = 0;
  let isPlaying = true;
  let durationMs = 6000; // Persis 6 Detik per foto
  let progress = 0;
  let autoHideTimer = null;
  let slideshowTimer = null;
  let controlsVisible = true;
  let isDrawerOpen = false;

  const dynamicBg = document.getElementById('dynamic-bg');
  const mainPhoto = document.getElementById('main-photo');
  const photoTitle = document.getElementById('photo-title');
  const photoCounter = document.getElementById('photo-counter');
  const progressBar = document.getElementById('progress-bar');
  const timeText = document.getElementById('time-text');
  const playBtn = document.getElementById('play-btn');
  const playIcon = document.getElementById('play-icon');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const headerElem = document.getElementById('app-header');
  const footerElem = document.getElementById('app-footer');
  const thumbnailStrip = document.getElementById('thumbnail-strip');
  const fileInput = document.getElementById('file-input');
  const pickPhotoBtn = document.getElementById('pick-photo-btn');
  const drawerBtn = document.getElementById('drawer-btn');
  const drawer = document.getElementById('app-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerPhotoList = document.getElementById('drawer-photo-list');
  const fsBtn = document.getElementById('fullscreen-btn');
  const audioBtn = document.getElementById('audio-btn');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const blurSlider = document.getElementById('blur-slider');
  const blurVal = document.getElementById('blur-val');
  const darkSlider = document.getElementById('dark-slider');
  const darkVal = document.getElementById('dark-val');

  let bgBlur = 48;
  let bgDarkness = 0.65;

  const saved = await loadPhotosFromDB();
  if (saved.length > 0) photos = [...saved, ...DEFAULT_PHOTOS];

  function renderCurrentPhoto() {
    if (photos.length === 0) return;
    const current = photos[currentIndex];
    mainPhoto.style.opacity = '0';
    setTimeout(() => {
      mainPhoto.src = current.url;
      mainPhoto.className = 'w-full h-full object-contain filter drop-shadow-2xl transition-all duration-700 ease-out ' +
        (currentIndex % 2 === 0 ? 'ken-burns-a' : 'ken-burns-b');
      mainPhoto.style.opacity = '1';
    }, 150);

    dynamicBg.style.cssText = getBackgroundStyle(current.url, bgBlur, bgDarkness);
    photoTitle.textContent = current.name;
    photoCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
    renderThumbnails();
    playChime();
  }

  function renderThumbnails() {
    thumbnailStrip.innerHTML = '';
    photos.forEach((item, idx) => {
      const thumb = document.createElement('div');
      const isActive = idx === currentIndex;
      thumb.className = `flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
        isActive ? 'border-[#d4af37] scale-105 shadow-[0_0_12px_rgba(212,175,55,0.7)]' : 'border-white/20 opacity-50 hover:opacity-90'
      }`;
      thumb.innerHTML = `<img src="${item.url}" class="w-full h-full object-cover" />`;
      thumb.onclick = (e) => { e.stopPropagation(); goToIndex(idx); };
      thumbnailStrip.appendChild(thumb);
    });
    const activeThumb = thumbnailStrip.children[currentIndex];
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function renderDrawerList() {
    drawerPhotoList.innerHTML = '';
    photos.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'relative rounded-xl overflow-hidden aspect-[4/3] border border-white/15 group cursor-pointer';
      card.innerHTML = `
        <img src="${item.url}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2">
          <span class="px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white/80 w-max">#${idx + 1}</span>
          <span class="text-[10px] text-white font-medium truncate">${item.name}</span>
        </div>
      `;
      card.onclick = () => { goToIndex(idx); toggleDrawer(false); };
      drawerPhotoList.appendChild(card);
    });
  }

  function goToNext() { currentIndex = (currentIndex + 1) % photos.length; progress = 0; renderCurrentPhoto(); }
  function goToPrev() { currentIndex = (currentIndex - 1 + photos.length) % photos.length; progress = 0; renderCurrentPhoto(); }
  function goToIndex(idx) { if (idx === currentIndex) return; currentIndex = idx; progress = 0; renderCurrentPhoto(); }

  function startSlideshow() {
    clearInterval(slideshowTimer);
    const step = 50;
    slideshowTimer = setInterval(() => {
      if (!isPlaying) return;
      progress += (100 / (durationMs / step));
      if (progress >= 100) { progress = 0; goToNext(); }
      progressBar.style.width = `${Math.min(100, progress)}%`;
      timeText.textContent = `${Math.min(6, Math.floor((progress / 100) * 6))}s / 6s`;
    }, step);
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    playIcon.innerHTML = isPlaying ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
    if (isPlaying) startSlideshow();
  }

  function resetAutoHide() {
    setControlsVisible(true);
    clearTimeout(autoHideTimer);
    if (isPlaying && !isDrawerOpen) {
      autoHideTimer = setTimeout(() => setControlsVisible(false), THEME.durations.autoHideDelay);
    }
  }

  function setControlsVisible(visible) {
    controlsVisible = visible;
    const op = visible ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none';
    headerElem.className = `absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 sm:p-6 transition-all duration-500 ${op} ${!visible ? '-translate-y-6' : ''}`;
    footerElem.className = `absolute bottom-0 inset-x-0 z-30 flex flex-col items-center pb-4 sm:pb-6 px-4 transition-all duration-500 ${op} ${!visible ? 'translate-y-6' : ''}`;
  }

  function toggleDrawer(open) {
    isDrawerOpen = open;
    drawer.className = `fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0c0e14]/95 border-l border-[#d4af37]/30 p-5 flex flex-col transition-transform duration-300 backdrop-blur-2xl ${open ? 'translate-x-0' : 'translate-x-full'}`;
    if (open) { renderDrawerList(); setControlsVisible(true); } else resetAutoHide();
  }

  async function pickLocalPhotos() {
    resetAutoHide();
    if ('showOpenFilePicker' in window) {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: true,
          types: [{ description: 'Images', accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] } }]
        });
        for (const h of handles) {
          const file = await h.getFile();
          await importSingleFile(file);
        }
        renderCurrentPhoto();
        return;
      } catch (err) { if (err.name === 'AbortError') return; }
    }
    fileInput.click();
  }

  async function importSingleFile(file) {
    if (!file.type.startsWith('image/')) return;
    const item = {
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      blob: file,
      isCustom: true
    };
    photos.unshift(item);
    await savePhotoToDB(item);
  }

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files) {
      for (const f of Array.from(e.target.files)) await importSingleFile(f);
      currentIndex = 0; progress = 0; renderCurrentPhoto(); e.target.value = '';
    }
  });

  let touchStartX = 0;
  window.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; resetAutoHide(); }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) { if (deltaX < 0) goToNext(); else goToPrev(); }
  }, { passive: true });

  window.addEventListener('mousemove', resetAutoHide);
  document.body.addEventListener('click', (e) => {
    if (!isDrawerOpen && !e.target.closest('button') && !e.target.closest('#app-drawer')) {
      setControlsVisible(!controlsVisible);
    }
  });

  playBtn.onclick = (e) => { e.stopPropagation(); togglePlay(); };
  nextBtn.onclick = (e) => { e.stopPropagation(); goToNext(); resetAutoHide(); };
  prevBtn.onclick = (e) => { e.stopPropagation(); goToPrev(); resetAutoHide(); };
  pickPhotoBtn.onclick = (e) => { e.stopPropagation(); pickLocalPhotos(); };
  drawerBtn.onclick = (e) => { e.stopPropagation(); toggleDrawer(true); };
  closeDrawerBtn.onclick = (e) => { e.stopPropagation(); toggleDrawer(false); };

  blurSlider.oninput = (e) => { bgBlur = Number(e.target.value); blurVal.textContent = `${bgBlur}px`; renderCurrentPhoto(); };
  darkSlider.oninput = (e) => { bgDarkness = Number(e.target.value); darkVal.textContent = `${Math.round(bgDarkness * 100)}%`; renderCurrentPhoto(); };
  fsBtn.onclick = (e) => { e.stopPropagation(); if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen().catch(() => {}); };
  audioBtn.onclick = (e) => { e.stopPropagation(); isAudioMuted = !isAudioMuted; audioBtn.style.color = isAudioMuted ? 'rgba(255,255,255,0.5)' : '#f6e09e'; if (!isAudioMuted) playChime(); };

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    pwaInstallBtn.classList.remove('hidden');
  });
  pwaInstallBtn.onclick = async (e) => {
    e.stopPropagation();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') pwaInstallBtn.classList.add('hidden');
      deferredPrompt = null;
    }
  };

  window.addEventListener('keydown', (e) => {
    resetAutoHide();
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowRight') goToNext();
    else if (e.code === 'ArrowLeft') goToPrev();
  });

  renderCurrentPhoto();
  startSlideshow();
  resetAutoHide();
});
