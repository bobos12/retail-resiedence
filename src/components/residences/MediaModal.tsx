'use client';

import type { Photo } from '@/content/images';
import { Modal } from '@/components/ui/Modal';
import { TourEmbed } from '@/components/ui/TourEmbed';
import { VideoFacade } from './VideoFacade';

export type MediaKind = 'video' | 'tour';

type Props = {
  kind: MediaKind;
  open: boolean;
  onClose: () => void;
  residence: string;
  youtube: string;
  tour?: string;
  poster: Photo;
  labels: { video: string; videoPlay: string; tour: string; tourCta: string; tourHint: string; tourOpen: string; newTab: string };
};

// Video walkthrough or 3D tour in a sheet. Loaded on first use; neither iframe exists
// until the visitor presses play or start inside it.
export default function MediaModal({ kind, open, onClose, residence, youtube, tour, poster, labels }: Props) {
  const title = kind === 'tour' ? labels.tour : labels.video;
  return (
    <Modal open={open} onClose={onClose} title={title} eyebrow={residence}>
      {kind === 'video' && <VideoFacade id={youtube} title={`${labels.video} · ${residence}`} playLabel={labels.videoPlay} poster={poster} />}
      {kind === 'tour' && tour && (
        <TourEmbed
          src={tour}
          title={`${labels.tour} · ${residence}`}
          poster={poster}
          cta={labels.tourCta}
          hint={labels.tourHint}
          openLabel={labels.tourOpen}
          newTabLabel={labels.newTab}
        />
      )}
    </Modal>
  );
}
