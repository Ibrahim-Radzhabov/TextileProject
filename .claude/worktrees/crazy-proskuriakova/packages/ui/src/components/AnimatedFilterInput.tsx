"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type AnimatedFilterInputProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  filterActive?: boolean;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

const rotatingBorder =
  "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgb(var(--color-accent) / 0.58) 88deg, transparent 176deg, rgb(var(--color-accent) / 0.52) 260deg, transparent 360deg)";
const glowBackground =
  "radial-gradient(circle, rgb(var(--color-accent) / 0.26) 0%, rgb(var(--color-accent) / 0) 72%)";

export const AnimatedFilterInput: React.FC<AnimatedFilterInputProps> = ({
  value,
  onChange,
  placeholder = "Поиск по каталогу...",
  onFilterClick,
  filterActive = false,
  className,
  disabled = false,
  ariaLabel = "Поиск по каталогу"
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isFocused, setIsFocused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const showMotion = !disabled && !prefersReducedMotion && (isFocused || isHovered);

  return (
    <div
      className={["relative", className ?? ""].filter(Boolean).join(" ")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-[12px]"
        style={{ backgroundImage: rotatingBorder }}
        initial={false}
        animate={
          showMotion
            ? { rotate: 360, opacity: 1 }
            : { rotate: 0, opacity: isFocused ? 0.86 : 0.38 }
        }
        transition={
          showMotion
            ? { duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }
            : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
        }
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-[18px]"
        style={{ backgroundImage: glowBackground }}
        initial={false}
        animate={showMotion ? { opacity: 0.5, scale: 1 } : { opacity: 0.16, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative flex h-11 items-center rounded-[11px] border border-border/50 bg-input/92 backdrop-blur-sm">
        <span className="pointer-events-none pl-3 text-muted-foreground">
          <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M11 5a6 6 0 1 0 3.87 10.58L19 19.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className="h-full w-full bg-transparent px-2.5 pr-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/86"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-border/45 text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground"
            aria-label="Очистить поиск"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={onFilterClick}
          disabled={disabled}
          aria-pressed={filterActive}
          aria-label="Показать или скрыть фильтры"
          className={[
            "mr-1 inline-flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors",
            filterActive
              ? "border-accent/75 bg-accent text-white"
              : "border-border/50 bg-card/78 text-foreground hover:border-accent/70 hover:bg-accent hover:text-white"
          ].join(" ")}
        >
          <svg preserveAspectRatio="none" height={16} width={16} viewBox="4.8 4.56 14.832 15.408" fill="none" aria-hidden="true">
            <path
              d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
