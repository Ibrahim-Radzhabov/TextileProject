import * as React from "react";

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "subtle" | "elevated" | "ghost";
};

const toneClasses: Record<NonNullable<SurfaceProps["tone"]>, string> = {
  default: "glass-panel shadow-soft",
  subtle: "border border-border/45 bg-surface-soft shadow-soft-subtle backdrop-blur-xl",
  elevated: "glass-panel-strong border border-border/70 shadow-floating",
  ghost: "border border-border/35 bg-card/40 backdrop-blur-lg shadow-inset"
};

export const Surface: React.FC<SurfaceProps> = ({ tone = "default", className, ...props }) => {
  const currentToneClass = toneClasses[tone];

  return (
    <div
      className={["rounded-xl", currentToneClass, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};
