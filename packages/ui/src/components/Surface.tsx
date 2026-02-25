import * as React from "react";

export type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "subtle";
};

export const Surface: React.FC<SurfaceProps> = ({ tone = "default", className, ...props }) => {
  const toneClasses =
    tone === "subtle"
      ? "bg-card/60 border border-border/40 shadow-soft-subtle"
      : "glass-panel shadow-soft";

  return (
    <div
      className={["rounded-xl backdrop-blur-2xl", toneClasses, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};

