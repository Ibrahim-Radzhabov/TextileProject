"use client";

import * as React from "react";
import styles from "./favorite-toggle-button.module.css";

export type FavoriteToggleButtonProps = {
  active: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  addLabel: string;
  removeLabel: string;
  className?: string;
  testId?: string;
  placement?: "overlay" | "inline";
  tone?: "default" | "bare";
};

const BOOKMARK_PATH = "M5 3h14v18l-7-5-7 5V3z";

export const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  active,
  onClick,
  addLabel,
  removeLabel,
  className,
  testId,
  placement = "overlay",
  tone = "default"
}) => {
  const [burstKey, setBurstKey] = React.useState(0);
  const [bursting, setBursting] = React.useState(false);
  const previousActiveRef = React.useRef(active);

  React.useEffect(() => {
    const wasActive = previousActiveRef.current;
    previousActiveRef.current = active;

    if (!wasActive && active) {
      setBurstKey((value) => value + 1);
      setBursting(true);
    }
  }, [active]);

  React.useEffect(() => {
    if (!bursting) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBursting(false);
    }, 430);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bursting, burstKey]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? removeLabel : addLabel}
      data-testid={testId}
      data-active={active ? "true" : "false"}
      data-burst={bursting ? "true" : "false"}
      data-placement={placement}
      data-tone={tone}
      className={[styles.button, className ?? ""].filter(Boolean).join(" ")}
    >
      <span className={styles.icon}>
        <svg viewBox="0 0 24 24" className={styles.outline} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d={BOOKMARK_PATH} />
        </svg>

        <svg
          key={`filled-${burstKey}-${active ? "on" : "off"}`}
          viewBox="0 0 24 24"
          className={styles.filled}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d={BOOKMARK_PATH} />
        </svg>
      </span>

      <svg
        key={`burst-${burstKey}`}
        viewBox="0 0 44 44"
        className={styles.celebrate}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line className={styles.ray} x1="22" y1="4.5" x2="22" y2="10.5" />
        <line className={styles.ray} x1="34.5" y1="9.5" x2="30.2" y2="13.8" />
        <line className={styles.ray} x1="39.5" y1="22" x2="33.5" y2="22" />
        <line className={styles.ray} x1="34.5" y1="34.5" x2="30.2" y2="30.2" />
        <line className={styles.ray} x1="22" y1="39.5" x2="22" y2="33.5" />
        <line className={styles.ray} x1="9.5" y1="34.5" x2="13.8" y2="30.2" />
        <line className={styles.ray} x1="4.5" y1="22" x2="10.5" y2="22" />
        <line className={styles.ray} x1="9.5" y1="9.5" x2="13.8" y2="13.8" />
      </svg>
    </button>
  );
};
