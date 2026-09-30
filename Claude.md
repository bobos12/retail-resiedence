# Retal Residence — Website

This is a new marketing website for **Retal Residence**, a gated luxury residential compound in Al Khobar, Saudi Arabia. It replaces their dated WordPress site at https://retalresidence.com/. The client's brief is `Website Redesign Notes.pdf` in this folder. Its last page has the reference screenshots.

**Priority: ship the site.** Don't write documentation, inventories, design docs or handoff files. Code, content and assets only.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck`
- `npm run optimize:images` regenerates the web images from `_raw-assets/`.

## Stack
- Next.js (latest stable, App Router), TypeScript strict. Use Server Components by default and client components only where there's interaction.
- Tailwind CSS v4. All colors, type sizes, spacing, radii, durations and easings are CSS-variable tokens, with no hardcoded values in components.
- `motion/react` for reveals, page transitions and layout animation. Lenis for smooth scroll.
- next-intl with **English, Arabic (full RTL), French, Italian, Spanish, Chinese and Korean**. Routes are `/en/...`, `/ar/...`, `/fr/...`, `/it/...`, `/es/...`, `/zh/...`, `/ko/...`, default `en`. Use logical properties (`ms-/me-/ps-/pe-/start/end`) and mirror arrows and layouts. All copy goes in the message files. The Arabic must be natural, well-written copy, not literal translation.
- `next/image` for every image. `next/font` with self-hosted fonts.
- Content lives in typed data files under `src/content/` (residences, amenities, neighborhood, contact).
- No UI kits (shadcn default look, MUI, etc.). Every component is custom.

## Assets
- The raw client files live in `_raw-assets/`, which is gitignored. **Never modify or delete them.**
  - Folders: `01 Front Gate`, `02 Clubhouse`, `03 One bedroom Apartment`, `04 Three Bedroom Villas`, `05 Drone Shots`, `05 Outdoors`.
  - Folder names have Drive timestamp suffixes. Folders like **Outdoors and Drone Shots contain mixed content** (exteriors, landscaping, pools, streets, people, amenities).
  - Open and look at the images themselves, and pick the right shot for each section from any folder. Don't go by folder names or filenames.
