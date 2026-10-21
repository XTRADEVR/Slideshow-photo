export const THEME = {
  colors: {
    bgObsidian: '#0a0b0e',
    surfaceGlass: 'rgba(18, 20, 26, 0.65)',
    goldPrimary: '#d4af37',
    goldLight: '#f6e09e',
    textPrimary: '#ffffff',
  },
  durations: {
    slideshowInterval: 6000, // Durasi persis 6 detik per foto
    transitionCrossfade: 1400,
    autoHideDelay: 3500, // 3.5 detik auto-hide
  },
};

export function getDynamicBackgroundStyle(imageUrl, blurPx = 48, opacity = 0.65, saturate = 140) {
  if (!imageUrl) return { backgroundColor: THEME.colors.bgObsidian };
  return {
    backgroundImage: `radial-gradient(circle at 50% 40%, rgba(10, 11, 14, ${opacity * 0.4}) 0%, rgba(10, 11, 14, ${opacity}) 100%), url("${imageUrl}")`,
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    filter: `blur(${blurPx}px) saturate(${saturate}%)`,
    transform: 'scale(1.15)',
    willChange: 'filter, transform',
  };
}

export const TRANSITION_PRESETS = [
  { id: 'kenburns', label: 'Ken Burns Sinematik', desc: 'Zoom perlahan 1.0x ke 1.08x dengan crossfade mulus' },
  { id: 'panoramic', label: 'Velvet Soft Slide', desc: 'Pergeseran sudut pandang lembut' },
  { id: 'glowzoom', label: 'Soft Aura Zoom', desc: 'Pencahayaan lembut dengan pembesaran sinematik' },
];

export const STYLES = {
  glassButton:
    'relative flex items-center justify-center rounded-full backdrop-blur-xl bg-black/40 hover:bg-black/60 text-white border border-white/15 hover:border-[#d4af37]/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-95 cursor-pointer',
};
