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
  ripple?: boolean;
};

const baseClasses =
  "ui-button relative isolate inline-flex items-center justify-center overflow-hidden rounded-[10px] border transition-all duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5",
  md: "h-11 px-4.5",
  lg: "h-12 px-6 text-base"
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-accent/70 bg-accent text-white hover:border-accent/80 hover:bg-accent/90 active:translate-y-px",
  secondary:
    "border-foreground/20 bg-transparent text-foreground hover:border-foreground/30 hover:bg-foreground/5 active:translate-y-px",
  ghost:
    "border-transparent bg-transparent text-foreground hover:bg-foreground/5 active:translate-y-px"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth,
      className,
      asChild,
      ripple = false,
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    ref
  ) => {
    const Comp: React.ElementType = asChild ? motion.span : motion.button;
    const hostRef = React.useRef<HTMLElement | null>(null);
    const touchHideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const [rippleVisible, setRippleVisible] = React.useState(false);
    const [ripplePosition, setRipplePosition] = React.useState({ x: 0, y: 0, size: 0 });
    const isDisabled = Boolean(props.disabled);

    const rippleToneClass = "bg-black";

    const setRefs = React.useCallback(
      (node: HTMLElement | null) => {
        hostRef.current = node;
        if (typeof ref === "function") {
          ref(node as HTMLButtonElement | null);
          return;
        }
        if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node as HTMLButtonElement | null;
        }
      },
      [ref]
    );

    React.useEffect(() => {
      return () => {
        if (touchHideTimeoutRef.current) {
          clearTimeout(touchHideTimeoutRef.current);
        }
      };
    }, []);

    const scheduleRippleHide = React.useCallback((delayMs: number) => {
      if (touchHideTimeoutRef.current) {
        clearTimeout(touchHideTimeoutRef.current);
      }
      touchHideTimeoutRef.current = setTimeout(() => {
        setRippleVisible(false);
      }, delayMs);
    }, []);

    const updateRippleFromEvent = React.useCallback(
      (event: React.PointerEvent<HTMLElement>) => {
        if (!ripple || isDisabled || event.pointerType === "touch") {
          return;
        }
        const element = hostRef.current;
        if (!element) {
          return;
        }
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        setRipplePosition({
          size,
          x: event.clientX - rect.left - size / 2,
          y: event.clientY - rect.top - size / 2
        });
      },
      [isDisabled, ripple]
    );

    const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
      onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>);
      updateRippleFromEvent(event);
      if (!ripple || isDisabled || event.pointerType === "touch") {
        return;
      }
      setRippleVisible(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
      onPointerMove?.(event as React.PointerEvent<HTMLButtonElement>);
      if (!ripple || isDisabled || event.pointerType === "touch" || !rippleVisible) {
        return;
      }
      updateRippleFromEvent(event);
    };

    const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>);
      if (!ripple || isDisabled || event.pointerType === "touch") {
        return;
      }
      updateRippleFromEvent(event);
      setRippleVisible(false);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
      onPointerDown?.(event as React.PointerEvent<HTMLButtonElement>);
      if (!ripple || isDisabled) {
        return;
      }
      updateRippleFromEvent(event);
      setRippleVisible(true);
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        scheduleRippleHide(460);
      }
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
      onPointerUp?.(event as React.PointerEvent<HTMLButtonElement>);
      if (!ripple || isDisabled) {
        return;
      }
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        scheduleRippleHide(120);
      }
    };

    const handlePointerCancel = (event: React.PointerEvent<HTMLElement>) => {
      onPointerCancel?.(event as React.PointerEvent<HTMLButtonElement>);
      if (!ripple || isDisabled) {
        return;
      }
      scheduleRippleHide(0);
    };

    return (
      <Comp
        ref={setRefs}
        whileTap={{ scale: 0.985 }}
        whileHover={{ y: -1 }}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
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
        {ripple && (
          <motion.span
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 rounded-full ${rippleToneClass}`}
            initial={false}
            animate={{
              opacity: rippleVisible ? 0.92 : 0,
              scale: rippleVisible ? 1 : 0.2,
              x: ripplePosition.x,
              y: ripplePosition.y
            }}
            transition={
              rippleVisible
                ? { duration: 0.58, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.42, ease: [0.4, 0, 0.2, 1] }
            }
            style={{ width: ripplePosition.size, height: ripplePosition.size }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </Comp>
    );
  }
);

Button.displayName = "Button";
