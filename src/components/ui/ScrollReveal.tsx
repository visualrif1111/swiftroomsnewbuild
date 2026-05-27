"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}

export default function ScrollReveal({ children, delay = 0, direction = "up", className }: Props) {
  const [isTouch, setIsTouch] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const controls = useAnimation();

  useEffect(() => {
    // Touch devices get zero animation — eliminates will-change compositor layers
    // and IntersectionObserver overhead that cause scroll lag on mobile
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!isTouch && inView) {
      controls.start({ opacity: 1, y: 0, x: 0 });
    }
  }, [inView, controls, isTouch]);

  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  const initial = {
    opacity: 0,
    y: direction === "up" ? 20 : 0,
    x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={controls}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
