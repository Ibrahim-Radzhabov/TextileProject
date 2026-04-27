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
  revealOnReady?: boolean;
};

export const HeroMedia: React.FC<HeroMediaProps> = ({
  media,
  title,
  className,
  assetClassName,
  overlayClassName,
  defaultOverlayOpacity = 0.5,
  revealOnReady = false
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [showPoster, setShowPoster] = React.useState(revealOnReady && Boolean(media.poster));
  const [isNarrowViewport, setIsNarrowViewport] = React.useState(false);
  const [activeVideoSrc, setActiveVideoSrc] = React.useState(media.src);
  const [videoFallbackAttempted, setVideoFallbackAttempted] = React.useState(false);

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

  const shouldRenderVideo = media.type === "video";
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
    setVideoFailed(false);
    setShowPoster(revealOnReady && Boolean(media.poster));
    setVideoFallbackAttempted(false);
  }, [media.type, media.src, media.mobileSrc, media.poster]);

  const primaryVideoSrc = isNarrowViewport && media.mobileSrc ? media.mobileSrc : media.src;
  const fallbackVideoSrc = isNarrowViewport ? media.src : media.mobileSrc;

  React.useEffect(() => {
    if (media.type !== "video") {
      return;
    }

    setActiveVideoSrc(primaryVideoSrc);
    setVideoFallbackAttempted(false);
  }, [media.type, primaryVideoSrc]);

  React.useEffect(() => {
    if (!shouldRenderVideo || videoFailed) {
      return;
    }

    const node = videoRef.current;
    if (!node) {
      return;
    }

    const tryPlay = () => {
      void node.play().catch(() => undefined);
    };

    tryPlay();

    if (node.readyState >= 2) {
      return;
    }

    node.addEventListener("loadedmetadata", tryPlay, { once: true });
    node.addEventListener("loadeddata", tryPlay, { once: true });
    return () => {
      node.removeEventListener("loadedmetadata", tryPlay);
      node.removeEventListener("loadeddata", tryPlay);
    };
  }, [activeVideoSrc, shouldRenderVideo, videoFailed]);

  React.useEffect(() => {
    if (!revealOnReady || !showPoster || videoFailed) {
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      setShowPoster(false);
    }, 2500);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [revealOnReady, showPoster, videoFailed]);

  const fallbackSrc = media.type === "video" ? media.poster ?? media.src : media.src;
  const fallbackAlt = media.alt ?? title;

  return (
    <div
      className={["pointer-events-none absolute inset-0", className ?? ""].join(" ").trim()}
    >
      {shouldRenderVideo ? (
        <>
          {revealOnReady && media.poster && showPoster && !videoFailed && (
            <picture
              className={[
                "absolute inset-0 transition-opacity duration-700",
                showPoster ? "opacity-100" : "opacity-0"
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.poster}
                alt={fallbackAlt}
                className={mergedAssetClassName}
                style={assetStyle}
              />
            </picture>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={media.poster}
            src={activeVideoSrc}
            className={[
              mergedAssetClassName,
              "transition-opacity duration-300",
              revealOnReady
                ? videoFailed
                  ? "opacity-0"
                  : "opacity-100"
                : videoFailed
                  ? "opacity-0"
                  : "opacity-100"
            ].join(" ")}
            style={assetStyle}
            onCanPlay={() => {
              setVideoFailed(false);
              setShowPoster(false);
            }}
            onLoadedData={() => {
              setVideoFailed(false);
              setShowPoster(false);
            }}
            onPlaying={() => {
              setVideoFailed(false);
              setShowPoster(false);
            }}
            onError={() => {
              if (!videoFallbackAttempted && fallbackVideoSrc && fallbackVideoSrc !== activeVideoSrc) {
                setVideoFallbackAttempted(true);
                setVideoFailed(false);
                setShowPoster(true);
                setActiveVideoSrc(fallbackVideoSrc);
                return;
              }

              setVideoFailed(true);
              setShowPoster(true);
            }}
          />
          {videoFailed && (
            <picture>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fallbackSrc}
                alt={fallbackAlt}
                className={mergedAssetClassName}
                style={assetStyle}
              />
            </picture>
          )}
        </>
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
