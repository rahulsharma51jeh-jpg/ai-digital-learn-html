"use client";

import { youtubeEmbedUrl } from "@/lib/utils";

export function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-card">
      <iframe
        key={videoId}
        className="absolute inset-0 h-full w-full"
        src={youtubeEmbedUrl(videoId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
