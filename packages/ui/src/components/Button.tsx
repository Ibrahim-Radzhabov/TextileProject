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
  "relative inline-flex items-center justify-center rounded-lg border font-medium tracking-tight transition-all duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-accent/65 bg-[var(--gradient-accent-soft)] text-accent-contrast shadow-glow hover:border-accent/90 hover:shadow-floating hover:brightness-110 active:translate-y-px",
  secondary:
    "border-border/70 bg-surface-soft text-foreground shadow-inset hover:border-accent/55 hover:bg-surface-strong hover:shadow-soft-subtle",
  ghost:
    "border-border/30 bg-transparent text-muted-foreground hover:border-accent/50 hover:bg-accent-soft/25 hover:text-foreground"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", fullWidth, className, asChild, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? motion.span : motion.button;

    return (
      <Comp
        ref={ref}
        whileTap={{ scale: 0.975 }}
        whileHover={{ y: -1.5 }}
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
