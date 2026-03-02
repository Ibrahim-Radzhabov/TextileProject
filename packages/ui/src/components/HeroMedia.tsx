"use client";

import * as React from "react";

export type HeroMediaConfig = {
  type: "image" | "video";
  src: string;
  mobileSrc?: string;
  poster?: string;
  alt?: string;
  overlayOpacity?: number;
  objectPosition?: string;
  mobileObjectPosition?: string;
};

export type HeroMediaProps = {
  media: HeroMediaConfig;
  title: string;
  className?: string;
  assetClassName?: string;
  overlayClassName?: string;
  defaultOverlayOpacity?: number;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

export const HeroMedia: React.FC<HeroMediaProps> = ({
  media,
  title,
  className,
  assetClassName,
  overlayClassName,
  defaultOverlayOpacity = 0.5
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const [preferImage, setPreferImage] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [isNarrowViewport, setIsNarrowViewport] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const computePreference = () => {
      const nav = navigator as NavigatorWithConnection;
      return motionQuery.matches || Boolean(nav.connection?.saveData);
    };

    const updatePreference = () => {
      setPreferImage(computePreference());
    };

    updatePreference();
    motionQuery.addEventListener("change", updatePreference);
    return () => {
      motionQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const viewportQuery = window.matchMedia("(max-width: 768px)");
    const updateViewport = () => {
      setIsNarrowViewport(viewportQuery.matches);
    };

    updateViewport();
    viewportQuery.addEventListener("change", updateViewport);
    return () => {
      viewportQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window === "undefined") {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.2, rootMargin: "100px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shouldRenderVideo = media.type === "video" && !preferImage && !videoFailed;
  const overlayOpacity = media.overlayOpacity ?? defaultOverlayOpacity;
  const mergedAssetClassName = [assetClassName ?? "h-full w-full object-cover"].join(" ").trim();
  const assetStyle = {
    objectPosition:
      (isNarrowViewport ? media.mobileObjectPosition : media.objectPosition) ??
      media.objectPosition ??
      "center center"
  };
  const mergedOverlayClassName = [
    "absolute inset-0",
    overlayClassName ?? "bg-background"
  ].join(" ").trim();

  React.useEffect(() => {
    if (!shouldRenderVideo || videoReady) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setVideoFailed(true);
    }, 8000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [shouldRenderVideo, videoReady]);

  React.useEffect(() => {
    if (!shouldRenderVideo) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (!isVisible) {
      if (!video.paused) {
        video.pause();
      }
      return;
    }

    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {
        setVideoFailed(true);
      });
    }
  }, [isVisible, shouldRenderVideo]);

  const fallbackSrc = media.type === "video" ? media.poster ?? media.src : media.src;
  const fallbackAlt = media.alt ?? title;

  return (
    <div
      ref={containerRef}
      className={["pointer-events-none absolute inset-0", className ?? ""].join(" ").trim()}
    >
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={media.poster}
          className={mergedAssetClassName}
          style={assetStyle}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          onStalled={() => setVideoFailed(true)}
          onAbort={() => setVideoFailed(true)}
        >
          {media.mobileSrc && <source src={media.mobileSrc} media="(max-width: 768px)" />}
          <source src={media.src} />
        </video>
      ) : (
        <picture>
          {media.mobileSrc && <source srcSet={media.mobileSrc} media="(max-width: 768px)" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fallbackSrc}
            alt={fallbackAlt}
            className={mergedAssetClassName}
            style={assetStyle}
          />
        </picture>
      )}

      <div
        className={mergedOverlayClassName}
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
};
