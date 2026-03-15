"use client";

import * as React from "react";
import styles from "./footer-trust-glow-card.module.css";

type FooterTrustGlowCardProps = {
  title: string;
  text: string;
};

const RETURN_PERCENT = 50;
const FOLLOW_EASING = 0.14;
const STOP_THRESHOLD = 0.24;

export function FooterTrustGlowCard({
  title,
  text
}: FooterTrustGlowCardProps): JSX.Element {
  const cardRef = React.useRef<HTMLElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const targetRef = React.useRef({ x: RETURN_PERCENT, y: RETURN_PERCENT });
  const currentRef = React.useRef({ x: RETURN_PERCENT, y: RETURN_PERCENT });
  const [active, setActive] = React.useState(false);

  const applyGlow = React.useCallback((x: number, y: number) => {
    const node = cardRef.current;
    if (!node) {
      return;
    }

    node.style.setProperty("--glow-x", `${x}%`);
    node.style.setProperty("--glow-y", `${y}%`);
  }, []);

  const animateGlow = React.useCallback(() => {
    rafRef.current = null;

    const nextX = currentRef.current.x + (targetRef.current.x - currentRef.current.x) * FOLLOW_EASING;
    const nextY = currentRef.current.y + (targetRef.current.y - currentRef.current.y) * FOLLOW_EASING;
    currentRef.current = { x: nextX, y: nextY };
    applyGlow(nextX, nextY);

    if (
      Math.abs(targetRef.current.x - nextX) > STOP_THRESHOLD
      || Math.abs(targetRef.current.y - nextY) > STOP_THRESHOLD
    ) {
      rafRef.current = window.requestAnimationFrame(animateGlow);
    }
  }, [applyGlow]);

  const ensureAnimation = React.useCallback(() => {
    if (rafRef.current !== null || typeof window === "undefined") {
      return;
    }

    rafRef.current = window.requestAnimationFrame(animateGlow);
  }, [animateGlow]);

  const updateGlow = React.useCallback((clientX: number, clientY: number) => {
    const node = cardRef.current;
    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    targetRef.current = {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100
    };
    ensureAnimation();
  }, [ensureAnimation]);

  const resetGlow = React.useCallback(() => {
    targetRef.current = { x: RETURN_PERCENT, y: RETURN_PERCENT };
    ensureAnimation();
  }, [ensureAnimation]);

  React.useEffect(() => {
    applyGlow(RETURN_PERCENT, RETURN_PERCENT);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [applyGlow]);

  return (
    <article
      ref={cardRef}
      className={styles.card}
      data-active={active ? "true" : "false"}
      onPointerMove={(event) => updateGlow(event.clientX, event.clientY)}
      onPointerEnter={(event) => {
        setActive(true);
        updateGlow(event.clientX, event.clientY);
      }}
      onPointerLeave={() => {
        setActive(false);
        resetGlow();
      }}
    >
      <div className={styles.inner}>
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{text}</p>
      </div>
    </article>
  );
}
