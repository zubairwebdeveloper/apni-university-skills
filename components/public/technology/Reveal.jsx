"use client";

import { useReducedMotion, motion } from "framer-motion";

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  y = 18,
  once = true,
  amount = 0.2,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y }}
      whileInView={
        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
      }
      viewport={{
        once,
        amount,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
