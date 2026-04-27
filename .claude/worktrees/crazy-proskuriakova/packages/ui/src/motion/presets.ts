import type { Transition, Variants } from "framer-motion";

export const easePremium: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const transitionQuick: Transition = {
  duration: 0.24,
  ease: easePremium
};

export const transitionStandard: Transition = {
  duration: 0.38,
  ease: easePremium
};

export const springSmooth: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.95
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.9
};

export const springSharedElement: Transition = {
  type: "spring",
  stiffness: 245,
  damping: 27,
  mass: 0.98
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: easePremium
};

export const gridContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03
    }
  }
};

export const gridItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionStandard
  }
};
