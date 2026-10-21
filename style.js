export const THEME = {
  colors: {
    bgObsidian: '#0a0b0e',
    goldPrimary: '#d4af37',
    goldLight: '#f6e09e',
  },
  durations: {
    slideshowInterval: 6000,
    autoHideDelay: 3500,
  }
};

export function injectStyles() {
  if (document.getElementById('auraframe-styles')) return;
  const style = document.createElement('style');
  style.id = 'auraframe-styles';
  style.textContent = `
    @keyframes kenBurnsA {
      0% { transform: scale(1.0) translate3d(0, 0, 0); }
      100% { transform: scale(1.08) translate3d(-1%, -1.5%, 0); }
    }
    @keyframes kenBurnsB {
      0% { transform: scale(1.08) translate3d(1%, 1%, 0); }
      100% { transform: scale(1.0) translate3d(0, 0, 0); }
    }
    .ken-burns-a {
      animation: kenBurnsA 6.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      will-change: transform;
    }
    .ken-burns-b {
      animation: kenBurnsB 6.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      will-change: transform;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(style);
}

export function getBackgroundStyle(imageUrl, blur = 48, opacity = 0.65, saturate = 140) {
  return `
    background-image: radial-gradient(circle at 50% 40%, rgba(10, 11, 14, ${opacity * 0.4}) 0%, rgba(10, 11, 14, ${opacity}) 100%), url("${imageUrl}");
    background-position: center center;
    background-size: cover;
    filter: blur(${blur}px) saturate(${saturate}%);
    transform: scale(1.15);
    will-change: filter, transform;
  `;
    }
