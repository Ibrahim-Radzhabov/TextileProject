import * as React from "react";

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "subtle" | "elevated" | "ghost";
};

const toneClasses: Record<NonNullable<SurfaceProps["tone"]>, string> = {
  default: "glass-panel",
  subtle: "border border-border/32 bg-card/82 backdrop-blur-lg",
  elevated: "glass-panel-strong",
  ghost: "border border-border/22 bg-card/64 backdrop-blur-md"
};

export const Surface: React.FC<SurfaceProps> = ({ tone = "default", className, ...props }) => {
  const currentToneClass = toneClasses[tone];

  return (
    <div
      className={["rounded-[var(--radius-lg)]", currentToneClass, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};
