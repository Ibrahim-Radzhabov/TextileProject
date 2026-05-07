"use client";

import { Button, HeroMedia, type HeroMediaConfig } from "@store-platform/ui";

type HeroLink = {
  label: string;
  subtitle?: string;
  href: string;
};

type HeroAction = {
  label: string;
  href: string;
};

type HeroVideoSectionProps = {
  media: HeroMediaConfig;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  trustLine?: string;
  quickLinks?: HeroLink[];
  primaryCta?: HeroAction;
  secondaryCta?: HeroAction;
  className?: string;
};

export function HeroVideoSection({
  media,
  title,
  subtitle,
  trustLine,
  quickLinks = [],
  primaryCta,
  secondaryCta,
  className
}: HeroVideoSectionProps): JSX.Element {
  const hasContent = Boolean(
    title || subtitle || trustLine || primaryCta || secondaryCta || quickLinks.length > 0
  );

  return (
    <section
      className={[
        "relative overflow-visible rounded-md border border-border/28 bg-card/80",
        className ?? ""
      ].join(" ").trim()}
    >
      <div
        className="relative min-h-[66svh] overflow-hidden rounded-md sm:min-h-[72svh] lg:min-h-[78svh]"
      >
        <div className="absolute inset-0 origin-center">
          <HeroMedia
            media={media}
            title={title}
            defaultOverlayOpacity={0.02}
            overlayClassName="bg-background/8"
          />
        </div>
      </div>

      {hasContent && (
        <div
          className="px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24 lg:px-8 lg:pb-9 lg:pt-28"
        >
          <div className="mx-auto max-w-3xl space-y-5">
            {title && (
              <h1 className="ui-title-display text-[clamp(1.92rem,7.2vw,4.6rem)] leading-[0.94] text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="ui-subtle text-sm sm:text-base lg:text-lg">
                {subtitle}
              </p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap items-center gap-2">
                {primaryCta && (
                  <Button asChild size="md" ripple>
                    <a href={primaryCta.href}>{primaryCta.label}</a>
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    asChild
                    size="md"
                    ripple
                    className="border-border/52 bg-card/74 text-foreground hover:border-border/70 hover:bg-card/92"
                  >
                    <a href={secondaryCta.href}>{secondaryCta.label}</a>
                  </Button>
                )}
              </div>
            )}
            {trustLine && <p className="ui-subtle text-xs sm:text-sm">{trustLine}</p>}
            {quickLinks.length > 0 && (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="rounded-[8px] border border-border/42 bg-card/62 px-3.5 py-3 transition-colors hover:border-border/62 hover:bg-card/82"
                  >
                    <p className="text-sm font-medium text-foreground/92">{link.label}</p>
                    {link.subtitle && (
                      <p className="mt-1 text-xs text-muted-foreground">{link.subtitle}</p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
