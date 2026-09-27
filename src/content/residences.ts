import type { ImageId } from './images';

export type ResidenceType = 'apartment' | 'town-villa' | 'executive-villa';
export type Extra = 'backyard-option' | 'servants-quarter' | 'private-backyard';

export type Residence = {
  slug: string;
  /** Short id for links and anchors, e.g. `3br-apartment`. */
  code: string;
  type: ResidenceType;
  bedrooms: number;
  bathrooms: number;
  /** m² */
  size: number;
  floors: 1 | 2;
  extras: Extra[];
  youtube: string;
  /** tours.affinitypropertybh.com model id; the 2BR Town Villa has none on the old site. */
  vrTour?: string;
  cover: ImageId;
  gallery: ImageId[];
  plan: ImageId;
};

export const residenceTypes: ResidenceType[] = ['apartment', 'town-villa', 'executive-villa'];

/** Included with every residence. */
export const standardFeatures = ['furnished', 'appliances', 'garage', 'internet'] as const;

export const residences: Residence[] = [
  {
    slug: 'one-bedroom-apartment',
    code: '1br-apartment',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 2,
    size: 84,
    floors: 1,
    extras: [],
    youtube: '4R9OOnZkQCY',
    vrTour: 'bYDVsscxwwF',
    cover: 'residences/1br-apartment/living-kitchen',
    gallery: [
      'residences/1br-apartment/living-kitchen',
      'residences/1br-apartment/living-room',
      'residences/1br-apartment/open-plan',
      'residences/1br-apartment/kitchen',
      'residences/1br-apartment/bedroom',
      'residences/1br-apartment/bedroom-detail',
      'residences/1br-apartment/dressing-table',
      'residences/1br-apartment/bathroom',
      'residences/1br-apartment/vanity',
    ],
    plan: 'residences/1br-apartment/plan',
  },
  {
    slug: 'two-bedroom-apartment',
    code: '2br-apartment',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 3,
    size: 141,
    floors: 1,
    extras: [],
    youtube: 'vf6F2QuF758',
    vrTour: 'YZcqokVPdpV',
    cover: 'residences/2br-apartment/living-dining',
    gallery: [
      'residences/2br-apartment/living-dining',
      'residences/2br-apartment/living-room',
      'residences/2br-apartment/kitchen',
      'residences/2br-apartment/kitchen-window',
      'residences/2br-apartment/bedroom',
      'residences/2br-apartment/twin-bedroom',
      'residences/2br-apartment/bathroom',
    ],
    plan: 'residences/2br-apartment/plan',
  },
  {
    slug: 'three-bedroom-apartment',
    code: '3br-apartment',
    type: 'apartment',
    bedrooms: 3,
    bathrooms: 3,
    size: 174,
    floors: 1,
    extras: ['backyard-option'],
    youtube: 'lijO4wYSkCM',
    vrTour: 'CDMXgVbyh49',
    cover: 'residences/3br-apartment/living-dining',
    gallery: [
      'residences/3br-apartment/living-dining',
      'residences/3br-apartment/living-kitchen',
      'residences/3br-apartment/living-room',
      'residences/3br-apartment/kitchen',
      'residences/3br-apartment/master-bedroom',
      'residences/3br-apartment/bedroom',
      'residences/3br-apartment/guest-bedroom',
      'residences/3br-apartment/twin-bedroom',
      'residences/3br-apartment/bathroom',
    ],
    plan: 'residences/3br-apartment/plan',
  },
  {
    slug: 'two-bedroom-town-villa',
    code: '2br-town-villa',
    type: 'town-villa',
    bedrooms: 2,
    bathrooms: 4,
    size: 179,
    floors: 2,
    extras: ['servants-quarter', 'private-backyard'],
    youtube: 'YaAouxrsCCY',
    cover: 'residences/2br-town-villa/living-room',
    gallery: [
      'residences/2br-town-villa/living-room',
      'residences/2br-town-villa/living-room-2',
      'residences/2br-town-villa/dining',
      'residences/2br-town-villa/twin-bedroom',
    ],
    plan: 'residences/2br-town-villa/plan',
  },
  {
    slug: 'three-bedroom-town-villa',
    code: '3br-town-villa',
    type: 'town-villa',
    bedrooms: 3,
    bathrooms: 5,
    size: 213,
    floors: 2,
    extras: ['servants-quarter', 'private-backyard'],
    youtube: 'YaAouxrsCCY',
    vrTour: 'WuvCPVmhXTY',
    cover: 'residences/3br-town-villa/living-room',
    gallery: [
      'residences/3br-town-villa/living-room',
      'residences/3br-town-villa/living-dining',
      'residences/3br-town-villa/dining',
      'residences/3br-town-villa/kitchen',
      'residences/3br-town-villa/living-portrait',
      'residences/3br-town-villa/hallway',
      'residences/3br-town-villa/master-bedroom',
      'residences/3br-town-villa/master-detail',
      'residences/3br-town-villa/bedroom',
      'residences/3br-town-villa/twin-bedroom',
      'residences/3br-town-villa/study',
      'residences/3br-town-villa/entrance',
    ],
    plan: 'residences/3br-town-villa/plan',
  },
  {
    slug: 'three-bedroom-executive-villa',
    code: '3br-executive-villa',
    type: 'executive-villa',
    bedrooms: 3,
    bathrooms: 5,
    size: 236,
    floors: 2,
    extras: ['servants-quarter', 'private-backyard'],
    youtube: '06Q9PyVHp-c',
    vrTour: 'bttTYBDXCZE',
    cover: 'residences/3br-executive-villa/living-room',
    gallery: [
      'residences/3br-executive-villa/living-room',
      'residences/3br-executive-villa/lounge',
      'residences/3br-executive-villa/dining-stair',
      'residences/3br-executive-villa/dining',
      'residences/3br-executive-villa/kitchen',
      'residences/3br-executive-villa/backyard',
      'residences/3br-executive-villa/master-bedroom',
      'residences/3br-executive-villa/bedroom',
      'residences/3br-executive-villa/twin-bedroom',
    ],
    plan: 'residences/3br-executive-villa/plan',
  },
  {
    slug: 'four-bedroom-executive-villa',
    code: '4br-executive-villa',
    type: 'executive-villa',
    bedrooms: 4,
    bathrooms: 7,
    size: 363,
    floors: 2,
    extras: ['servants-quarter', 'private-backyard'],
    youtube: 'gTDt8KohLpk',
    vrTour: 'STj4UQLYQ56',
    cover: 'residences/4br-executive-villa/living-dining',
    gallery: [
      'residences/4br-executive-villa/living-dining',
      'residences/4br-executive-villa/living-room',
      'residences/4br-executive-villa/kitchen',
      'residences/4br-executive-villa/kitchen-garden',
      'residences/4br-executive-villa/backyard',
      'residences/4br-executive-villa/master-bedroom',
      'residences/4br-executive-villa/master-suite',
      'residences/4br-executive-villa/twin-bedroom',
      'residences/4br-executive-villa/vanity',
    ],
    plan: 'residences/4br-executive-villa/plan',
  },
];

const VR_TOUR_URL = 'https://tours.affinitypropertybh.com/show/?m=';

/**
 * A residence's 3D tour. It is only ever loaded after the visitor clicks our own start button,
 * so it opens straight into the space (play, qs) without Matterport's title card and branding.
 */
export const vrTourUrl = (id: string) => `${VR_TOUR_URL}${id}&play=1&qs=1&title=0&brand=0&help=0&mls=2`;

export function getResidence(slug: string) {
  return residences.find((r) => r.slug === slug);
}

export const sizeRange = {
  min: Math.min(...residences.map((r) => r.size)),
  max: Math.max(...residences.map((r) => r.size)),
};
