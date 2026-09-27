import { ImageResponse } from 'next/og';
import { MARK } from '@/components/brand/logo-paths';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Copper mark on the night tone, rendered once at build time.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161412' }}>
        <svg width="56" height="130" viewBox="0 0 51 119">
          <path d={MARK} fill="#A97C6A" />
        </svg>
      </div>
    ),
    size,
  );
}
