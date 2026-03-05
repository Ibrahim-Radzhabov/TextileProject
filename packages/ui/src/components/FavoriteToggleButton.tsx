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
};

const HEART_PATH =
  "M12 20.2C8.8 17.7 5 14.6 5 10.6C5 8.4 6.7 6.8 8.8 6.8C10.1 6.8 11.3 7.4 12 8.4C12.7 7.4 13.9 6.8 15.2 6.8C17.3 6.8 19 8.4 19 10.6C19 14.6 15.2 17.7 12 20.2Z";

export const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  active,
  onClick,
  addLabel,
  removeLabel,
  className,
  testId
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
      className={[styles.button, className ?? ""].filter(Boolean).join(" ")}
    >
      <span className={styles.icon}>
        <svg viewBox="0 0 24 24" className={styles.outline} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d={HEART_PATH} />
        </svg>

        <svg
          key={`filled-${burstKey}-${active ? "on" : "off"}`}
          viewBox="0 0 24 24"
          className={styles.filled}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d={HEART_PATH} />
        </svg>
      </span>

      <span key={`ring-${burstKey}`} className={styles.ring} aria-hidden="true" />

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
