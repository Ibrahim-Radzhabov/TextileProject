import * as React from "react";

export type TopNavProps = {
  logo?: {
    src: string;
    alt: string;
  };
  shopName: string;
  rightSlot?: React.ReactNode;
};

export const TopNav: React.FC<TopNavProps> = ({ logo, shopName, rightSlot }) => {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-soft-subtle">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-6 w-6 rounded-xl object-cover"
            />
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              SP
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">{shopName}</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            Commerce, distilled.
          </span>
        </div>
      </div>
      {rightSlot && <div className="flex items-center gap-3 text-sm">{rightSlot}</div>}
    </header>
  );
};

