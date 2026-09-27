import markers from './map-markers.json';

export const GEO = { lat: 26.3771, lng: 50.2195 };

type PointKey = keyof (typeof markers)['neighborhood']['points'];

export type Destination = {
  key: 'bisak' | 'expo' | 'mall' | 'corniche' | 'hospital' | 'aramco' | 'causeway' | 'airport';
  minutes: number;
  /** Marker on the map, if the place is inside the frame. */
  point?: PointKey;
};

export const destinations: Destination[] = [
  { key: 'bisak', minutes: 3, point: 'bisak' },
  { key: 'expo', minutes: 5, point: 'expo' },
  { key: 'mall', minutes: 10, point: 'mall' },
  { key: 'corniche', minutes: 10, point: 'corniche' },
  { key: 'hospital', minutes: 10 },
  { key: 'aramco', minutes: 25, point: 'aramco' },
  { key: 'causeway', minutes: 30, point: 'causeway' },
  { key: 'airport', minutes: 45, point: 'airport' },
];

export type MapVariant = keyof typeof markers;
export const mapMarkers = markers;

export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${GEO.lat},${GEO.lng}`;
