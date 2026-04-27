import * as React from "react";

export type CtaStripProps = {
  title: string;
  href: string;
};

export const CtaStrip: React.FC<CtaStripProps> = ({ title, href }) => {
  return (
    <div className="border-t border-border py-6">
      <a
        href={href}
        className="ui-button inline-block border-b border-foreground pb-1 text-foreground transition-opacity hover:opacity-60"
      >
        {title}
      </a>
    </div>
  );
};
