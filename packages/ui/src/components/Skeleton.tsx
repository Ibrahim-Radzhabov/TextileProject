import * as React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={["skeleton-shimmer rounded-lg bg-muted/40", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
};
