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

// Alexandria (Mohamed Gaber, OFL), Arabic subset only, variable 400–500: a geometric Arabic
// with the same clean, architectural rhythm as General Sans. Latin falls through to General Sans.
export const alexandria = localFont({
  src: [{ path: '../fonts/Alexandria-Arabic.woff2', weight: '400 500', style: 'normal' }],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});
