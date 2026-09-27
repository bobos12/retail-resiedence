// Renders a flat (rectilinear) view out of an equirectangular panorama, so scene posters
// look like a photograph taken from the tour's starting position rather than a warped strip.
import sharp from 'sharp';

/**
 * @param {string} src equirectangular source
 * @param {{ yaw: number, pitch: number, fov?: number, width: number, height: number }} view degrees
 * @returns {Promise<import('sharp').Sharp>}
 */
export async function renderView(src, { yaw, pitch, fov = 80, width, height }) {
  const { data, info } = await sharp(src, { limitInputPixels: false })
    .toColourspace('srgb')
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const out = Buffer.alloc(width * height * 3);
  const rad = Math.PI / 180;
  const t = Math.tan((fov * rad) / 2);
  const cy = Math.cos(yaw * rad), sy = Math.sin(yaw * rad);
  const cp = Math.cos(pitch * rad), sp = Math.sin(pitch * rad);

  for (let y = 0; y < height; y++) {
    const v = -((2 * (y + 0.5)) / height - 1) * t * (height / width);
    for (let x = 0; x < width; x++) {
      const u = ((2 * (x + 0.5)) / width - 1) * t;
      // Camera space (x right, y up, z forward): pitch about x, then yaw about y.
      const y1 = v * cp + sp;
      const z1 = -v * sp + cp;
      const dx = u * cy + z1 * sy;
      const dz = -u * sy + z1 * cy;
      const lon = Math.atan2(dx, dz);
      const lat = Math.atan2(y1, Math.hypot(dx, dz));
      const sx = ((lon / (2 * Math.PI) + 0.5) * W) % W;
      const syy = Math.min(H - 1.001, Math.max(0, (0.5 - lat / Math.PI) * H));
      const x0 = Math.floor(sx), y0 = Math.floor(syy);
      const x1 = (x0 + 1) % W, fx = sx - x0, fy = syy - y0;
      const o = (y * width + x) * 3;
      for (let c = 0; c < 3; c++) {
        const a = data[(y0 * W + x0) * 3 + c] * (1 - fx) + data[(y0 * W + x1) * 3 + c] * fx;
        const b = data[((y0 + 1) * W + x0) * 3 + c] * (1 - fx) + data[((y0 + 1) * W + x1) * 3 + c] * fx;
        out[o + c] = a * (1 - fy) + b * fy;
      }
    }
  }
  return sharp(out, { raw: { width, height, channels: 3 } });
}
