"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

type HeroPinnedVideoProps = {
  media: HeroMediaConfig;
  title: string;
  overlayContent?: React.ReactNode;
};

export function HeroPinnedVideo({ media, title, overlayContent }: HeroPinnedVideoProps): JSX.Element {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"]
  });

  const mediaX = useTransform(scrollYProgress, [0, 0.5, 1], [-24, 0, 24]);
  const overlayX = useTransform(scrollYProgress, [0, 0.5, 1], [16, 0, -16]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1.04, 1.05]);

  return (
    <section
      ref={rootRef}
      className="relative isolate min-h-[360px] overflow-hidden rounded-md bg-card/80 sm:min-h-[470px] lg:min-h-[540px]"
    >
      <motion.div
        className="absolute inset-0"
        style={
          prefersReducedMotion
            ? undefined
            : {
                x: mediaX,
                scale: mediaScale
              }
        }
      >
        <HeroMedia
          media={media}
          title={title}
          defaultOverlayOpacity={0.04}
          overlayClassName="bg-background/8"
        />
      </motion.div>
      {overlayContent && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5 lg:p-6">
          <motion.div
            className="pointer-events-auto max-w-[min(92vw,780px)]"
            style={prefersReducedMotion ? undefined : { x: overlayX }}
          >
            {overlayContent}
          </motion.div>
        </div>
      )}
    </section>
  );
}
