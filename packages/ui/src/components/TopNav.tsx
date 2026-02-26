import * as React from "react";
import { motion } from "framer-motion";

export type TopNavProps = {
  logo?: {
    src: string;
    alt: string;
  };
  shopName: string;
  rightSlot?: React.ReactNode;
  /** Обёртка для левой части (например Next.js Link). Принимает один child. */
  leftWrapper?: React.ElementType<{ children: React.ReactNode; className?: string }>;
  leftWrapperProps?: Record<string, unknown>;
};

export const TopNav: React.FC<TopNavProps> = ({
  logo,
  shopName,
  rightSlot,
  leftWrapper: LeftWrapper,
  leftWrapperProps
}) => {
  const leftContent = (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-soft-subtle backdrop-blur-sm">
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
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium leading-tight">{shopName}</span>
        <span className="text-[11px] font-normal text-muted-foreground">
          Commerce, distilled.
        </span>
      </div>
    </div>
  );

  return (
    <motion.header
      className="flex items-center justify-between gap-4"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {LeftWrapper ? (
        <LeftWrapper
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl transition-opacity hover:opacity-90"
          {...leftWrapperProps}
        >
          {leftContent}
        </LeftWrapper>
      ) : (
        leftContent
      )}
      {rightSlot && <div className="flex shrink-0 items-center gap-3 text-sm">{rightSlot}</div>}
    </motion.header>
  );
};

