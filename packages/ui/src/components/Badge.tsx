import * as React from "react";

type BadgeTone = "default" | "accent" | "muted" | "danger";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  default: "border-border/60 bg-card/55 text-foreground",
  accent: "border-border/70 bg-foreground/10 text-foreground",
  muted: "border-border/45 bg-card/35 text-muted-foreground",
  danger: "border-red-400/45 bg-red-500/12 text-red-200"
};

export const Badge: React.FC<BadgeProps> = ({ tone = "default", className, ...props }) => {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.05em]",
        toneClasses[tone],
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};
