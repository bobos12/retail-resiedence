// JS mirror of the motion tokens in globals.css (--ease-out, --dur-*), for motion/react.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const DUR = {
  fast: 0.22,
  base: 0.45,
  reveal: 0.8,
  slow: 1,
} as const;

export const STAGGER = 0.08;

/** Parallax travel as a fraction of the element's height. */
export const PARALLAX = 0.04;

export const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;
