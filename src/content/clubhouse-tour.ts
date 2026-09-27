import manifest from './image-manifest.json';
import type { ImageId } from './images';

export type SceneGroup = 'services' | 'wellness' | 'family' | 'sport';

/** One 360° scene. Names live in messages (clubhouse.scenes.<slug>). */
export type Scene = { slug: string; group: SceneGroup };

// Every scene from the Clubhouse's iPanorama tour on the old site. Starting views are set
// in scripts/images.config.mjs and carried through the image manifest.
export const scenes: Scene[] = [
  { slug: 'lobby', group: 'services' },
  { slug: 'entrance', group: 'services' },
  { slug: 'restaurant', group: 'services' },
  { slug: 'library', group: 'services' },
  { slug: 'business-centre', group: 'services' },
  { slug: 'supermarket', group: 'services' },
  { slug: 'early-learning', group: 'services' },
  { slug: 'event-hall', group: 'services' },
  { slug: 'salon', group: 'wellness' },
  { slug: 'spa', group: 'wellness' },
  { slug: 'sauna', group: 'wellness' },
  { slug: 'moroccan-bath', group: 'wellness' },
  { slug: 'jacuzzi', group: 'wellness' },
  { slug: 'cinema', group: 'family' },
  { slug: 'bowling', group: 'family' },
  { slug: 'billiards', group: 'family' },
  { slug: 'games-room', group: 'family' },
  { slug: 'play-area', group: 'family' },
  { slug: 'play-area-2', group: 'family' },
  { slug: 'gym', group: 'sport' },
  { slug: 'indoor-pool', group: 'sport' },
  { slug: 'pool-terrace', group: 'sport' },
  { slug: 'pool-deck', group: 'sport' },
  { slug: 'sports-hall', group: 'sport' },
  { slug: 'squash', group: 'sport' },
  { slug: 'tennis', group: 'sport' },
];


/** The shorter set shown on Home; the Clubhouse page has every scene. */
export const homeScenes = [
  'lobby',
  'library',
  'restaurant',
  'cinema',
  'bowling',
  'billiards',
  'games-room',
  'indoor-pool',
  'pool-terrace',
  'gym',
  'sports-hall',
  'play-area',
];

export const posterId = (slug: string) => `tour/${slug}` as ImageId;

/** Equirectangular textures and the starting view (degrees; 0 = centre, positive = right). */
export function panorama(slug: string) {
  const entry = manifest[posterId(slug)] as { pano?: { desktop: string; mobile: string; yaw: number; pitch: number } };
  if (!entry.pano) throw new Error(`No panorama for ${slug}`);
  return entry.pano;
}
