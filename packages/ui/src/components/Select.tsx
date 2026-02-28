import * as React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={[
          "h-10 w-full rounded-md border border-border/65 bg-input/80 px-3 text-sm text-foreground shadow-inset transition-all duration-[var(--motion-fast)] outline-none focus:border-accent/55 focus:ring-2 focus:ring-ring/60",
          className ?? ""
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
