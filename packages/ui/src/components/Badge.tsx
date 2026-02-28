import * as React from "react";

type BadgeTone = "default" | "accent" | "muted" | "danger";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  default: "border-border/60 bg-surface-soft text-foreground",
  accent: "border-accent/55 bg-accent-soft/35 text-accent-contrast",
  muted: "border-border/45 bg-card/45 text-muted-foreground",
  danger: "border-red-400/45 bg-red-500/12 text-red-200"
};

export const Badge: React.FC<BadgeProps> = ({ tone = "default", className, ...props }) => {
  return (
    <span
      className={[
        "inline-flex items-center rounded-pill border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        toneClasses[tone],
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};
