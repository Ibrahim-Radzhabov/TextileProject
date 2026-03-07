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
  defaultOverlayOpacity = 0.5,
  revealOnReady = false
}) => {
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [isVideoReady, setIsVideoReady] = React.useState(!revealOnReady);
  const [preferImage, setPreferImage] = React.useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nav = navigator as NavigatorWithConnection;
    setPreferImage(Boolean(nav.connection?.saveData));
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

  const shouldRenderVideo = media.type === "video" && !preferImage;
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
    setIsVideoReady(!revealOnReady);
  }, [media.type, media.src, media.mobileSrc, media.poster]);

  const fallbackSrc = media.type === "video" ? media.poster ?? media.src : media.src;
  const fallbackAlt = media.alt ?? title;

  return (
    <div
      className={["pointer-events-none absolute inset-0", className ?? ""].join(" ").trim()}
    >
      {shouldRenderVideo ? (
        <>
          {revealOnReady && media.poster && !videoFailed && (
            <picture
              className={[
                "absolute inset-0 transition-opacity duration-700",
                isVideoReady ? "opacity-0" : "opacity-100"
              ].join(" ")}
            >
              {media.mobileSrc && <source srcSet={media.mobileSrc} media="(max-width: 768px)" />}
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
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={media.poster}
            className={[
              mergedAssetClassName,
              "transition-opacity duration-300",
              revealOnReady
                ? isVideoReady && !videoFailed
                  ? "opacity-100"
                  : "opacity-0"
                : videoFailed
                  ? "opacity-0"
                  : "opacity-100"
            ].join(" ")}
            style={assetStyle}
            onCanPlay={() => {
              setVideoFailed(false);
              setIsVideoReady(true);
            }}
            onLoadedData={() => {
              setVideoFailed(false);
              setIsVideoReady(true);
            }}
            onError={() => {
              setVideoFailed(true);
              setIsVideoReady(false);
            }}
          >
            {media.mobileSrc && <source src={media.mobileSrc} media="(max-width: 768px)" />}
            <source src={media.src} />
          </video>
          {videoFailed && (
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
