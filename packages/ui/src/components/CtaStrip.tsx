import * as React from "react";

export type CtaStripProps = {
  title: string;
  href: string;
};

export const CtaStrip: React.FC<CtaStripProps> = ({ title, href }) => {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 shadow-soft-subtle transition-colors hover:border-accent/60"
    >
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5">
        Перейти
      </span>
    </a>
  );
};
