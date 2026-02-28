import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={[
        "h-10 w-full rounded-md border border-border/65 bg-input/80 px-3 text-sm text-foreground shadow-inset transition-all duration-[var(--motion-fast)] outline-none placeholder:text-muted-foreground focus:border-accent/55 focus:ring-2 focus:ring-ring/60",
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

Input.displayName = "Input";
