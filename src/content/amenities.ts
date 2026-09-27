import type { ImageId } from './images';

export type AmenityCategory = {
  key: 'dining' | 'family' | 'sport';
  amenities: string[];
  /** Large landscape photo beside the list. */
  lead: ImageId;
  /** A row of portrait photos. */
  portraits: [ImageId, ImageId] | [ImageId, ImageId, ImageId];
  /** Optional closing landscape photo. */
  closing?: ImageId;
};

/** Every Clubhouse amenity, grouped as on the brief. Copy lives in messages (clubhouse.amenities.*). */
export const amenityCategories: AmenityCategory[] = [
  {
    key: 'dining',
    amenities: ['restaurant', 'learning', 'guesthouse', 'salon', 'market', 'laundry', 'business'],
    lead: 'clubhouse/arcade',
    portraits: ['clubhouse/laundry', 'clubhouse/wayfinding-services', 'clubhouse/marble-bench'],
  },
  {
    key: 'family',
    amenities: ['cinema', 'bowling', 'library', 'games', 'billiards', 'tableTennis'],
    lead: 'clubhouse/cinema',
    portraits: ['clubhouse/bowling-portrait', 'clubhouse/billiards-portrait', 'clubhouse/table-tennis-portrait'],
    closing: 'clubhouse/bowling',
  },
  {
    key: 'sport',
    amenities: ['tennis', 'gym', 'pools', 'kidsPool', 'hall'],
    lead: 'clubhouse/pool-night',
    portraits: ['clubhouse/gym', 'clubhouse/gym-weights', 'clubhouse/pool-reflection'],
    closing: 'clubhouse/tennis-sunset',
  },
];

/** Home page: numbered list that swaps the adjacent (portrait) image on hover. */
export const clubhouseHighlights: { key: string; image: ImageId }[] = [
  { key: 'pools', image: 'clubhouse/pool-night-portrait' },
  { key: 'cinema', image: 'clubhouse/cinema-portrait' },
  { key: 'bowling', image: 'clubhouse/bowling-portrait' },
  { key: 'games', image: 'clubhouse/billiards-portrait' },
  { key: 'sport', image: 'clubhouse/gym' },
  { key: 'everyday', image: 'clubhouse/laundry' },
];
