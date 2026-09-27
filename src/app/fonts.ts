import localFont from 'next/font/local';

// General Sans (Indian Type Foundry, ITF Free Font License) for Latin.
export const generalSans = localFont({
  src: [
    { path: '../fonts/GeneralSans-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/GeneralSans-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-general',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

// IBM Plex Sans Arabic (OFL), Arabic subset only; Latin falls through to General Sans.
export const plexArabic = localFont({
  src: [
    { path: '../fonts/IBMPlexSansArabic-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/IBMPlexSansArabic-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});