- **Anything missing from the folders comes from the old site** (https://retalresidence.com/, under `/wp-content/uploads/`):
  - the logo and favicon;
  - floor plans (`Floor-plan-*.png`, `FP_EV_4BR.png`);
  - interiors of the residence types that have no folder (2BR Apt, 3BR Apt, 2BR Town Villa, the other 3BR villa, 4BR Executive Villa).
  - Try the full-size URL first: remove `-1024x683` suffixes, and prefer `/uploads/` over `/elementor/thumbs/`. Old-site photos are low-res, so only use them at card or gallery size, never full-bleed.
- Work out whether `04 Three Bedroom Villas` is the 3BR **Town** Villa or the 3BR **Executive** Villa by comparing it with the old site's galleries.
- **No stock photography, ever.** For the Residents section (schools, shopping, healthcare, community), use real Retal photos that fit each theme. Good candidates are the early learning centre, mini market, clubhouse, pools, courts and anything with people in the folders. If nothing fits a theme, lead with its drive-time fact and an architectural image instead.
- **Every image and video is compressed before use:**
  - `scripts/optimize-images.mjs` (sharp):
    - auto-rotates, strips all metadata (including GPS), converts to sRGB;
    - resizes to max 2560px on the long edge for hero/full-bleed and 1920px for the rest, never upscaling;
    - saves as mozjpeg quality ~80, progressive;
    - targets **≤ 500 KB for hero images and ≤ 250 KB for the rest**, retuning quality for any file over target;
    - outputs clean kebab-case names to `public/images/<category>/`;
    - writes `src/content/image-manifest.json` with width, height and a blur placeholder for each image;
    - skips files it has already processed.
  - Only images the site actually uses get exported.
  - Set `images.formats: ['image/avif','image/webp']` in `next.config`.
  - Video (ffmpeg):
    - 1080p H.264 MP4, CRF ~26, `+faststart`, no audio;
    - plus a WebM version, a 720p mobile version and a poster JPEG;
    - hero loop 10–20 s and **≤ 6 MB**.
  - YouTube embeds load only on click (a facade), with no iframe on page load.

## Client brief (must satisfy)
- **Overall:** a modern, **architectural** aesthetic with generous white space and a refined grid. Use elegant transitions and subtle animation. Present a luxury lifestyle, not a static property listing.
- **Current site's problems to avoid:** dated look, buried content, dark overlays over the photos, and a vertical side nav.
- **Hero:** full-screen premium photo or video, minimal text, strong typography, elegant CTAs, **no icons**.
- **Typography:** large headlines with breathing room and a clear hierarchy: title → subtitle → supporting description.
- **Navigation:** horizontal, logo on the left, links centered or right, an elegant language switcher, **sticky on scroll**.
- **Residents section:** residents' everyday life across schools, shopping, healthcare and community activities.
- **UX:** smooth scroll, parallax image transitions, modern hover states, visual section transitions, fast page transitions, readable text, excellent mobile.
- **The site should convey:** premium living, sophisticated design, community lifestyle, trust and security, architectural excellence.

## Design system
- **Concept:** quiet luxury in the style of an architectural monograph. Stone-white pages, big confident type, photography given room, a precise grid, one accent color.
- **Reference traits to match:**
  - light warm off-white backgrounds, with dark full-bleed sections used as rhythm breaks;
  - large left-aligned neo-grotesk headlines with tight tracking;
  - small uppercase or pill eyebrow labels;
  - stat rows with hairline dividers;
  - numbered lists (`01 …`) that swap an adjacent image on hover;
  - image-first property cards with tag pills, plus a clean data-table view (Name · Type · Size · Beds · →);
  - asymmetric text + image splits and edge-bleeding images;
  - one accent color used sparingly.
- **Color:** derive the palette from the Retal logo. Warm off-white base (not #FFF), deep near-black, one accent for small moments.
- **Type:** one refined neo-grotesk for Latin (General Sans, Satoshi or similar) and a matched Arabic face with equal presence (IBM Plex Sans Arabic, Readex Pro or Alexandria). Test real Arabic headlines before choosing. Use a fluid `clamp()` scale with hero display at ~7–9vw on desktop. Body text 16–18px, line-height 1.5–1.6, max ~65ch.
- **Grid:** 12 columns on desktop, 6 on tablet, 4 on mobile. Sections 120–200px apart on desktop. Use one border radius consistently, if any.
- **Motion:** easing `cubic-bezier(0.22,1,0.36,1)`, 600–1000ms reveals, staggered line reveals on headlines. Parallax of only a few percent, clip/scale image reveals, image hover zoom of 1.03–1.05. Page transitions ≤ 500ms. Honour `prefers-reduced-motion` by turning off parallax and Lenis and keeping simple fades.

### No AI slop (hard rules)
Never use any of these:
- purple/blue gradients, neon, glassmorphism, blurry blobs, mesh backgrounds;
- emoji, or icon-in-circle feature grids;
- centered-everything layouts, or three identical cards as the default answer for every section;
- default-looking Inter/Roboto/Poppins/Montserrat, or `rounded-2xl shadow-lg` on everything;
- full dark overlays on photos, or text placed on busy areas of an image;
- fake stats, testimonials or awards;
- icons in the hero;
- filler copy such as "Elevate", "Unlock", "Seamless", "Nestled", "Epitome", "Where luxury meets".

Write copy like a confident architect: short and concrete, with real numbers.

## Sitemap
- **Header:** transparent over the hero, then solid off-white with a hairline border once the page scrolls. Hides on scroll down and shows on scroll up. The one CTA is "Schedule a visit". On mobile, a full-screen menu with large type.
- **Footer:** a dark section with a closing statement, CTA, address, phone numbers, emails, social links as text or monoline marks, and the language switch.
- **WhatsApp button:** small and tasteful, mirrored in RTL, and shown only after the first scroll.
- `/` **Home**, in this order:
  1. hero
  2. editorial statement
  3. real stats
  4. residences explorer (type tablist, image stage, spec sheet; Gallery · Video · VR tour · Floor plan modals; `#residence-<code>` hash)
  5. Clubhouse (dark section, numbered categories with image swap)
  6. 360° Clubhouse tour (numbered scene list + Photo Sphere Viewer, loaded on "Enter 360°")
  7. Residents / Living
  8. security & services (photography, not an icon grid)
  9. neighborhood map + drive times
  10. parallax gallery band
  11. visit CTA
- `/residences`: filter by Apartments / Town Villas / Executive Villas, with cards + table views.
- `/residences/[slug]` (7 pages, SSG): hero, specs row, features, lightbox gallery (keyboard + swipe), zoomable floor plan, video facade, VR tour, other residences, enquiry CTA pre-filled with this residence.
- `/clubhouse`: every amenity grouped by category, plus the full 360° tour (all 26 scenes, self-hosted).
- `/living`: the residents / community-life page.
- `/neighborhood`: styled map (MapLibre or a styled static map, not a raw Google embed) and drive times.
- `/contact`:
  - Form fields: name, phone (default +966), email, residence interest, preferred date, message. zod validation on client and server, honeypot field, Server Action.
  - Email sending sits behind an interface: Resend via env var, logged to the console in dev.
  - Also show direct phone, WhatsApp and email.
- **Also:**
  - custom 404, `sitemap.xml`, `robots.txt`;
  - per-page metadata and Open Graph images, `hreflang` links;
  - JSON-LD for the residence complex (address, phone, geo) and the organization.

## Content (real facts; tighten the copy but never invent facts)
- **Positioning:** "Welcome to your designer home". Architecturally designed residences with high-quality fittings and interiors. Everything a short stroll away in the Clubhouse. Complete peace of mind through security.
- **Services:** 5-star facilities, supermarket, 24/7 security, housekeeping, laundry.
- **Residences:** all are fully furnished with European appliances, a 1-car garage and internet included.

| Type | m² | Baths | Extras | YouTube | VR tour (tours.affinitypropertybh.com/show/?m=) |
|---|---|---|---|---|---|
| 1BR Apartment | 84 | 2 | — | 4R9OOnZkQCY | bYDVsscxwwF |
| 2BR Apartment | 141 | 3 | — | vf6F2QuF758 | YZcqokVPdpV |
| 3BR Apartment | 174 | 3 | Backyard option | lijO4wYSkCM | CDMXgVbyh49 |
| 2BR Town Villa | 179 | 4 | Servant's quarter, private backyard | YaAouxrsCCY | check old site |
| 3BR Town Villa | 213 | 5 | Servant's quarter, private backyard | YaAouxrsCCY | WuvCPVmhXTY |
| 3BR Executive Villa | 236 | 5 | Servant's quarter, private backyard | 06Q9PyVHp-c | bttTYBDXCZE |
| 4BR Executive Villa | 363 | 7 | Servant's quarter, private backyard | gTDt8KohLpk | STj4UQLYQ56 |

- **Clubhouse:**
  - Dining & services: international restaurant & café, early learning centre, guesthouse, salon & spa, mini market, laundry, business centre.
  - Family: 38-seat cinema, 4-lane bowling alley, library, video games room, billiards, table tennis.
  - Sport: tennis court, gym, indoor & outdoor pools (including a children's pool), multipurpose hall (volleyball, basketball, indoor soccer).
  - 360° tour: https://retalresidence.com/ipanorama/virtualtour/1
- **Drive times:**
  - 3 min British International School (BISAK)
  - 5 min Dhahran Expo
  - 10 min Mall of Dhahran
  - 10 min Khobar Corniche
  - 10 min nearest hospital
  - 25 min Saudi Aramco
  - 30 min King Fahd Causeway to Bahrain
  - 45 min King Fahd International Airport
  - Coordinates ≈ 26.3771, 50.2195.
- **Contact:**
  - Address: Nesaj Real Estate Compound Co., 9268 Salmah Bin Suliman, Al Khubar 34215-3975, KSA.
  - Tel +966 13 825 9600, info@retalresidence.com.
  - Reservations: +966 800 3040 111, +966 56 241 6136 (WhatsApp https://wa.me/966562416136), sales@retalresidence.com.
- **Social:**
  - facebook.com/retalresidence
  - linkedin.com/company/retal-residence
  - x.com/retalresidence
  - instagram.com/retal.residence

## Quality bar
- Works at 360, 390, 768, 1024, 1280, 1440 and 1920px widths in both LTR and RTL. No horizontal scroll. Tap targets ≥ 44px.
- Lighthouse on mobile: Performance ≥ 90, other categories ≥ 95. LCP < 2.5s, CLS < 0.05. Lazy-load everything below the fold.
- WCAG 2.2 AA:
  - keyboard navigation with designed focus states;
  - real alt text written from what each image shows;
  - correct `lang`/`dir` per locale.
- Lint and typecheck clean. No unused dependencies.
- Verify visually: take Playwright screenshots of changed pages at 390px and 1440px in EN and AR. If a section looks generic or templated, redo it.