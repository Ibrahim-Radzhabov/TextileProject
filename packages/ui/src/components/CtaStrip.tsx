import * as React from "react";

export type CtaStripProps = {
  title: string;
  href: string;
};

export const CtaStrip: React.FC<CtaStripProps> = ({ title, href }) => {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border/45 bg-card/78 px-5 py-4 transition-colors hover:border-border/75"
    >
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5">
        Перейти
      </span>
    </a>
  );
};
