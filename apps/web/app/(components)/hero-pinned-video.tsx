"use client";

import * as React from "react";
import { HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

type HeroPinnedVideoProps = {
  media: HeroMediaConfig;
  title: string;
  overlayContent?: React.ReactNode;
};

export function HeroPinnedVideo({ media, title, overlayContent }: HeroPinnedVideoProps): JSX.Element {
  return (
    <section className="relative isolate min-h-[360px] overflow-hidden rounded-md bg-card/80 sm:min-h-[470px] lg:min-h-[540px]">
      <HeroMedia
        media={media}
        title={title}
        defaultOverlayOpacity={0.04}
        overlayClassName="bg-background/8"
      />
      {overlayContent && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 lg:p-6">
          <div className="pointer-events-auto max-w-[min(92vw,780px)]">{overlayContent}</div>
        </div>
      )}
    </section>
  );
}
