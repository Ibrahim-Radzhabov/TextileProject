"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AnnouncementTicker.module.css";

type TickerPhase = "enter" | "hold" | "exit";

export type AnnouncementTickerProps = {
  messages: string[];
  interval?: number;
  transitionMs?: number;
  className?: string;
};

const DEFAULT_INTERVAL = 2100;
const DEFAULT_TRANSITION = 320;

export function AnnouncementTicker({
  messages,
  interval = DEFAULT_INTERVAL,
  transitionMs = DEFAULT_TRANSITION,
  className
}: AnnouncementTickerProps) {
  const safeMessages = useMemo(() => messages.filter((item) => item.trim().length > 0), [messages]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<TickerPhase>("hold");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = () => {
      setReduceMotion(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (safeMessages.length === 0) {
      return;
    }

    setIndex((prev) => {
      if (prev < safeMessages.length) {
        return prev;
      }
      return 0;
    });
  }, [safeMessages]);

  useEffect(() => {
    if (safeMessages.length <= 1) {
      return;
    }

    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (reduceMotion) {
      timerId = setTimeout(() => {
        setIndex((prev) => (prev + 1) % safeMessages.length);
      }, interval);

      return () => {
        if (timerId) clearTimeout(timerId);
      };
    }

    if (phase === "hold") {
      timerId = setTimeout(() => {
        setPhase("exit");
      }, interval);
    } else if (phase === "exit") {
      timerId = setTimeout(() => {
        setIndex((prev) => (prev + 1) % safeMessages.length);
        setPhase("enter");
      }, transitionMs);
    } else if (phase === "enter") {
      timerId = setTimeout(() => {
        setPhase("hold");
      }, 16);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [interval, phase, reduceMotion, safeMessages.length, transitionMs]);

  if (safeMessages.length === 0) {
    return null;
  }

  const currentMessage = safeMessages[index];
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const messageClassName = [
    styles.message,
    reduceMotion ? styles.messageReduced : styles[`message${phase[0].toUpperCase()}${phase.slice(1)}`]
  ].join(" ");

  return (
    <section className={rootClassName} aria-label="Store announcement">
      <div className={styles.inner}>
        <span className={styles.chevron} aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M14 6 8 12l6 6" />
          </svg>
        </span>

        <div className={styles.viewport}>
          <span
            className={messageClassName}
            style={{ ["--ticker-transition-ms" as string]: `${transitionMs}ms` }}
            aria-live="polite"
            aria-atomic="true"
          >
            {currentMessage}
          </span>
        </div>

        <span className={styles.chevron} aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="m10 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </section>
  );
}

export default AnnouncementTicker;
