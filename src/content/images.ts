import manifest from './image-manifest.json';

export type ImageId = keyof typeof manifest;

export type ImageData = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};

/** Image data plus its localized alt text; safe to pass to client components. */
export type Photo = ImageData & { alt: string; caption?: string };

export function getImage(id: ImageId): ImageData {
  const { src, width, height, blurDataURL } = manifest[id];
  return { src, width, height, blurDataURL };
}

export function ogImage(id: ImageId): string | undefined {
  const entry = manifest[id] as { og?: string };
  return entry.og;
}

/** Resolve an image with its alt text from the `images` message namespace. */
export function photo(id: ImageId, alt: (key: string) => string): Photo {
  return { ...getImage(id), alt: alt(id) };
}

/** A residence photo captioned with its room name (the last part of its id, in the `rooms` namespace). */
export function roomPhoto(id: ImageId, alt: (key: string) => string, room: (key: string) => string): Photo {
  return { ...photo(id, alt), caption: room(id.slice(id.lastIndexOf('/') + 1)) };
}
