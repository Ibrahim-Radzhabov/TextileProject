import * as React from "react";
import { Surface } from "./Surface";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, className }) => {
  return (
    <Surface
      tone="subtle"
      className={[
        "flex flex-col items-start gap-3 rounded-2xl border border-border/55 px-5 py-6",
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="space-y-1.5">
        <p className="text-sm font-medium tracking-tight">{title}</p>
        {description && <p className="max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </Surface>
  );
};
