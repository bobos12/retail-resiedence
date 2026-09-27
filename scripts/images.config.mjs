// Every image the site uses. `dir` matches a folder in _raw-assets by prefix
// (Drive timestamp suffixes are ignored). Output: public/images/<id>.jpg
//   hero:  anything shown at half the screen or wider (2560px long edge); otherwise 1920px
//   crop:  fractions of the auto-rotated source ({ left, top, width, height })
//   video: a frame from the client's walkthrough videos (gets a light unsharp mask)
//   og:    also write a 1200x630 Open Graph crop to public/images/og/<name>.jpg
//   drawing: a floor plan; lossless WebP with the white paper made transparent
//   pano:  a 360° scene ({ yaw, pitch } of its starting view, degrees): desktop and mobile
//          equirectangular textures plus a flat poster of the starting view

const GATE = '01 Front Gate';
const CLUB = '02 Clubhouse';
const APT1 = '03 One bedroom Apartment';
const TV3 = '04 Three Bedroom Villas';
const DRONE = '05 Drone Shots';
const OUT = '05 Outdoors';
const OLD = 'old-site';
const VID = 'video-frames';

const frame = (residence, name) => ({ dir: VID, file: `${residence}/${name}.png`, video: true });

export const images = [
  // Site-wide architecture
  { id: 'site/aerial-compound', dir: DRONE, file: '4.jpg', hero: true },
  { id: 'site/aerial-compound-dusk', dir: DRONE, file: '7.jpg', hero: true, og: 'neighborhood' },
  { id: 'site/aerial-clubhouse-dusk', dir: DRONE, file: '10.jpg', hero: true },
  { id: 'site/aerial-clubhouse-courtyard', dir: DRONE, file: '9.jpg', hero: true },
  { id: 'site/aerial-courtyard', dir: DRONE, file: '6.jpg', hero: true },
  { id: 'site/aerial-villas', dir: DRONE, file: '5.jpg', hero: true },
  { id: 'site/gate-dusk-portrait', dir: GATE, file: '6I1A5023-Edit.jpg', hero: true },
  { id: 'site/gate-sign-dusk', dir: GATE, file: '6I1A5021-Edit.jpg' },
  { id: 'site/gate-guard', dir: GATE, file: '6I1A4966-Edit.jpg', hero: true },
  { id: 'site/gate-checkpoint', dir: GATE, file: '6I1A4981-Edit-Edit.jpg' },
  { id: 'site/gate-day', dir: GATE, file: '6I1A4967-Edit-Edit.jpg' },
  { id: 'site/street-dusk', dir: OUT, file: '6I1A8923.jpg', hero: true },
  { id: 'site/street-palms', dir: OUT, file: '6I1A8880.jpg', hero: true },
  { id: 'site/street-palms-portrait', dir: OUT, file: '6I1A8883.jpg', hero: true },
  { id: 'site/villa-corner', dir: OUT, file: '6I1A8889.jpg' },
  { id: 'site/villa-corner-portrait', dir: OUT, file: '6I1A8894.jpg' },

  // Clubhouse
  { id: 'clubhouse/facade-night-wide', dir: CLUB, file: '6I1A5035-Pano.jpg', hero: true, og: 'clubhouse', crop: { left: 0.068, top: 0, width: 0.864, height: 1 } },
  { id: 'clubhouse/facade-night-portrait', dir: CLUB, file: '6I1A5042.jpg', hero: true, crop: { left: 0.3, top: 0, width: 0.4, height: 1 } },
  { id: 'clubhouse/lobby', dir: CLUB, file: '6I1A8932-HDR.jpg', hero: true },
  { id: 'clubhouse/lobby-portrait', dir: CLUB, file: '6I1A8953-HDR.jpg', hero: true },
  { id: 'clubhouse/arcade', dir: CLUB, file: '6I1A9277-HDR.jpg', hero: true },
  { id: 'clubhouse/mini-market', dir: CLUB, file: '6I1A9284-HDR.jpg', hero: true },
  { id: 'clubhouse/laundry', dir: CLUB, file: '6I1A9292-HDR.jpg', hero: true },
  { id: 'clubhouse/wayfinding-services', dir: CLUB, file: '6I1A9198-Edit.jpg' },
  { id: 'clubhouse/cinema', dir: CLUB, file: '6I1A9001-HDR.jpg', hero: true },
  { id: 'clubhouse/cinema-portrait', dir: CLUB, file: '6I1A9007-HDR.jpg', hero: true },
  { id: 'clubhouse/bowling', dir: CLUB, file: '6I1A9031-HDR.jpg', hero: true },
  { id: 'clubhouse/bowling-portrait', dir: CLUB, file: '6I1A9019-HDR.jpg', hero: true },
  { id: 'clubhouse/billiards-portrait', dir: CLUB, file: '6I1A9068-HDR.jpg', hero: true },
  { id: 'clubhouse/table-tennis-portrait', dir: CLUB, file: '6I1A9084-HDR-Edit.jpg', hero: true },
  { id: 'clubhouse/marble-bench', dir: CLUB, file: '6I1A9210.jpg', hero: true },
  { id: 'clubhouse/reception', dir: CLUB, file: '6I1A8938-HDR.jpg', hero: true },
  { id: 'clubhouse/corridor', dir: CLUB, file: '6I1A8974-HDR.jpg', hero: true },
  { id: 'clubhouse/gym', dir: CLUB, file: '6I1A9221.jpg', hero: true },
  { id: 'clubhouse/gym-weights', dir: CLUB, file: '6I1A9222.jpg' },
  { id: 'clubhouse/pool-night', dir: CLUB, file: '6I1A9250-HDR.jpg', hero: true, og: 'home' },
  { id: 'clubhouse/pool-night-portrait', dir: CLUB, file: '6I1A9254-HDR.jpg', hero: true },
  { id: 'clubhouse/pool-reflection', dir: CLUB, file: '6I1A9257-HDR.jpg', hero: true },
  { id: 'clubhouse/pool-terrace', dir: CLUB, file: '6I1A9245-HDR.jpg', hero: true },
  { id: 'clubhouse/pool-umbrellas', dir: CLUB, file: '6I1A9239-HDR.jpg', hero: true },
  { id: 'clubhouse/tennis-sunset', dir: OUT, file: '6I1A8778-HDR-Edit.jpg', hero: true },

  // Everyday life
  { id: 'living/playground', dir: OUT, file: '6I1A8815.jpg', hero: true, og: 'living' },
  { id: 'living/playground-train', dir: OUT, file: '6I1A8816.jpg', hero: true },
  { id: 'living/kids-zone-dusk', dir: OUT, file: '6I1A8903.jpg' },
  { id: 'living/fitness-portrait', dir: OUT, file: '6I1A8844.jpg' },
  { id: 'living/garden-bench', dir: OUT, file: '6I1A8878.jpg' },
  { id: 'living/benches-evening', dir: OUT, file: '6I1A8910.jpg' },
  { id: 'living/wayfinding-nursery', dir: OUT, file: '6I1A8837.jpg' },

  // 1BR Apartment (client folder)
  { id: 'residences/1br-apartment/living-kitchen', dir: APT1, file: '6I1A4796-HDR-Pano-Edit.jpg', hero: true, og: 'one-bedroom-apartment' },
  { id: 'residences/1br-apartment/living-room', dir: APT1, file: '6I1A4754-HDR.jpg', hero: true },
  { id: 'residences/1br-apartment/open-plan', dir: APT1, file: '6I1A4742-HDR.jpg' },
  { id: 'residences/1br-apartment/kitchen', dir: APT1, file: '6I1A4750-HDR.jpg' },
  { id: 'residences/1br-apartment/bedroom', dir: APT1, file: '6I1A4864-HDR-Pano-Edit.jpg', hero: true },
  { id: 'residences/1br-apartment/bedroom-detail', dir: APT1, file: '6I1A4817-HDR.jpg' },
  { id: 'residences/1br-apartment/dressing-table', dir: APT1, file: '6I1A4826-HDR.jpg' },
  { id: 'residences/1br-apartment/bathroom', dir: APT1, file: '6I1A4880-HDR-Pano-Edit.jpg' },
  { id: 'residences/1br-apartment/vanity', dir: APT1, file: '6I1A4911-HDR-Edit-Edit.jpg' },
  { id: 'residences/1br-apartment/plan', dir: OLD, file: '2022/09/Floor-plan-1BR-Apartment.png', drawing: true },

  // 2BR Apartment (frames from the client's 1080p walkthrough)
  { id: 'residences/2br-apartment/living-dining', ...frame('2br-apartment', 'living-dining'), og: 'two-bedroom-apartment' },
  { id: 'residences/2br-apartment/living-room', ...frame('2br-apartment', 'living-room') },
  { id: 'residences/2br-apartment/kitchen', ...frame('2br-apartment', 'kitchen') },
  { id: 'residences/2br-apartment/kitchen-window', ...frame('2br-apartment', 'kitchen-window') },
  { id: 'residences/2br-apartment/bedroom', ...frame('2br-apartment', 'bedroom') },
  { id: 'residences/2br-apartment/twin-bedroom', ...frame('2br-apartment', 'twin-bedroom') },
  { id: 'residences/2br-apartment/bathroom', ...frame('2br-apartment', 'bathroom') },
  { id: 'residences/2br-apartment/plan', dir: OLD, file: '2022/09/Floor-plan-2BR-Apartment.png', drawing: true },

  // 3BR Apartment (walkthrough frames)
  { id: 'residences/3br-apartment/living-dining', ...frame('3br-apartment', 'living-dining'), og: 'three-bedroom-apartment' },
  { id: 'residences/3br-apartment/living-kitchen', ...frame('3br-apartment', 'living-kitchen') },
  { id: 'residences/3br-apartment/living-room', ...frame('3br-apartment', 'living-room') },
  { id: 'residences/3br-apartment/kitchen', ...frame('3br-apartment', 'kitchen') },
  { id: 'residences/3br-apartment/master-bedroom', ...frame('3br-apartment', 'master-bedroom') },
  { id: 'residences/3br-apartment/bedroom', ...frame('3br-apartment', 'bedroom') },
  { id: 'residences/3br-apartment/guest-bedroom', ...frame('3br-apartment', 'guest-bedroom') },
  { id: 'residences/3br-apartment/twin-bedroom', ...frame('3br-apartment', 'twin-bedroom') },
  { id: 'residences/3br-apartment/bathroom', ...frame('3br-apartment', 'bathroom') },
  { id: 'residences/3br-apartment/plan', dir: OLD, file: '2022/09/Floor-plan-3BR-Apartment.png', drawing: true },

  // 2BR Town Villa (old site only; small photos are kept to gallery size)
  { id: 'residences/2br-town-villa/living-room', dir: OLD, file: '2022/08/Living-Room-Town-Villa.jpg', og: 'two-bedroom-town-villa' },
  { id: 'residences/2br-town-villa/living-room-2', dir: OLD, file: '2022/08/Photo-054.jpg' },
  { id: 'residences/2br-town-villa/dining', dir: OLD, file: '2022/09/Dining-Room-Town-Villa-1024x683-1.jpg' },
  { id: 'residences/2br-town-villa/twin-bedroom', dir: OLD, file: '2022/09/Bedroom-2-2BT-1024x682-2.jpg' },
  { id: 'residences/2br-town-villa/plan', dir: OLD, file: '2022/09/Floor-plan-2BR-Town-Villa.png', drawing: true },

  // 3BR Town Villa (client folder "04 Three Bedroom Villas")
  { id: 'residences/3br-town-villa/living-room', dir: TV3, file: '6I1A8741-HDR.jpg', hero: true, og: 'three-bedroom-town-villa' },
  { id: 'residences/3br-town-villa/living-portrait', dir: TV3, file: '6I1A8747-HDR.jpg' },
  { id: 'residences/3br-town-villa/living-dining', dir: TV3, file: '6I1A8758-HDR.jpg', hero: true },
  { id: 'residences/3br-town-villa/dining', dir: TV3, file: '6I1A8565-HDR.jpg', hero: true },
  { id: 'residences/3br-town-villa/kitchen', dir: TV3, file: '6I1A8626-HDR.jpg' },
  { id: 'residences/3br-town-villa/master-bedroom', dir: TV3, file: '6I1A8695-HDR.jpg', hero: true },
  { id: 'residences/3br-town-villa/master-detail', dir: TV3, file: '6I1A8722-HDR.jpg' },
  { id: 'residences/3br-town-villa/bedroom', dir: TV3, file: '6I1A8692-HDR.jpg' },
  { id: 'residences/3br-town-villa/twin-bedroom', dir: TV3, file: '6I1A8632-HDR.jpg' },
  { id: 'residences/3br-town-villa/hallway', dir: TV3, file: '6I1A8581-HDR.jpg' },
  { id: 'residences/3br-town-villa/study', dir: TV3, file: '6I1A8650-HDR.jpg' },
  { id: 'residences/3br-town-villa/entrance', dir: TV3, file: '6I1A8774-Edit.jpg' },
  { id: 'residences/3br-town-villa/plan', dir: OLD, file: '2022/09/Floor-plan-3BR-Town-VIlla.png', drawing: true },

  // 3BR Executive Villa (walkthrough frames + the old site's one large photo)
  { id: 'residences/3br-executive-villa/living-room', ...frame('3br-executive-villa', 'living-room'), og: 'three-bedroom-executive-villa' },
  { id: 'residences/3br-executive-villa/lounge', dir: OLD, file: '2022/08/Living-Room-3BV.jpg' },
  { id: 'residences/3br-executive-villa/dining-stair', ...frame('3br-executive-villa', 'dining-stair') },
  { id: 'residences/3br-executive-villa/dining', ...frame('3br-executive-villa', 'dining') },
  { id: 'residences/3br-executive-villa/kitchen', ...frame('3br-executive-villa', 'kitchen') },
  { id: 'residences/3br-executive-villa/master-bedroom', ...frame('3br-executive-villa', 'master-bedroom') },
  { id: 'residences/3br-executive-villa/bedroom', ...frame('3br-executive-villa', 'bedroom') },
  { id: 'residences/3br-executive-villa/twin-bedroom', ...frame('3br-executive-villa', 'twin-bedroom') },
  { id: 'residences/3br-executive-villa/backyard', ...frame('3br-executive-villa', 'backyard') },
  { id: 'residences/3br-executive-villa/plan', dir: OLD, file: '2022/08/Floor-plan-4BR-Villa.png', drawing: true },

  // 4BR Executive Villa (walkthrough frames + the old site's one large photo)
  { id: 'residences/4br-executive-villa/living-dining', ...frame('4br-executive-villa', 'living-dining'), og: 'four-bedroom-executive-villa' },
  { id: 'residences/4br-executive-villa/living-room', ...frame('4br-executive-villa', 'living-room') },
  { id: 'residences/4br-executive-villa/kitchen', ...frame('4br-executive-villa', 'kitchen') },
  { id: 'residences/4br-executive-villa/kitchen-garden', ...frame('4br-executive-villa', 'dining') },
  { id: 'residences/4br-executive-villa/master-bedroom', dir: OLD, file: '2022/08/Master-bed.jpg' },
  { id: 'residences/4br-executive-villa/master-suite', ...frame('4br-executive-villa', 'master-suite') },
  { id: 'residences/4br-executive-villa/twin-bedroom', ...frame('4br-executive-villa', 'twin-bedroom') },
  { id: 'residences/4br-executive-villa/vanity', ...frame('4br-executive-villa', 'vanity') },
  { id: 'residences/4br-executive-villa/backyard', ...frame('4br-executive-villa', 'backyard') },
  { id: 'residences/4br-executive-villa/plan', dir: OLD, file: '2022/03/FP_EV_4BR.png', drawing: true },

  // Styled neighbourhood map (rendered by scripts/render-map.mjs)
  { id: 'map/neighborhood', dir: '.cache', root: true, file: 'map/neighborhood.png', plan: true },
  { id: 'map/neighborhood-portrait', dir: '.cache', root: true, file: 'map/neighborhood-portrait.png', plan: true },

  // Clubhouse 360° tour (old site's iPanorama tour; start views from its config)
  { id: 'tour/lobby', dir: OLD, file: '360/Retal-Residence-Clubhouse-09062022_142433.jpg', pano: { yaw: -3.3, pitch: -7.8 } },
  { id: 'tour/entrance', dir: OLD, file: '360/Retal-Clubhouse-entrance-outside.jpg', pano: { yaw: 177.3, pitch: -2.7 } },
  { id: 'tour/restaurant', dir: OLD, file: '360/restaurant360.jpg', pano: { yaw: -156.3, pitch: -7.1 } },
  { id: 'tour/library', dir: OLD, file: '360/Retal-Clubhouse-Common-terrace.jpg', pano: { yaw: -21.8, pitch: -2.9 } },
  { id: 'tour/business-centre', dir: OLD, file: '360/Retal-Clubhouse-Business-centre.jpg', pano: { yaw: 24.2, pitch: -12.4 } },
  { id: 'tour/supermarket', dir: OLD, file: '360/supermarket_retal.jpg', pano: { yaw: -19.4, pitch: -14.8 } },
  { id: 'tour/early-learning', dir: OLD, file: '360/Retal-Clubhouse-Nursery.jpg', pano: { yaw: 139.8, pitch: -8.3 } },
  { id: 'tour/event-hall', dir: OLD, file: '360/Retal-Clubhouse-Event-hall.jpg', pano: { yaw: 141.2, pitch: -0.7 } },
  { id: 'tour/salon', dir: OLD, file: '360/Retal-Clubhouse-Salon.jpg', pano: { yaw: 56.6, pitch: -18.9 } },
  { id: 'tour/spa', dir: OLD, file: '360/Retal-Clubhouse-massage-room.jpg', pano: { yaw: -141.5, pitch: -38 } },
  { id: 'tour/sauna', dir: OLD, file: '360/Retal-Clubhouse-Sauna.jpg', pano: { yaw: -146.4, pitch: -23.8 } },
  { id: 'tour/moroccan-bath', dir: OLD, file: '360/Retal-Clubhouse-Morrocan-bath.jpg', pano: { yaw: -4.7, pitch: -16.2 } },
  { id: 'tour/jacuzzi', dir: OLD, file: '360/Retal-Clubhouse-Jacuzzi.jpg', pano: { yaw: -69, pitch: -9.3 } },
  { id: 'tour/cinema', dir: OLD, file: '360/Retal-Clubhouse-cinema.jpg', pano: { yaw: 59.7, pitch: -7.4 } },
  { id: 'tour/bowling', dir: OLD, file: '360/Retal-Clubhouse-Bowling.jpg', pano: { yaw: -158, pitch: -1.2 } },
  { id: 'tour/billiards', dir: OLD, file: '360/Retal-Clubhouse-Billiard-room.jpg', pano: { yaw: 86.3, pitch: -6.2 } },
  { id: 'tour/games-room', dir: OLD, file: '360/Retal-Clubhouse-game-room.jpg', pano: { yaw: 65.1, pitch: -4.5 } },
  { id: 'tour/play-area', dir: OLD, file: '360/Retal-Clubhouse-kids-park-1.jpg', pano: { yaw: -120.3, pitch: -2.2 } },
  { id: 'tour/play-area-2', dir: OLD, file: '360/Retal-Clubhouse-kids-park-2.jpg', pano: { yaw: -65.8, pitch: 2.6 } },
  { id: 'tour/gym', dir: OLD, file: '360/Retal-Clubhouse-04062022_153555.jpg', pano: { yaw: 13.8, pitch: -10.4 } },
  { id: 'tour/indoor-pool', dir: OLD, file: '360/Retal-Clubhouse-04062022_154455.jpg', pano: { yaw: 29.2, pitch: -4.5 } },
  { id: 'tour/pool-terrace', dir: OLD, file: '360/Retal-Clubhouse-pool-right.jpg', pano: { yaw: 108, pitch: -8 } },
  { id: 'tour/pool-deck', dir: OLD, file: '360/Retal-Clubhouse-pool-left.jpg', pano: { yaw: -82.4, pitch: -13.6 } },
  { id: 'tour/sports-hall', dir: OLD, file: '360/Retal-Clubhouse-basketball-courts.jpg', pano: { yaw: -42.1, pitch: 0.8 } },
  { id: 'tour/squash', dir: OLD, file: '360/Retal-Clubhouse-Squash-courts.jpg', pano: { yaw: 61.3, pitch: -10.2 } },
  { id: 'tour/tennis', dir: OLD, file: '360/tennis_retal.jpg', pano: { yaw: -26.4, pitch: -2 } },
];
