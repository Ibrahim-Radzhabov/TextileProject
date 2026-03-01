"use client";

import * as React from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  asChild?: boolean;
};

const baseClasses =
  "relative inline-flex items-center justify-center rounded-[10px] border font-medium tracking-tight transition-all duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4.5 text-sm",
  lg: "h-12 px-6 text-base"
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-border/70 bg-foreground text-background hover:border-foreground/80 hover:bg-foreground/92 active:translate-y-px",
  secondary:
    "border-border/60 bg-card/78 text-foreground hover:border-border/75 hover:bg-card/92",
  ghost:
    "border-border/35 bg-transparent text-muted-foreground hover:border-border/60 hover:bg-card/38 hover:text-foreground"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", fullWidth, className, asChild, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? motion.span : motion.button;

    return (
      <Comp
        ref={ref}
        whileTap={{ scale: 0.985 }}
        whileHover={{ y: -1 }}
        className={[
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          fullWidth ? "w-full" : "",
          className ?? ""
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  }
);

Button.displayName = "Button";
